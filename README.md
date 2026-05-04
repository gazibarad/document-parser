# 📄 Document Extraction & Validation System

A React-based document processing tool that extracts structured data from **PDF, CSV, and TXT files**, validates it, and allows manual review before final approval. All data is stored locally using `localStorage`.

---

## 🚀 Features

### 📂 File Processing
Supports:
- PDF (pdfjs-dist)
- CSV (papaparse)
- TXT (plain text)

Files are converted into raw text for extraction.

---

### 🧠 Data Extraction
Extracts:
- Document type (invoice, purchase order, etc.)
- Supplier / vendor
- Document number
- Issue date
- Due date
- Currency
- Line items (description, quantity, unit price, totals)
- Subtotal, tax, total

Uses rule-based parsing with fallback logic for messy real-world formats.

---

### 🔍 Validation Engine
Validates:
- Required fields
- Date correctness
- Line item structure
- Subtotal + tax consistency
- Total accuracy

Invalid documents are flagged for review.

---

### 🧾 Review Workflow
Users can:
- Review extracted data
- Edit fields
- Edit line items
- Confirm validation
- Reject documents

---

### 💾 Persistent Storage
Uses `localStorage` to store:
- Documents
- Extracted data
- Validation results
- Final edits

Data is automatically restored on app load.

---

### 🚫 Duplicate Prevention
Prevents duplicate uploads using:

fileSignature = name + size + lastModified

If a duplicate is detected, upload is blocked with a warning.

---

### 📊 Dashboard
Shows:
- All documents
- Status (uploaded / needs review / validated / rejected)
- Currency totals

---

## 🧱 Tech Stack

- React (Hooks + useReducer)
- PDF.js (pdfjs-dist)
- PapaParse (CSV parsing)
- localStorage
- CSS / Tailwind (depending on setup)

---

## 📂 Project Structure

src/
- components/
  - Dashboard.jsx
  - ReviewDocument.jsx
- utils/
  - documentProcessing.js
  - reducer.js
  - storage.js
- App.jsx
- App.css

---

## ⚙️ How It Works

1. Upload file (PDF / CSV / TXT)
2. Convert file to text
3. Extract structured data
4. Validate extracted data
5. Store in state + localStorage
6. Allow manual review

---

## 🔐 Duplicate Protection

Each file is identified using:

name + size + lastModified

This prevents re-uploading the same file.

---

## 📦 Installation

npm install  
npm run dev

---

## 📌 Future Improvements

- Content-based hashing for duplicates
- Advanced table extraction
- Export to Excel / accounting tools
- Backend sync
- Multi-user support

---

## 🧠 Design Philosophy

- Local-first processing
- Fast extraction
- Minimal backend dependency
- Manual validation for accuracy

---

## 📄 License

MIT