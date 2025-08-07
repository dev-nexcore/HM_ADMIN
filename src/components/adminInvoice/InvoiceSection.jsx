"use client";

import { Eye, Download } from "lucide-react";

const statusStyles = {
  Paid: "bg-green-600 text-white",
  Approved: "bg-green-600 text-white",
  Pending: "bg-gray-900 text-white",
  Overdue: "bg-orange-500 text-white",
};

export default function InvoiceSection({
  title,
  headers,
  data,
  onView,
  onDownload,
}) {
  return (
   <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
  <h2 className="font-semibold text-black mb-3 ml-2 text-lg">{title}</h2>

  {/* ✅ Desktop Table View */}
  <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
    <table className="min-w-full text-black text-sm md:text-base">
      <thead>
        <tr className="bg-white">
          {headers.map((head, i) => (
            <th
              key={i}
              className={`px-4 py-3 text-center font-semibold whitespace-nowrap ${
                i === 0
                  ? "rounded-tl-2xl"
                  : i === headers.length - 1
                  ? "rounded-tr-2xl"
                  : ""
              }`}
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-black/5 transition">
            {headers.map((column, cellIndex) => {
              const cell = row[cellIndex];

              if (column === "Status") {
                return (
                  <td key={cellIndex} className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-24 px-3 py-1 text-xs md:text-sm text-center font-medium rounded-lg ${
                        statusStyles[cell] || "bg-gray-300 text-black"
                      }`}
                    >
                      {cell}
                    </span>
                  </td>
                );
              }

              if (column === "Actions") {
                return (
                  <td key={cellIndex} className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <Eye
                        className="h-4 w-4 text-black cursor-pointer"
                        title="View Details"
                        onClick={() => onView(row, title)}
                      />
                      <span className="text-gray-400">|</span>
                      <Download
                        className="h-4 w-4 text-black cursor-pointer"
                        title="Download Invoice"
                        onClick={() => onDownload(row)}
                      />
                    </div>
                  </td>
                );
              }

              return (
                <td
                  key={cellIndex}
                  className="px-4 py-2 text-center whitespace-nowrap"
                >
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* ✅ Mobile Card View */}
  <div className="sm:hidden space-y-4">
    {data.map((row, rowIndex) => (
      <div
        key={rowIndex}
        className="bg-white rounded-xl p-4 shadow flex flex-col gap-2"
      >
        {headers.map((column, cellIndex) => {
          const value = row[cellIndex];

          if (column === "Actions") {
            return (
              <div key={cellIndex} className="flex justify-end gap-4 mt-2">
                <Eye
                  className="h-5 w-5 text-black cursor-pointer"
                  title="View Details"
                  onClick={() => onView(row, title)}
                />
                <Download
                  className="h-5 w-5 text-black cursor-pointer"
                  title="Download Invoice"
                  onClick={() => onDownload(row)}
                />
              </div>
            );
          }

          if (column === "Status") {
            return (
              <div key={cellIndex}>
                <span className="text-gray-500 font-medium">{column}:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    statusStyles[value] || "bg-gray-300 text-black"
                  }`}
                >
                  {value}
                </span>
              </div>
            );
          }

          return (
            <div key={cellIndex}>
              <span className="text-gray-500 font-medium">{column}:</span>{" "}
              <span className="text-black">{value}</span>
            </div>
          );
        })}
      </div>
    ))}
  </div>
</section>

  );
}
