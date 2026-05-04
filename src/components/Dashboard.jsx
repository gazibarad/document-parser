import DocumentCard from "./DocumentCard.jsx";

export default function Dashboard({
  documents,
  totals,
  onFileChange,
  onProcessFile,
  onReviewDocument,
  isProcessing,
  hasFile,
  uploadMessage,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Parser Dashboard
          </h1>
          <p className="text-gray-600">
            Process and manage your business documents
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Document
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={onFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.csv,.txt"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={onProcessFile}
              disabled={!hasFile || isProcessing}
              className={`px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium
                ${
                  !hasFile || isProcessing
                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {uploadMessage && (
                <p className="text-sm mt-2">{uploadMessage}</p>
              )}
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                uploadMessage ? "" : "Process Document"
              )}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Documents ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-500">
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onReview={onReviewDocument}
                />
              ))}
            </div>
          )}
        </div>

        {Object.keys(totals).length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Totals by Currency
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(totals).map(([currency, total]) => (
                <div
                  key={currency}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
                >
                  <div className="text-2xl font-bold">
                    {currency} {total.toFixed(2)}
                  </div>
                  <div className="text-blue-100">Validated Total</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
