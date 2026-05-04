const DEBUG_EXTRACTION = import.meta.env.DEV;

/* ---------------- NORMALIZATION ---------------- */
const normalizeText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n +/g, "\n")
    .trim();

/* ---------------- PARSERS ---------------- */
const parseNumber = (value) => {
  if (value == null) return 0;

  const cleaned = String(value)
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");

  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parseLines = (text) =>
  text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

/* ---------------- DETECTION ---------------- */
const detectDocumentType = (text) => {
  if (/\b(purchase order|po)\b/i.test(text)) return "purchase order";
  if (/\b(invoice|inv)\b/i.test(text)) return "invoice";
  return "unknown";
};

/* ---------------- FIELD EXTRACTION ---------------- */
const extractField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
};

const extractFieldFromLines = (lines, patterns) => {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
  }
  return "";
};

/* ---------------- LINE ITEMS (ROBUST) ---------------- */
const extractLineItems = (text) => {
  const lines = parseLines(text);
  const items = [];

  const isMeta = (line) =>
    /^(invoice|inv|number|no\.?|date|due|supplier|company|bill|ship|address)/i.test(
      line,
    );

  const isSummary = (line) =>
    /(subtotal|total|tax|vat|gst|amount|balance)/i.test(line);

  const isHeader = (line) =>
    /(description|qty|quantity|unit|price)/i.test(line);

  for (const line of lines) {
    if (isMeta(line) || isSummary(line) || isHeader(line)) continue;

    const matches = [...line.matchAll(/-?\d+[.,]?\d*/g)];
    const numbers = matches.map((m) => parseNumber(m[0]));

    // ❌ REQUIRE at least 2 numbers (but we’ll validate unit price)
    if (numbers.length < 2) continue;

    const firstNumberIndex = matches[0].index;
    const description = line.slice(0, firstNumberIndex).trim();

    if (!description || description.length < 3) continue;

    let quantity = 1;
    let unitPrice = 0;
    let total = 0;

    if (numbers.length >= 3) {
      quantity = numbers[numbers.length - 3];
      unitPrice = numbers[numbers.length - 2];
      total = numbers[numbers.length - 1];
    } else {
      // 2 numbers → must infer unit price
      const a = numbers[0];
      const b = numbers[1];

      // try interpreting as qty + total
      if (a > 0 && b > 0) {
        quantity = a;
        total = b;
        unitPrice = b / a;
      }
    }

    // HARD FILTER: must have a believable unit price
    if (!unitPrice || unitPrice <= 0) continue;

    // optional: reject insane unit prices (protect against invoice numbers etc.)
    if (unitPrice > 1_000_000) continue;

    // optional: quantity sanity
    if (quantity <= 0 || quantity > 100000) continue;

    items.push({
      description,
      quantity,
      unitPrice,
      price: unitPrice,
      total,
    });
  }

  return items;
};
/* ---------------- CURRENCY ---------------- */
const extractCurrency = (text) => {
  const explicit = extractField(text, [/\b(USD|EUR|GBP|JPY|BAM)\b/i]);

  if (explicit) return explicit.toUpperCase();

  if (/\bKM\b/i.test(text)) return "BAM";
  if (/\$/i.test(text)) return "USD";
  if (/€/i.test(text)) return "EUR";
  if (/£/i.test(text)) return "GBP";
  if (/¥/i.test(text)) return "JPY";

  return "";
};

/* ---------------- EXTRACTION ---------------- */
export const extractData = (text) => {
  const normalized = normalizeText(text);
  const lines = parseLines(normalized);

  const documentType = detectDocumentType(normalized);

  const supplier = extractField(normalized, [
    /(?:supplier|vendor|company|from|bill to|bill from)\s*[:\-]?\s*([^\n]+)/i,
  ]);

  const documentNumber = extractField(normalized, [
    /\b(?:number|no|#)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
    /\b(INV-[A-Z0-9\-\/]+)\b/i,
  ]);

  const issueDate = extractFieldFromLines(lines, [
    /(?:invoice date|issue date|date)\s*[:\-]?\s*([0-9./-]+)/i,
  ]);

  const dueDate = extractFieldFromLines(lines, [
    /(?:due date|payment due)\s*[:\-]?\s*([0-9./-]+)/i,
  ]);

  const currency = extractCurrency(normalized);
  const lineItems = extractLineItems(normalized);

  let subtotal = extractFieldFromLines(lines, [
    /\bsub\s*total\b\s*[:\-]?\s*([0-9.,]+)/i,
  ]);

  const tax = extractFieldFromLines(lines, [
    /\b(?:tax|vat|gst)\b.*?([0-9]+(?:[.,][0-9]+)?)\s*$/i,
  ]);

  const total = extractFieldFromLines(lines, [
    /\bgrand total\b\s*[:\-]?\s*([0-9.,]+)/i,
    /(?<!sub)\btotal\b\s*[:\-]?\s*([0-9.,]+)/i,
  ]);

  /* ---------------- FALLBACKS ---------------- */
  if (!subtotal && tax && total) {
    subtotal = String(parseNumber(total) - parseNumber(tax));
  }

  if (!subtotal && lineItems.length > 0) {
    subtotal = String(
      lineItems.reduce(
        (sum, item) => sum + (item.total || item.unitPrice * item.quantity),
        0,
      ),
    );
  }

  const result = {
    documentType,
    supplier,
    documentNumber,
    issueDate,
    dueDate,
    currency,
    lineItems,
    subtotal,
    tax,
    total,
    rawText: text,
  };

  if (DEBUG_EXTRACTION) {
    console.log("[EXTRACTED]", result);
  }

  return result;
};

/* ---------------- VALIDATION ---------------- */
const isValidDate = (value) => {
  if (!value) return false;

  const cleaned = value.trim().replace(/\.$/, "").replace(/\s+/g, "");

  let y, m, d;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    [y, m, d] = cleaned.split("-").map(Number);
  } else {
    const normalized = cleaned.replace(/[./-]/g, "/");
    const parts = normalized.split("/").filter(Boolean);

    if (parts.length !== 3) return false;

    // assume D.M.YYYY
    [d, m, y] = parts.map(Number);
  }

  if (!Number.isInteger(y) || y < 1900 || y > 2100) return false;
  if (!Number.isInteger(m) || m < 1 || m > 12) return false;
  if (!Number.isInteger(d) || d < 1 || d > 31) return false;

  const date = new Date(y, m - 1, d);

  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};

export const validateData = (data) => {
  const errors = [];

  if (!data.documentType || data.documentType === "unknown") {
    errors.push({
      field: "documentType",
      message: "Document type not detected",
    });
  }

  if (!data.supplier) {
    errors.push({ field: "supplier", message: "Supplier missing" });
  }

  if (!data.documentNumber) {
    errors.push({
      field: "documentNumber",
      message: "Document number missing",
    });
  }

  if (!data.issueDate) {
    errors.push({ field: "issueDate", message: "Issue date missing" });
  }

  if (data.issueDate && !isValidDate(data.issueDate)) {
    errors.push({ field: "issueDate", message: "Invalid date" });
  }

  if (data.dueDate && !isValidDate(data.dueDate)) {
    errors.push({ field: "dueDate", message: "Invalid date" });
  }

  if (!data.currency) {
    errors.push({ field: "currency", message: "Currency missing" });
  }

  if (!data.lineItems?.length) {
    errors.push({ field: "lineItems", message: "No items found" });
  }

  if (!data.total) {
    errors.push({ field: "total", message: "Total missing" });
  }

  if (data.lineItems?.length) {
    const lineSum = data.lineItems.reduce(
      (s, i) => s + (i.total || i.unitPrice * i.quantity),
      0,
    );

    const subtotal = parseNumber(data.subtotal);
    const tax = parseNumber(data.tax);
    const total = parseNumber(data.total);

    const computedTotal = subtotal + tax;

    if (subtotal > 0 && Math.abs(lineSum - subtotal) > 0.5) {
      errors.push({
        field: "lineItems",
        message: "Line items do not match subtotal",
      });
    }

    if (total > 0 && Math.abs(computedTotal - total) > 0.5) {
      errors.push({
        field: "total",
        message: `Subtotal + tax (${computedTotal.toFixed(
          2,
        )}) does not match total (${total.toFixed(2)})`,
      });
    }
  }

  return errors;
};

/* ---------------- TOTALS ---------------- */
export const getTotalsByCurrency = (documents) =>
  documents
    .filter((d) => d.status === "validated")
    .reduce((acc, d) => {
      const cur = d.finalData.currency;
      acc[cur] = (acc[cur] || 0) + parseNumber(d.finalData.total);
      return acc;
    }, {});
