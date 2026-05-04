# 📄 Document Extraction & Validation System

A web application that extracts, validates, and allows editing of structured data from uploaded documents.

This project is designed as an internal business tool for automating document processing workflows, simulating a lightweight document ingestion and validation system.

---

# 🎯 Purpose

The goal of this application is to solve a real business problem:  
reducing manual work in document handling by automating extraction and validation of structured data from uploaded files.

It demonstrates how unstructured documents can be transformed into structured, reviewable data using a frontend-first pipeline.

---

# ⚙️ Architecture Overview

File Upload  
→ File Parser (PDF / CSV / TXT)  
→ Text Normalization  
→ Data Extraction Layer  
→ Validation Engine  
→ Manual Review Interface  
→ localStorage Persistence  

---

# 🚀 Features

## 📂 File Processing

Supports:
- PDF
- CSV
- TXT

All files are converted into a unified text format for processing.

---

## 🧠 Data Extraction

The system extracts structured information such as:
- Document type (invoice, purchase order, etc.)
- Supplier / vendor
- Document number
- Issue date
- Due date
- Currency
- Line items (description, quantity, unit price, totals)
- Subtotal, tax, and total amounts
---

## ✏️ Manual Review & Editing

Users can:
- Review extracted data
- Edit fields manually
- Modify line items
- Correct validation issues before approval

This ensures human-in-the-loop verification for accuracy.

---

## 🔍 Validation Engine

The system validates documents by checking:
- Required fields
- Date correctness
- Line item consistency
- Subtotal + tax vs total reconciliation

Invalid documents are flagged for review.

---

## 💾 Document Lifecycle

Each document goes through a lifecycle:
- Uploaded
- Needs review
- Validated
- Rejected

Documents are stored locally using `localStorage`.

---

## 📊 Aggregation Logic

Only validated documents are included in totals.

- Totals are grouped by currency
- Aggregation simulates a basic accounting summary system

---

# 🧱 Tech Stack

- React (Hooks + useReducer state management)
- PDF.js (pdfjs-dist)
- PapaParse (CSV parsing)
- Vanilla JavaScript parsing utilities
- localStorage (persistence layer)
- CSS / Tailwind for UI styling

---

# ⚙️ How It Works

1. User uploads a document (PDF / CSV / TXT)
2. File is converted into raw text
3. Extraction engine parses structured data
4. Validation engine checks consistency
5. User reviews and edits data if needed
6. Document is stored locally
7. Validated documents contribute to aggregated totals

---

# 🧠 Key Design Decisions

## Frontend-first architecture
The system is built without a backend because:
- data volume is small
- localStorage is sufficient for the task scope
- faster iteration and simpler deployment

A backend would primarily be used for:
- storing original uploaded files
- offloading file parsing and processing
- improving scalability and persistence

---

## Rule-based extraction
A heuristic-based approach was chosen instead of ML because:
- predictable output
- easier debugging
- better control over edge cases
- suitable for structured business documents

---

## localStorage persistence
Used as a lightweight persistence layer to simulate:
- database storage
- session recovery
- document tracking across reloads

---

## Reducer-based state management
useReducer was used to:
- centralize state transitions
- improve scalability
- mimic backend-style state architecture

---

# ⚠️ Known Limitations

- No backend integration (intentional for task scope)
- No image or OCR support
- Duplicate detection is metadata-based (not content hashing)
- Heuristic-based parsing may vary depending on document structure

---

# 📌 Future Improvements

- Add backend API for file storage and processing
- Move document parsing to server-side for scalability
- Replace heuristics with more robust extraction logic based on document variability
- Add OCR support for image-based documents
- Improve table extraction accuracy
- Introduce authentication and multi-user support

---

# 🧠 Summary

This project demonstrates:
- structured data extraction from unstructured documents
- validation logic design for business workflows
- frontend state management using reducer patterns
- persistent local storage architecture
- real-world document processing pipeline simulation

It serves as a foundation for a scalable document automation system.

# 🤖 AI-Assisted Development

This project was developed using AI tools as part of the engineering workflow:

- Claude was used to help generate the initial project structure and skeleton
- ChatGPT was used for iterative problem-solving, debugging, and refining specific implementation details

All architectural decisions, logic design, and final implementation were reviewed, adjusted, and integrated manually.

AI was used as an assistant to accelerate development, not as a replacement for engineering decisions.