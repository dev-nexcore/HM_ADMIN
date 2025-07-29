"use client";

import { useState } from "react";

export default function TicketsSection() {
  const [openTickets, setOpenTickets] = useState([
    {
      id: "#0001",
      subject: "Leaky Faucet in Room 101",
      raisedBy: "Student A",
      status: "Pending",
      dateRaised: "25-07-2025",
    },
    {
      id: "#0002",
      subject: "AC not working",
      raisedBy: "Student B",
      status: "Pending",
      dateRaised: "25-07-2025",
    },
  ]);

  const [resolvedTickets, setResolvedTickets] = useState([
    {
      id: "#0003",
      subject: "Broken chair in Dining hall",
      raisedBy: "Student A",
      status: "Resolved",
      dateRaised: "25-07-2025",
    },
    {
      id: "#0004",
      subject: "Leaky Faucet in Room 101",
      raisedBy: "Warden A",
      status: "Resolved",
      dateRaised: "25-07-2025",
    },
  ]);

  const handleApprove = (index) => {
    const ticket = openTickets[index];
    ticket.status = "Resolved";
    setResolvedTickets((prev) => [...prev, ticket]);
    setOpenTickets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReject = (index) => {
    setOpenTickets((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 md:px-6 py-10 space-y-10 max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-black border-l-4 border-red-600 pl-3">
        Tickets & Queries
      </h2>

      {/* Open Tickets */}
      <div className="bg-[#A4B494] rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-black mb-4">Open Tickets</h2>

        {/* Responsive table wrapper for both mobile & desktop */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-base text-left text-black border-separate border-spacing-y-3">
            <thead className="bg-white text-black">
              <tr>
                <th className="px-5 py-3 border-r border-[#A4B494]">Ticket ID</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Subject</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Raised By</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Status</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Date Raised</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length > 0 ? (
                openTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3">{ticket.id}</td>
                    <td className="px-5 py-3">{ticket.subject}</td>
                    <td className="px-5 py-3">{ticket.raisedBy}</td>
                    <td className="px-5 py-3 font-bold text-orange-500">
                      {ticket.status}
                    </td>
                    <td className="px-5 py-3">{ticket.dateRaised}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-2 w-[110px]">
                        <button
                          className="bg-lime-500 text-black font-semibold w-full py-1 rounded-md hover:bg-lime-600"
                          onClick={() => handleApprove(index)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 text-white font-semibold w-full py-1 rounded-md hover:bg-red-700"
                          onClick={() => handleReject(index)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-700">
                    No open tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved Tickets */}
      <div className="bg-[#A4B494] rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-black">Resolved Tickets</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base text-left text-black border-separate border-spacing-y-3">
            <thead className="bg-white text-black">
              <tr>
                <th className="px-5 py-3 border-r border-[#A4B494]">Ticket ID</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Subject</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Raised By</th>
                <th className="px-5 py-3 border-r border-[#A4B494]">Status</th>
                <th className="px-5 py-3">Date Raised</th>
              </tr>
            </thead>
            <tbody>
              {resolvedTickets.length > 0 ? (
                resolvedTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3">{ticket.id}</td>
                    <td className="px-5 py-3">{ticket.subject}</td>
                    <td className="px-5 py-3">{ticket.raisedBy}</td>
                    <td className="px-5 py-3 text-green-600 font-semibold">
                      {ticket.status}
                    </td>
                    <td className="px-5 py-3">{ticket.dateRaised}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-700">
                    No resolved tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
