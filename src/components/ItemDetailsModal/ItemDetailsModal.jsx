import React, { useState, useEffect } from 'react';
import { X, QrCode, Clock } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5224';

const ItemDetailsModal = ({ item, isOpen, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchAuditLogs();
    }
  }, [isOpen, item]);

  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await fetch(`${BASE_URL}/api/adminauth/audit-logs?targetId=${item._id}`);
      const data = await response.json();
      if (response.ok) {
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isOpen || !item) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Use":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "Available":
        return "bg-green-50 text-green-600 border-green-200";
      case "In maintenance":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "Damaged":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/adminauth/inventory/${item._id}/qr-code/download`);
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
      const response = await fetch(`${BASE_URL}/api/adminauth/inventory/${item._id}/qr-code`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        alert('QR code generated successfully');
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-[#F8F9F4] rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        
        {/* Header - Soft Green */}
        <div className="bg-[#CFD5C2] px-6 py-4 flex justify-between items-center rounded-t-[20px]">
          <h2 className="text-[22px] font-bold text-[#1C2B38]" style={{ fontFamily: "Inter" }}>
            Item Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-2 border-[#1C2B38] text-[#1C2B38] hover:bg-black/5 transition-colors flex items-center justify-center"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            
            {/* Item Name */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Item Name</p>
              <p className="text-[#2D3A4A] font-medium text-[14px]">{item.itemName}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-1">Status</p>
              <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getStatusStyle(item.status)} tracking-wider`}>
                {item.status}
              </span>
            </div>

            {/* Barcode ID */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Barcode ID</p>
              <p className="text-[#5B6978] text-[14px]">{item.barcodeId}</p>
            </div>

            {/* Category */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Category</p>
              <p className="text-[#5B6978] text-[14px]">{item.category}</p>
            </div>

            {/* Location */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Location</p>
              <p className="text-[#5B6978] text-[14px]">{item.location}</p>
            </div>

            {/* Room No */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Room No</p>
              <p className="text-[#5B6978] text-[14px]">{item.roomNo || "N/A"}</p>
            </div>

            {/* Floor */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Floor</p>
              <p className="text-[#5B6978] text-[14px]">{item.floor || "N/A"}</p>
            </div>

            {/* Purchase Date */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Purchase Date</p>
              <p className="text-[#5B6978] text-[14px]">{formatDate(item.purchaseDate)}</p>
            </div>
            
            {/* Purchase Cost */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-0.5">Purchase Cost</p>
              <p className="text-[#5B6978] text-[14px]">{item.purchaseCost ? `₹${item.purchaseCost}` : "Not specified"}</p>
            </div>

          </div>

          <div className="w-full h-px bg-gray-200 my-5"></div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-[13px] font-bold text-[#3B4856] mb-2">Description</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-[#5B6978] text-[13px] shadow-sm">
              {item.description || "No description available"}
            </div>
          </div>

          {/* QR Code & Receipt Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Code */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-2">QR Code</p>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center">
                {item.qrCodeUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={item.qrCodeUrl.startsWith('http') ? item.qrCodeUrl : `${BASE_URL}${item.qrCodeUrl.startsWith('/') ? '' : '/'}${item.qrCodeUrl}`}
                      alt="QR Code"
                      className="w-20 h-20 p-1"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className="text-[12px] text-gray-500 font-medium">Generated</p>
                    <button
                      onClick={handleDownloadQR}
                      className="px-4 py-1.5 bg-white border border-gray-300 text-[#3B4856] rounded-lg hover:bg-gray-50 transition-colors font-semibold text-[12px] shadow-sm"
                    >
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <QrCode size={28} className="text-gray-300" />
                    <p className="text-[12px] text-gray-500 font-medium">None</p>
                    <button
                      onClick={handleGenerateQR}
                      className="px-4 py-1.5 bg-[#2D3A4A] text-white rounded-lg hover:bg-[#1C2B38] transition-colors font-semibold text-[12px] shadow-sm"
                    >
                      Generate QR
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt */}
            <div>
              <p className="text-[13px] font-bold text-[#3B4856] mb-2">Receipt</p>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center">
                {item.receiptUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white cursor-pointer"
                         onClick={() => window.open(item.receiptUrl.startsWith('http') ? item.receiptUrl : `${BASE_URL}${item.receiptUrl.startsWith('/') ? '' : '/'}${item.receiptUrl}`, '_blank')}>
                      {item.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center">
                          <svg className="w-8 h-8 text-red-500 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm4-3h-2v1.5h1.5v1.5H16.5V15H15V9h3.5v1.5zM7 10.5h1v1H7v-1zm6 0h1v2h-1v-2z"/></svg>
                          <span className="text-[10px] font-bold text-red-500 uppercase">PDF</span>
                        </div>
                      ) : (
                        <img 
                          src={item.receiptUrl.startsWith('http') ? item.receiptUrl : `${BASE_URL}${item.receiptUrl.startsWith('/') ? '' : '/'}${item.receiptUrl}`} 
                          alt="Receipt Preview" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white text-[11px] font-bold px-3 py-1.5 border border-white/50 rounded-lg shadow-sm">View</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(item.receiptUrl.startsWith('http') ? item.receiptUrl : `${BASE_URL}${item.receiptUrl.startsWith('/') ? '' : '/'}${item.receiptUrl}`, '_blank')}
                      className="px-4 py-1.5 bg-white border border-gray-300 text-[#3B4856] rounded-lg hover:bg-gray-50 transition-colors font-semibold text-[12px] shadow-sm"
                    >
                      View Receipt
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-[#5B6978] text-[13px] font-medium">No receipt available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200 my-5"></div>

          {/* Audit Logs */}
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-[#3B4856] mb-3 flex items-center gap-2">
              <Clock size={16} /> Audit Logs
            </h3>
            {loadingLogs ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : auditLogs.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {auditLogs.map((log, index) => (
                    <div key={log._id || index} className="p-3 border-b border-gray-100 last:border-b-0 flex gap-3 text-sm hover:bg-gray-50 transition-colors">
                      <div className="mt-0.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-gray-800 text-[13px]">{log.actionType}</span>
                          <span className="text-gray-500 text-[11px] whitespace-nowrap ml-2">
                            {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[12px]">{log.description}</p>
                        {log.user && (
                          <p className="text-gray-400 text-[11px] mt-1">by {log.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-gray-500 text-[13px]">No audit logs found for this item.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;