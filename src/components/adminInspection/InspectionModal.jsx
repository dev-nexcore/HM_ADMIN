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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 sm:px-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#BEC5AD] p-5 sm:p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl font-bold"
        >
          &times;
        </button>

        {/* Section Title */}
        <h3 className="text-lg sm:text-xl font-bold text-black mb-4 border-l-4 border-[#4F8CCF] pl-2">
          {section}
        </h3>

        {/* Info Grid */}
        <div className="space-y-3 text-sm sm:text-base text-black">
          {headers.map((header, index) => (
            <div
              key={index}
              className="flex justify-between items-start gap-2 border-b border-gray-300 pb-2"
            >
              <span className="font-semibold text-gray-700">{header}</span>
              <span className="text-right break-words max-w-[50%]">
                {row[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#BEC5AD] px-4 py-2 rounded-lg text-black font-semibold hover:bg-[#a6ad97] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
