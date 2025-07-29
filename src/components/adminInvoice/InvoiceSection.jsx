"use client";

import { Eye, Download } from "lucide-react";

const statusStyles = {
  Paid: "bg-green-600 text-white",
  Approved: "bg-green-600 text-white",
  Pending: "bg-gray-900 text-white",
  Overdue: "bg-orange-500 text-white",
};

export default function InvoiceSection({ title, headers, data }) {
  return (
    <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
      <h2 className="font-semibold text-black mb-3 text-lg">{title}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-black rounded-lg text-sm md:text-base">
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

                  // Status Cell
                  if (column === "Status") {
                    return (
                      <td key={cellIndex} className="px-4 py-4 text-center">
                        <span
                          className={`inline-block w-24 text-center px-3 py-1 text-xs md:text-sm rounded-lg font-medium ${
                            statusStyles[cell] || "bg-gray-300 text-black"
                          }`}
                        >
                          {cell}
                        </span>
                      </td>
                    );
                  }

                  // Actions Cell
                  if (column === "Actions") {
                    return (
                      <td key={cellIndex} className="px-4 py-2 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <Eye className="h-4 w-4 cursor-pointer text-black" />
                          <span className="text-gray-400">|</span>
                          <Download className="h-4 w-4 cursor-pointer text-black" />
                        </div>
                      </td>
                    );
                  }

                  // Default Cell
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
    </section>
  );
}
