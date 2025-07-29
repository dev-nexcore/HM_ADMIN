"use client";

import { useEffect, useState } from "react";
import InvoiceSection from "./InvoiceSection";
// import axios from "axios"; // Uncomment when switching to real API

export default function InvoicePage() {
  const [studentFees, setStudentFees] = useState([]);
  const [managementInvoices, setManagementInvoices] = useState([]);
  const [purchaseReceipts, setPurchaseReceipts] = useState([]);

  useEffect(() => {
    // Simulate future API fetching
    // Example:
    // axios.get("/api/student-fees").then((res) => setStudentFees(res.data));

    // Dummy data (replace with fetched data)
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
      ["Ayesha Ali Khan", "Clean Co.", "₹35,000", "07-05-2025", "Approved"],
      ["Ayesha Ali Khan", "Awab Fakih", "₹35,000", "07-05-2025", "Pending"],
    ]);
  }, []);

  return (
    <main className="p-6 bg-white min-h-screen mt-10">
      <h1 className="text-2xl font-bold mb-4 text-black ">
        <span className="border-l-4 border-red-600 pl-2 ml-2 ">
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
        />
      </div>
    </main>
  );
}
