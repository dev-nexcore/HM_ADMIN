// invoiceModal.jsx
"use client";

import { FiX } from "react-icons/fi";

export default function InvoiceModal({ isOpen, onClose, section, headers, row }) {
  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
            <p className="text-sm text-gray-500 mt-1">{section}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {headers.map((header, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="sm:w-1/3">
                  <span className="font-semibold text-gray-700">{header}</span>
                </div>
                <div className="sm:w-2/3">
                  {idx === headers.length - 1 ? (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row[idx])}`}>
                      {row[idx]}
                    </span>
                  ) : (
                    <span className="text-gray-600">{row[idx]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is an official invoice document. Please keep it for your records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Downloading invoice for ${row[0]}`);
              onClose();
            }}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}