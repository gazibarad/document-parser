export default function ReviewDocument({
  currentDocument,
  onBack,
  onUpdateFinalData,
  onUpdateLineItem,
  onSaveCorrections,
  onConfirmValidated,
  onRejectDocument,
}) {
  const hasErrors = currentDocument.validationErrors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h1 className="text-2xl font-bold text-white">Review Document</h1>
            <p className="text-blue-100 mt-1">{currentDocument.fileName}</p>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Extracted Data (Editable)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field
                  label="Document Type"
                  value={currentDocument.finalData.documentType}
                  onChange={(value) => onUpdateFinalData("documentType", value)}
                  error={hasErrors && !currentDocument.finalData.documentType}
                />
                <Field
                  label="Supplier"
                  value={currentDocument.finalData.supplier}
                  onChange={(value) => onUpdateFinalData("supplier", value)}
                  error={hasErrors && !currentDocument.finalData.supplier}
                />
                <Field
                  label="Document Number"
                  value={currentDocument.finalData.documentNumber}
                  onChange={(value) =>
                    onUpdateFinalData("documentNumber", value)
                  }
                  error={hasErrors && !currentDocument.finalData.documentNumber}
                />
                <Field
                  label="Issue Date"
                  value={currentDocument.finalData.issueDate}
                  onChange={(value) => onUpdateFinalData("issueDate", value)}
                  error={hasErrors && !currentDocument.finalData.issueDate}
                />
              </div>
              <div className="space-y-4">
                <Field
                  label="Due Date"
                  value={currentDocument.finalData.dueDate}
                  onChange={(value) => onUpdateFinalData("dueDate", value)}
                />
                <Field
                  label="Currency"
                  value={currentDocument.finalData.currency}
                  onChange={(value) => onUpdateFinalData("currency", value)}
                  error={hasErrors && !currentDocument.finalData.currency}
                />
                <Field
                  label="Subtotal"
                  value={currentDocument.finalData.subtotal}
                  onChange={(value) => onUpdateFinalData("subtotal", value)}
                />
                <Field
                  label="Tax"
                  value={currentDocument.finalData.tax}
                  onChange={(value) => onUpdateFinalData("tax", value)}
                />
                <Field
                  label="Total"
                  value={currentDocument.finalData.total}
                  onChange={(value) => onUpdateFinalData("total", value)}
                  error={hasErrors && !currentDocument.finalData.total}
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Line Items
              </label>
              {currentDocument.finalData.lineItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentDocument.finalData.lineItems.map(
                        (item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={
                                  item.description || item.Description || ""
                                }
                                onChange={(e) =>
                                  onUpdateLineItem(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={item.quantity || item.Quantity || ""}
                                onChange={(e) =>
                                  onUpdateLineItem(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                value={item.price || item.Price || ""}
                                onChange={(e) =>
                                  onUpdateLineItem(
                                    index,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className={`text-center py-8 text-gray-500 ${hasErrors ? "text-red-500" : ""}`}
                >
                  No line items found
                </div>
              )}
            </div>

            {currentDocument.validationErrors.map((error, index) => (
              <li key={index} className="text-red-700">
                {error.field
                  ? `${error.message}`
                  : error.message}
              </li>
            ))}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onSaveCorrections}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Save Corrections
              </button>
              <button
                onClick={onConfirmValidated}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Confirm Validated
              </button>
              <button
                onClick={onRejectDocument}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
    </div>
  );
}
