import { validateData } from "./documentProcessing";

export const initialState = {
  documents: [],
  currentDocumentId: null,
  currentView: "dashboard",
};

/* ---------------- HELPERS ---------------- */
const normalizeFinalData = (data) => ({
  ...data,
  subtotal: data.subtotal ?? "",
  tax: data.tax ?? "",
  total: data.total ?? "",
  lineItems: (data.lineItems || []).map((item) => ({
    description: item.description || "",
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
  })),
});

/* ---------------- REDUCER ---------------- */
export function reducer(state, action) {
  switch (action.type) {
    case "LOAD_DOCUMENTS":
      return {
        ...state,
        documents: action.payload.map((doc) => ({
          ...doc,
          finalData: normalizeFinalData(doc.finalData),
          validationErrors: validateData(doc.finalData),
        })),
      };

    case "ADD_DOCUMENT": {
      const doc = {
        ...action.payload,
        finalData: normalizeFinalData(action.payload.finalData),
      };

      return {
        ...state,
        documents: [
          ...state.documents,
          {
            ...doc,
            validationErrors: validateData(doc.finalData),
          },
        ],
      };
    }

    case "SET_VIEW":
      return {
        ...state,
        currentView: action.view,
        currentDocumentId: action.documentId || null,
      };

    case "UPDATE_DOCUMENT": {
      const { id, updater } = action;

      return {
        ...state,
        documents: state.documents.map((doc) => {
          if (doc.id !== id) return doc;

          const updatedFinalData = normalizeFinalData(updater(doc.finalData));

          const validationErrors = validateData(updatedFinalData);

          return {
            ...doc,
            finalData: updatedFinalData,
            validationErrors,
            status: validationErrors.length ? "needs_review" : "uploaded",
          };
        }),
      };
    }

    case "SET_STATUS":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.id
            ? {
                ...doc,
                status: action.status,
                validationErrors:
                  action.status === "validated" ? [] : doc.validationErrors,
              }
            : doc,
        ),
      };

    default:
      return state;
  }
}
