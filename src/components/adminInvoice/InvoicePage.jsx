"use client";

import { useEffect, useState } from "react";
import InvoiceSection from "./InvoiceSection";
import axios from "axios";
import InvoiceModal from "./invoiceModal";

export default function InvoicePage() {
  const [studentFees, setStudentFees] = useState([]);
  const [managementInvoices, setManagementInvoices] = useState([]);
  const [purchaseReceipts, setPurchaseReceipts] = useState([]);

  const [modalData, setModalData] = useState({
    isOpen: false,
    section: "",
    headers: [],
    row: [],
  });

  useEffect(() => {
    // Simulated API data — replace with axios requests
    // Example:
    // axios.get("/api/student-fees").then((res) => setStudentFees(res.data));

    setStudentFees([
      ["Ayesha Ali Khan", "101", "₹35,000", "07-05-2025", "Paid"],
      ["Ayesha Ali Khan", "101", "₹35,000", "07-05-2025", "Paid"],
      ["Ayesha Ali Khan", "101", "₹35,000", "07-05-2025", "Pending"],
      ["Ayesha Ali Khan", "101", "₹35,000", "07-05-2025", "Overdue"],
    ]);

    setManagementInvoices([
      ["Ayesha Ali Khan", "Warden", "₹35,000", "07-05-2025", "Paid"],
      ["Ayesha Ali Khan", "Cleaner", "₹35,000", "07-05-2025", "Paid"],
      ["Ayesha Ali Khan", "Warden", "₹35,000", "07-05-2025", "Pending"],
      ["Ayesha Ali Khan", "Cleaner", "₹35,000", "07-05-2025", "Overdue"],
    ]);

    setPurchaseReceipts([
      ["Cleaning supplies", "Clean Co.", "₹35,000", "07-05-2025", "Approved"],
      ["Uniforms", "Awab Fakih", "₹35,000", "07-05-2025", "Pending"],
    ]);
  }, []);

  // Handlers
  // 📌 Handler for opening modal
  const handleView = (row, section) => {
    let headers = [];

    if (section === "Student Fees Invoices") {
      headers = ["Student Name", "Room No.", "Amount", "Due Date", "Status"];
    } else if (section === "Management Invoices (Salaries)") {
      headers = ["Staff Name", "Role", "Amount", "Payment Date", "Status"];
    } else if (section === "Staff Purchase Receipts") {
      headers = [
        "Item/Description",
        "Vendor",
        "Amount",
        "Purchase Date",
        "Status",
      ];
    }

    setModalData({
      isOpen: true,
      section,
      headers,
      row,
    });
  };

  const handleDownload = (row) => {
    console.log("Download clicked for:", row);
    alert(`Downloading invoice for: ${row[0]}`);
    // In production, trigger file download here
  };

  return (
    <main className="p-6 bg-white min-h-screen mt-8">
      <h1 className="text-2xl font-bold mb-4 text-black">
        <span className="border-l-4 border-[#4F8CCF] pl-2 ml-2">
          Hostel Invoices
        </span>
      </h1>

      <div className="space-y-8">
        <InvoiceSection
          title="Student Fees Invoices"
          headers={[
            "Student Name",
            "Room no.",
            "Amount",
            "Due date",
            "Status",
            "Actions",
          ]}
          data={studentFees}
          onView={handleView}
          onDownload={handleDownload}
        />

        <InvoiceSection
          title="Management Invoices (Salaries)"
          headers={[
            "Staff Name",
            "Role",
            "Amount",
            "Payment date",
            "Status",
            "Actions",
          ]}
          data={managementInvoices}
          onView={handleView}
          onDownload={handleDownload}
        />

        <InvoiceSection
          title="Staff Purchase Receipts"
          headers={[
            "Item/description",
            "Vendor",
            "Amount",
            "Purchase date",
            "Status",
            "Actions",
          ]}
          data={purchaseReceipts}
          onView={handleView}
          onDownload={handleDownload}
        />
      </div>
      {/* 📦 Modal for details */}
      <InvoiceModal
        isOpen={modalData.isOpen}
        onClose={() =>
          setModalData({ isOpen: false, section: "", headers: [], row: [] })
        }
        section={modalData.section}
        headers={modalData.headers}
        row={modalData.row}
      />
    </main>
  );
}
