"use client";

export default function InspectionModal({
  isOpen,
  onClose,
  section,
  headers,
  row,
}) {
  if (!isOpen || !row || !headers) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 sm:px-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md bg-[#f4f6f0] rounded-2xl shadow-2xl overflow-hidden border border-[#BEC5AD]/30 font-[Poppins]">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-black">
            {section}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="text-gray-800 hover:text-black transition-colors flex items-center justify-center p-1 rounded-full hover:bg-black/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-4 text-sm sm:text-base text-black">
          {headers.map((header, index) => (
            <div
              key={index}
              className="flex justify-between items-start gap-4 border-b border-gray-200 pb-3 last:border-0 last:pb-0"
            >
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pt-0.5 whitespace-nowrap">{header}</span>
              <span className="text-right font-semibold text-gray-900 break-words flex-1 text-sm">
                {row[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Close Button */}
        <div className="px-6 py-4 bg-gray-100 flex justify-end border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-black font-bold text-sm shadow-sm hover:bg-gray-50 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
