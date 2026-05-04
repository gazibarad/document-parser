export default function DocumentCard({ doc, onReview }) {
  const statusColors = {
    uploaded: "bg-blue-100 text-blue-800",
    needs_review: "bg-yellow-100 text-yellow-800",
    validated: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const status = doc?.status || "unknown";
  const statusLabel = status.replace("_", " ");

  const currency = doc?.finalData?.currency || "";
  const total = doc?.finalData?.total ?? "N/A";

  const validationCount = doc?.validationErrors?.length ?? 0;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 truncate"
              title={doc?.fileName}
            >
              {doc?.fileName}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {doc?.finalData?.documentType || "Unknown type"}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[status] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* BODY */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Supplier:</span>
            <span className="text-gray-900 font-medium">
              {doc?.finalData?.supplier || "N/A"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total:</span>
            <span className="text-gray-900 font-medium">
              {currency} {total}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Issues:</span>
            <span
              className={`font-medium ${
                validationCount > 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {validationCount}
            </span>
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={() => onReview(doc)}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
        >
          Review
        </button>
      </div>
    </div>
  );
}