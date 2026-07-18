const fs = require('fs');
let code = fs.readFileSync('src/components/management/management.jsx', 'utf8');

const startIndex = code.indexOf('{/* ── Student List ── */}');
const endIndex = code.indexOf('{/* ── Reject Modal ── */}');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers!", startIndex, endIndex);
    process.exit(1);
}

// walk back to find start of line
let actualStart = startIndex;
while (actualStart > 0 && code[actualStart - 1] !== '\n') {
    actualStart--;
}

let actualEnd = endIndex;
while (actualEnd > 0 && code[actualEnd - 1] !== '\n') {
    actualEnd--;
}

const replacement = `        {/* ── Student List ── */}
        <div id="student-list-section" className="w-full">
            {activeTab === "parent" ? (
              <div className="bg-[#BEC5AD] rounded-[20px] p-4 sm:p-6 lg:p-8 px-4 sm:px-0" style={{ boxShadow: "0px 4px 4px 0px #00000040 inset" }}>
                {parentTable()}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-[#BEC5AD] to-[#a8b096] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-black">
                      {activeTab === "worker" ? "Worker List" : "Student List"}
                      {activeFilter !== "All" && <span className="text-gray-800 text-sm ml-2 font-medium">— {activeFilter}</span>}
                    </h2>
                    <p className="text-sm text-gray-700 mt-1">Total: {filteredStudents.length} records</p>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        {["Student ID", "Name", "Room/Bed", "Type", "Fee", "Contact", "Fees Status", "Dues", "Biometric", "Status", "Action"].map((h) => (
                          <th key={h} className="px-4 py-3 text-sm font-semibold text-gray-700">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudents.length === 0 && (
                        <tr>
                          <td colSpan="11" className="text-center py-12 text-gray-500 text-lg">
                            No {activeTab === "worker" ? "workers" : "students"} found.
                          </td>
                        </tr>
                      )}
                      {currentStudents.map((s) => (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">{s.isPendingApproval ? "Pending" : s.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-bold">{s.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.room}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.roomType ? \`\${s.roomType} Bed\` : "-"}</td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-700">{s.monthlyFee}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.contact}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                              s.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                              s.feeStatus === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }\`}>
                              {s.feeStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-red-500">{s.dueAmount > 0 ? \`₹\${s.dueAmount}\` : "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              {s.isAddedToBiometric ? "✅ Added" : "❌ Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                              s.isPendingApproval 
                                ? (s.reqStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800')
                                : 'bg-green-100 text-green-800'
                            }\`}>
                              {s.isPendingApproval ? (s.reqStatus === 'rejected' ? "Rejected" : "Pending") : "Approved"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-3">
                              {s.isPendingApproval ? (
                                <>
                                  <button onClick={() => handleViewDetails(s.id)} title="View Details" className="text-blue-600 hover:text-blue-800 transition-colors"><Eye size={18} /></button>
                                  {s.reqStatus === 'rejected' && s.rejectionReason && (
                                    <>
                                      <div className="w-px h-4 bg-gray-300" />
                                      <button onClick={() => handleViewReason(s.rejectionReason)} title="View Reason" className="text-red-600 hover:text-red-800 transition-colors"><Info size={18} /></button>
                                    </>
                                  )}
                                  {s.reqStatus !== 'rejected' && (
                                    <>
                                      <div className="w-px h-4 bg-gray-300" />
                                      <button onClick={() => handleApproveReq(s.requisitionId)} title="Approve" className="text-green-600 hover:text-green-800 transition-colors"><Check size={18} strokeWidth={3} /></button>
                                      <div className="w-px h-4 bg-gray-300" />
                                      <button onClick={() => handleRejectReq(s.requisitionId)} title="Reject" className="text-red-600 hover:text-red-800 transition-colors"><X size={18} strokeWidth={3} /></button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleViewDetails(s.id)} title="View Details" className="text-blue-600 hover:text-blue-800 transition-colors"><Eye size={18} /></button>
                                  <button onClick={() => handleEdit(s.id)} title="Edit Student" className="text-blue-600 hover:text-blue-800 transition-colors"><Pencil size={18} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view logic */}
                <div className="lg:hidden p-4 space-y-4">
                  {currentStudents.length === 0 && <p className="text-center text-gray-500 py-8">No {activeTab === "worker" ? "workers" : "students"} found.</p>}
                  {currentStudents.map((s) => (
                    <div key={s.id} className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 relative">
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <span className={\`px-2 py-1 rounded-full text-[10px] font-bold \${
                          s.isPendingApproval 
                            ? (s.reqStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800')
                            : 'bg-green-100 text-green-800'
                        }\`}>
                          {s.isPendingApproval ? (s.reqStatus === 'rejected' ? "Rejected" : "Pending") : "Approved"}
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                          {s.isAddedToBiometric ? "✅ Bio" : "❌ Bio"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500">ID:</span>
                        <span className="ml-2 text-sm text-gray-800 font-medium">{s.isPendingApproval ? "Pending" : s.id}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500">Name:</span>
                        <span className="ml-2 text-sm text-gray-700 font-bold">{s.name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500">Room/Bed:</span>
                        <span className="ml-2 text-sm text-gray-700">{s.room} {s.roomType ? \`\${s.roomType} Bed\` : ""}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500">Contact:</span>
                        <span className="ml-2 text-sm text-gray-700">{s.contact}</span>
                      </div>
                      <div className="mb-2 flex items-center">
                        <span className="text-xs font-semibold text-gray-500">Fees Status:</span>
                        <span className={\`ml-2 px-2 py-0.5 rounded-full text-xs font-medium \${s.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' : s.feeStatus === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}\`}>
                          {s.feeStatus}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-3 pt-2 border-t border-gray-200">
                        {s.isPendingApproval ? (
                          <>
                            <button onClick={() => handleViewDetails(s.id)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"><Eye size={16} /> View</button>
                            {s.reqStatus === 'rejected' && s.rejectionReason && (
                              <button onClick={() => handleViewReason(s.rejectionReason)} className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors text-sm"><Info size={16} /> Reason</button>
                            )}
                            {s.reqStatus !== 'rejected' && (
                              <>
                                <button onClick={() => handleApproveReq(s.requisitionId)} className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm"><Check size={16} strokeWidth={3} /> Approve</button>
                                <button onClick={() => handleRejectReq(s.requisitionId)} className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors text-sm"><X size={16} strokeWidth={3} /> Reject</button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleViewDetails(s.id)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"><Eye size={16} /> View</button>
                            <button onClick={() => handleEdit(s.id)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"><Pencil size={16} /> Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to <span className="font-medium">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => paginate(currentPage - 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={\`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all \${currentPage === i + 1 ? 'bg-[#4F8DCF] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'}\`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => paginate(currentPage + 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Mobile Pagination */}
                <div className="md:hidden flex justify-between items-center px-4 py-4 border-t border-gray-100 bg-gray-50">
                   <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={\`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all \${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}\`}>Prev</button>
                   <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages || 1}</span>
                   <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={\`px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm transition-all \${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}\`}>Next</button>
                </div>
              </div>
            )}
        </div>
\n`;

const newCode = code.slice(0, actualStart) + replacement + code.slice(actualEnd);
fs.writeFileSync('src/components/management/management.jsx', newCode);
