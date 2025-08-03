"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Download } from "lucide-react";

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
  const STORAGE_KEY = `hiddenRows-${title.replace(/\s+/g, "-")}`;
  const [hiddenRows, setHiddenRows] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHiddenRows(JSON.parse(stored));
    }
  }, []);

  const handleToggleRow = (rowIndex) => {
    setHiddenRows((prev) => {
      const updated = prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <section className="bg-[#BEC5AD] rounded-2xl p-4 shadow-xl">
      <h2 className="font-semibold text-black mb-3 ml-2 text-lg">{title}</h2>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
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
            {data.map((row, rowIndex) => {
              const isHidden = hiddenRows.includes(rowIndex);

              return (
                <tr key={rowIndex} className="hover:bg-black/5 transition">
                  {headers.map((column, cellIndex) => {
                    const cell = row[cellIndex];

                    if (column === "Status") {
                      if (isHidden) return <td key={cellIndex}></td>;
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
                            {isHidden ? (
                              <EyeOff
                                className="h-4 w-4 text-black cursor-pointer"
                                title="Show"
                                onClick={() => handleToggleRow(rowIndex)}
                              />
                            ) : (
                              <Eye
                                className="h-4 w-4 text-black cursor-pointer"
                                title="Hide"
                                onClick={() => handleToggleRow(rowIndex)}
                              />
                            )}
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

                    if (isHidden) return <td key={cellIndex}></td>;

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
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
