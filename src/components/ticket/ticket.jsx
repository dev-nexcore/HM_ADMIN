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
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-black border-l-4 border-[#4F8CCF] pl-3">
        Tickets & Queries
      </h2>

      {/* Open Tickets */}
      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <h2 className="text-xl font-semibold text-black mb-4">Open Tickets</h2>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {openTickets.length > 0 ? (
            openTickets.map((ticket, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-600">ID:</span>
                    <span className="font-bold">{ticket.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Subject:</span>
                    <p className="mt-1">{ticket.subject}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Raised By:</span>
                      <p>{ticket.raisedBy}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Date:</span>
                      <p>{ticket.dateRaised}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Status:</span>
                      <span className="ml-2 font-bold text-[#4F8CCF]">{ticket.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="bg-lime-500 text-black font-semibold flex-1 py-2 rounded-md hover:bg-lime-600"
                      onClick={() => handleApprove(index)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white font-semibold flex-1 py-2 rounded-md hover:bg-red-700"
                      onClick={() => handleReject(index)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-700">
              No open tickets available.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-base text-left font-semibold text-black border-separate border-spacing-y-3">
            <thead className="bg-white text-black font-bold">
              <tr>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Ticket ID</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Subject</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Raised By</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Status</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Date Raised</th>
                <th className="px-5 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length > 0 ? (
                openTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3">{ticket.id}</td>
                    <td className="px-5 py-3">{ticket.subject}</td>
                    <td className="px-5 py-3">{ticket.raisedBy}</td>
                    <td className="px-5 py-3 font-bold text-[#4F8CCF]">
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
      <div className="bg-[#A4B494] rounded-2xl p-4 md:p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-black">Resolved Tickets</h3>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {resolvedTickets.length > 0 ? (
            resolvedTickets.map((ticket, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-600">ID:</span>
                    <span className="font-bold">{ticket.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Subject:</span>
                    <p className="mt-1">{ticket.subject}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Raised By:</span>
                      <p>{ticket.raisedBy}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-600">Date:</span>
                      <p>{ticket.dateRaised}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-600">Status:</span>
                    <span className="ml-2 text-green-600 font-semibold">{ticket.status}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-900 font-semibold">
              No resolved tickets available.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-base text-left text-black border-separate border-spacing-y-3">
            <thead className="bg-white font-semibold text-black">
              <tr>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Ticket ID</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Subject</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Raised By</th>
                <th className="px-5 py-3 border-r border-[#A4B494] whitespace-nowrap">Status</th>
                <th className="px-5 py-3 whitespace-nowrap">Date Raised</th>
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
                  <td colSpan={5} className="text-center py-4 text-gray-900 font-semibold">
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