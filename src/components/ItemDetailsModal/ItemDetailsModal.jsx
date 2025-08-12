import React from 'react';
import { X, Calendar, MapPin, Package, Info, QrCode } from 'lucide-react';

const ItemDetailsModal = ({ item, isOpen, onClose, onEdit }) => {
  if (!isOpen || !item) return null;

  const statusColor = {
    "In Use": "bg-orange-500 text-white",
    "Available": "bg-green-500 text-white", 
    "In maintenance": "bg-yellow-500 text-black",
    "Damaged": "bg-red-500 text-white",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(`/api/adminauth/inventory/${item._id}/qr-code/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.itemName}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download QR code');
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await fetch(`/api/adminauth/inventory/${item._id}/qr-code`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        alert('QR code generated successfully');
        // Refresh the item data to show the new QR code
        window.location.reload();
      } else {
        alert('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={24} />
            Item Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-600">Item Name</p>
                    <p className="text-lg font-semibold">{item.itemName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <QrCode className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-600">Barcode ID</p>
                    <p className="text-lg font-mono">{item.barcodeId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-600">Category</p>
                    <p className="text-lg">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-600">Location</p>
                    <p className="text-lg">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColor[item.status] || 'bg-gray-200 text-gray-800'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {item.purchaseDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-blue-500 mt-1" size={18} />
                    <div>
                      <p className="font-medium text-gray-600">Purchase Date</p>
                      <p className="text-lg">{formatDate(item.purchaseDate)}</p>
                    </div>
                  </div>
                )}

                {item.purchaseCost && (
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-1">₹</div>
                    <div>
                      <p className="font-medium text-gray-600">Purchase Cost</p>
                      <p className="text-lg font-semibold">₹{item.purchaseCost}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description and QR Code */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {item.description || "No description available"}
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  QR Code
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  {item.qrCodeUrl ? (
                    <div className="space-y-3">
                      <img 
                        src={item.qrCodeUrl && item.qrCodeUrl.startsWith('http') ? item.qrCodeUrl : `http://localhost:5224${item.qrCodeUrl || ''}`}
                        alt="QR Code"
                        className="mx-auto w-32 h-32 border border-gray-300 rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        Scan this QR code to view item details
                      </p>
                      <button
                        onClick={handleDownloadQR}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <QrCode size={16} />
                        Download QR Code
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-32 h-32 bg-gray-200 border border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                        <QrCode size={48} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        No QR code generated yet
                      </p>
                      <button
                        onClick={handleGenerateQR}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <QrCode size={16} />
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Section */}
              {item.receiptUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                    Receipt
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Receipt available</p>
                    <button
                      onClick={() => window.open(item.receiptUrl && item.receiptUrl.startsWith('http') ? item.receiptUrl : `http://localhost:5224${item.receiptUrl || ''}`, '_blank')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(item.lastUpdated || item.updatedAt)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(item);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;