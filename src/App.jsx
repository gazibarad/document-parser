import { useReducer, useEffect, useState, useMemo, useRef } from "react";
import "./App.css";

import Papa from "papaparse";

import Dashboard from "./components/Dashboard.jsx";
import ReviewDocument from "./components/ReviewDocument.jsx";

import {
  extractData,
  validateData,
  getTotalsByCurrency,
} from "./utils/documentProcessing.js";

import { loadDocuments, saveDocuments } from "./utils/storage.js";
import { reducer, initialState } from "./utils/reducer.js";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

/* ---------------- PDF HELPERS ---------------- */
function buildTextLines(items) {
  const rows = items.map((item) => {
    const t = item.transform || [];
    return { x: t[4] || 0, y: t[5] || 0, str: item.str };
  });

  rows.sort((a, b) => {
    const dy = b.y - a.y;
    if (Math.abs(dy) > 2) return dy;
    return a.x - b.x;
  });

  const grouped = [];
  let current = [];
  let currentY = null;

  for (const row of rows) {
    if (currentY === null || Math.abs(row.y - currentY) > 2) {
      current = [row];
      grouped.push(current);
      currentY = row.y;
    } else {
      current.push(row);
    }
  }

  return grouped.map((g) =>
    g
      .map((i) => i.str)
      .join(" ")
      .trim(),
  );
}

/* ---------------- APP ---------------- */
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [uploadMessage, setUploadMessage] = useState("");

  const didHydrate = useRef(false);
  const lastFileRef = useRef(null);

  /* ---------------- LOAD (HYDRATION) ---------------- */
  useEffect(() => {
    const docs = loadDocuments();

    dispatch({
      type: "LOAD_DOCUMENTS",
      payload: docs,
    });

    requestAnimationFrame(() => {
      didHydrate.current = true;
    });
  }, []);

  /* ---------------- SAVE ---------------- */
  useEffect(() => {
    if (!didHydrate.current) return;
    saveDocuments(state.documents);
  }, [state.documents]);

  /* ---------------- DERIVED STATE ---------------- */
  const currentDocument = useMemo(
    () => state.documents.find((d) => d.id === state.currentDocumentId) || null,
    [state.documents, state.currentDocumentId],
  );

  const totals = useMemo(
    () => getTotalsByCurrency(state.documents),
    [state.documents],
  );

  /* ---------------- FILE HANDLING ---------------- */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const signature = `${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`;

    const exists = state.documents.some(
      (doc) => doc.fileSignature === signature,
    );

    if (exists) {
      setUploadMessage("⚠️ This document was already uploaded.");
      e.target.value = null;
      return;
    }

    setUploadMessage("");
    setFile(selectedFile);
  };

  function extractDocumentNumber(text) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const match = lines[i].match(/([A-Z]+-\d+)/i);
      if (match) return match[1];
    }

    return null;
  }

  const processFile = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setUploadMessage("");

    try {
      let text = "";
      const type = file.type;
      const fileName = file.name?.toLowerCase() || "";

      const isCSV = type === "text/csv" || fileName.endsWith(".csv");

      if (type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: buffer }).promise;

        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const lines = buildTextLines(content.items);
          pages.push(lines.join("\n"));
        }

        text = pages.join("\n\n");
      } else if (isCSV) {
        const raw = await file.text();

        const parsed = Papa.parse(raw, {
          skipEmptyLines: true,
        });

        if (parsed.errors?.length) {
          console.warn("CSV parse errors:", parsed.errors);
        }

        text = parsed.data.map((row) => row.join(" ")).join("\n");
      } else {
        text = await file.text();
      }

      const data = extractData(text);

      const docNumberFromHeader = extractDocumentNumber(text);

      if (docNumberFromHeader) {
        data.documentNumber = data.documentNumber || docNumberFromHeader;
      }

      const errors = validateData(data);

      const signature = `${file.name}-${file.size}-${file.lastModified}`;

      const doc = {
        id: Date.now(),
        fileName: file.name,
        extractedData: data,
        fileSignature: signature,
        finalData: data,
        validationErrors: errors,
        status: errors.length > 0 ? "needs_review" : "uploaded",
      };

      dispatch({ type: "ADD_DOCUMENT", payload: doc });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------- NAVIGATION ---------------- */
  const reviewDocument = (doc) => {
    dispatch({
      type: "SET_VIEW",
      view: "review",
      documentId: doc.id,
    });
  };

  const backToDashboard = () => {
    dispatch({ type: "SET_VIEW", view: "dashboard" });
  };

  /* ---------------- UPDATE HANDLERS ---------------- */
  const updateFinalData = (field, value) => {
    dispatch({
      type: "UPDATE_DOCUMENT",
      id: state.currentDocumentId,
      updater: (data) => ({
        ...data,
        [field]: value,
      }),
    });
  };

  const updateLineItem = (index, field, value) => {
    dispatch({
      type: "UPDATE_DOCUMENT",
      id: state.currentDocumentId,
      updater: (data) => {
        const items = [...data.lineItems];

        items[index] = {
          ...items[index],
          [field]:
            field === "quantity" || field === "price" ? Number(value) : value,
        };

        return { ...data, lineItems: items };
      },
    });
  };

  /* ---------------- STATUS ACTIONS ---------------- */
  const confirmValidated = () => {
    dispatch({
      type: "SET_STATUS",
      id: state.currentDocumentId,
      status: "validated",
    });
    backToDashboard();
  };

  const rejectDocument = () => {
    dispatch({
      type: "SET_STATUS",
      id: state.currentDocumentId,
      status: "rejected",
    });
    backToDashboard();
  };

  /* ---------------- RENDER ---------------- */
  if (state.currentView === "review" && currentDocument) {
    return (
      <ReviewDocument
        currentDocument={currentDocument}
        onBack={backToDashboard}
        onUpdateFinalData={updateFinalData}
        onUpdateLineItem={updateLineItem}
        onConfirmValidated={confirmValidated}
        onRejectDocument={rejectDocument}
      />
    );
  }

  return (
    <Dashboard
      documents={state.documents}
      totals={totals}
      onFileChange={handleFileChange}
      onProcessFile={processFile}
      onReviewDocument={reviewDocument}
      isProcessing={isProcessing}
      hasFile={!!file}
      uploadMessage={uploadMessage}
    />
  );
}

export default App;
