import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineX } from 'react-icons/hi';
import api from '@/lib/api';

export default function AdminOnlinePayment({ fee, activeStudent, onBack, onSuccess }) {
  const [transactionId, setTransactionId] = useState('');
  const [studentScreenshot, setStudentScreenshot] = useState(null);
  const [studentScreenshotPreview, setStudentScreenshotPreview] = useState(null);
  const [studentScreenshotUrl, setStudentScreenshotUrl] = useState(null);
  const [studentOcrRunning, setStudentOcrRunning] = useState(false);
  const [studentUtr, setStudentUtr] = useState(null);

  const [adminScreenshot, setAdminScreenshot] = useState(null);
  const [adminScreenshotPreview, setAdminScreenshotPreview] = useState(null);
  const [adminScreenshotUrl, setAdminScreenshotUrl] = useState(null);
  const [adminOcrRunning, setAdminOcrRunning] = useState(false);
  const [adminUtr, setAdminUtr] = useState(null);

  const [isAmountMatched, setIsAmountMatched] = useState(null);
  const [detectedAmount, setDetectedAmount] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  // Extract specific item amounts if available
  const hostelFeeItem = fee?.items?.find(i => i.invoiceType === 'hostel_fee' || i.categoryName === 'hostel_fee');
  const securityFeeItem = fee?.items?.find(i => i.invoiceType === 'security_deposit' || i.categoryName === 'security_deposit');
  
  const isSecurityDeposit = fee?.invoiceType === 'security_deposit' || fee?.type?.toLowerCase().includes('security') || !!securityFeeItem;
  const isHostelFee = fee?.invoiceType === 'hostel_fee' || fee?.type?.toLowerCase().includes('hostel') || !!hostelFeeItem;
  
  // Calculate remaining amount
  const invPaid = fee?.status === "paid" ? (fee?.paidAmount > 0 ? fee?.paidAmount : fee?.amount) : (fee?.paidAmount || 0);
  const invRemaining = Math.max(0, (fee?.amount || 0) - invPaid);
  const totalAmount = invRemaining;

  // Monthly base calculation
  let breakdownAmount = totalAmount;
  if (isSecurityDeposit && securityFeeItem) breakdownAmount = Number(securityFeeItem.amount);
  else if (isHostelFee && hostelFeeItem) breakdownAmount = Number(hostelFeeItem.amount);

  const monthlyBase = Math.round(breakdownAmount / 3);
  
  const handleScreenshotChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    
    if (type === 'student') {
      setStudentScreenshot(file);
      setStudentScreenshotPreview(URL.createObjectURL(file));
      await extractOCR(file, 'student');
    } else {
      setAdminScreenshot(file);
      setAdminScreenshotPreview(URL.createObjectURL(file));
      await extractOCR(file, 'admin');
    }
  };

  const extractOCR = async (file, type) => {
    try {
      if (type === 'student') setStudentOcrRunning(true);
      else setAdminOcrRunning(true);
      
      const ocrToastId = toast.loading(`Scanning ${type === 'student' ? "Student's Receipt" : "Admin's SMS"}...`);

      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await api.post('/api/adminauth/extract-utr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { extractedUtr, detectedAmounts, screenshotUrl } = response.data;
      
      toast.dismiss(ocrToastId);

      if (extractedUtr) {
        if (type === 'student') {
          setStudentUtr(extractedUtr);
          if (screenshotUrl) setStudentScreenshotUrl(screenshotUrl);
          toast.success("Student receipt UTR extracted!");
        } else {
          setAdminUtr(extractedUtr);
          if (screenshotUrl) setAdminScreenshotUrl(screenshotUrl);
          toast.success("Admin SMS UTR extracted!");
        }
      } else {
        if (type === 'student') setStudentUtr(null);
        else setAdminUtr(null);
        toast.error(`Could not detect a 12-digit UTR in the ${type} screenshot.`);
      }

      // We can check amount matching on the student receipt (or whichever one has amount)
      if (detectedAmounts && detectedAmounts.length > 0) {
        const amtMatched = detectedAmounts.some(amt => Math.abs(amt - totalAmount) < 2);
        
        // Let's store amount match globally if at least one matches, or check specifically for student receipt
        if (amtMatched || isAmountMatched) {
           setIsAmountMatched(true);
           if (amtMatched) setDetectedAmount(detectedAmounts[0]);
           if (amtMatched) toast.success('Amount verified successfully!');
        } else {
           setIsAmountMatched(false);
           setDetectedAmount(detectedAmounts[0]);
           toast.error(`Amount mismatch! Detected ${detectedAmounts[0]} but expected ${totalAmount}`);
        }
      } else {
        if (isAmountMatched === null) {
           setIsAmountMatched(false);
           toast.error('Could not read any payment amount from the screenshot.');
        }
      }

    } catch (err) {
      console.error('OCR Extraction API error:', err);
      toast.dismiss();
      setIsAmountMatched(false);
      toast.error('Failed to process screenshot for verification.');
    } finally {
      if (type === 'student') setStudentOcrRunning(false);
      else setAdminOcrRunning(false);
    }
  };

  const removeScreenshot = (type) => {
    if (type === 'student') {
      setStudentScreenshot(null);
      setStudentScreenshotPreview(null);
      setStudentScreenshotUrl(null);
      setStudentUtr(null);
    } else {
      setAdminScreenshot(null);
      setAdminScreenshotPreview(null);
      setAdminScreenshotUrl(null);
      setAdminUtr(null);
    }
    // Reset amount match if both are gone
    if (!studentScreenshot && !adminScreenshot) {
       setIsAmountMatched(null);
       setDetectedAmount(null);
    }
  };

  const baseDate = fee?.billingCycleStart ? new Date(fee.billingCycleStart) : new Date();
  const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayStr = formatDate(new Date());

  const m1Start = new Date(baseDate);
  const m1End = new Date(baseDate);
  m1End.setMonth(m1End.getMonth() + 1);
  m1End.setDate(m1End.getDate() - 1);

  const m2Start = new Date(baseDate);
  m2Start.setMonth(m2Start.getMonth() + 1);
  const m2End = new Date(baseDate);
  m2End.setMonth(m2End.getMonth() + 2);
  m2End.setDate(m2End.getDate() - 1);

  const m3Start = new Date(baseDate);
  m3Start.setMonth(m3Start.getMonth() + 2);
  const m3End = new Date(baseDate);
  m3End.setMonth(m3End.getMonth() + 3);
  m3End.setDate(m3End.getDate() - 1);

  const handleProceedToPay = async () => {
    if (!fee) {
      toast.error('No fee selected');
      return;
    }

    if (!studentScreenshot || !adminScreenshot) {
      toast.error('Both Student Receipt and Admin SMS screenshots are required.');
      return;
    }

    if (!studentUtr || !adminUtr) {
      toast.error('Missing UTR from one or both screenshots. Please upload clear images.');
      return;
    }

    if (studentUtr !== adminUtr) {
      toast.error('UTR Mismatch! The UTR in the Student receipt does not match the Admin SMS.');
      return;
    }

    if (isAmountMatched === false) {
      toast.error('Cannot proceed: The payment amount in the screenshots does not match the invoice due amount.');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await api.put(`/api/adminauth/invoices/student/${fee._id}/status`, {
        paidAmountToAdd: totalAmount,
        paymentMethod: 'online',
        transactionId: studentUtr.trim(),
        notes: notes.trim(),
        status: 'paid',
        parentScreenshot: studentScreenshotUrl,
        adminScreenshot: adminScreenshotUrl
      });

      if (response.data.success || response.status === 200) {
        // If there's a screenshot, we might need a separate endpoint to upload it, or we can just skip it if backend doesn't support it yet.
        // The admin verify-ocr API accepts a screenshot, we could use that if needed.
        toast.success('Online Payment details submitted and invoice marked as Paid!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting payment details:', err);
      toast.error(err.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6 bg-[#f4f6f0] h-full overflow-y-auto w-full max-w-5xl mx-auto" style={{ fontFamily: "Inter" }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center ml-2">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Payments Confirmation (Admin Flow)</h2>
        </div>
        <div className="flex gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition shadow-sm"
            >
              ← Back to Ledger
            </button>
          )}
          <button onClick={onBack} className="text-black/70 hover:text-black transition-colors" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <HiOutlineX size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Payment Summary */}
        <div className="bg-white rounded-2xl px-4 sm:px-8 py-6 sm:py-8 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#4F8DCF]" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
            Payment Summary — {isSecurityDeposit ? 'Security Deposit' : isHostelFee ? 'Hostel Fee (Quarterly)' : 'Invoice Payment'}
          </h3>

          {isSecurityDeposit ? (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 mb-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-lg text-xs">🔐</span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900">Security Deposit — One-Time Refundable Payment</h4>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm px-1">
                  <span className="font-semibold text-gray-600">Monthly Base Fee Rate (Per Student)</span>
                  <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()} / month</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 block mb-0.5 text-sm">Security Deposit Formula</span>
                    <span className="text-[11px] text-gray-500 font-medium">₹ {monthlyBase.toLocaleString()} (monthly) × 3 months</span>
                  </div>
                  <span className="font-extrabold text-purple-700 text-base sm:text-lg">= ₹ {totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-4 sm:p-5 bg-purple-600/10 rounded-2xl border-2 border-purple-300/50 mt-2">
                  <div>
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1">Security Deposit (One-Time)</p>
                    <p className="text-base sm:text-lg font-extrabold text-gray-900">Collected at Admission</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-700">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : isHostelFee ? (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 mb-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-lg text-xs">📊</span>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">Hostel Fee — Monthly Calculation Breakdown</h4>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                  Quarterly Cycle (3 Months)
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs sm:text-sm px-1">
                  <span className="font-semibold text-gray-600">Monthly Base Fee Rate (Per Student)</span>
                  <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()} / month</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden text-xs sm:text-sm font-medium text-gray-600">
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 1</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m1Start)} → {formatDate(m1End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 2</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m2Start)} → {formatDate(m2End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 3</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m3Start)} → {formatDate(m3End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50/40">
                    <span className="font-extrabold text-gray-800 text-sm">Total (3 Months × ₹ {monthlyBase.toLocaleString()})</span>
                    <span className="font-extrabold text-[#4F8DCF] text-base">₹ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 sm:p-5 bg-[#4F8DCF]/10 rounded-2xl border-2 border-[#4F8DCF]/30 mt-2">
                  <div>
                    <p className="text-xs text-[#4F8DCF] font-bold uppercase tracking-wider mb-1">Current Invoice — Hostel Fee</p>
                    <p className="text-base sm:text-lg font-extrabold text-gray-900">Quarterly Billing ({todayStr})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#4F8DCF]">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 mb-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-lg text-xs">📄</span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900">Invoice Details</h4>
              </div>
              <div className="space-y-3">
                {(fee?.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-semibold text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="capitalize">{(item.customInvoiceType || item.invoiceType || item.categoryName || 'Fee').replace(/_/g, ' ')}</span>
                    <span>₹ {Number(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                
                {fee?.description && (
                  <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg border border-gray-200">
                    <p className="font-bold mb-1 text-gray-600">Notes:</p>
                    <p className="whitespace-pre-wrap">{fee.description}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-4 sm:p-5 bg-blue-50/50 rounded-2xl border border-blue-200 mt-4">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-base font-extrabold text-gray-900">Due for this invoice</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-extrabold text-blue-600">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {fee && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 px-2 font-semibold pt-3 border-t border-gray-100">
              <span className="text-gray-400">Invoice ID: <span className="text-gray-700">{fee.invoiceNumber || fee._id}</span></span>
              <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold border border-amber-200">Due: {new Date(fee.dueDate).toLocaleDateString('en-GB')}</span>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="px-2 sm:px-0">
          <div className="bg-white rounded-2xl px-4 sm:px-8 py-6 sm:py-8 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span>Payment Method</span>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-200">Official Channel</span>
            </h3>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-6">
              
              <div className="flex items-start p-5 rounded-2xl border-2 border-[#4F8DCF] bg-white shadow-sm">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#4F8DCF]/10 text-[#4F8DCF] mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4 space-y-1">
                  <span className="block text-base font-bold text-gray-900">Hostel QR Code (Scan & Pay)</span>
                  <span className="block text-xs text-gray-500 font-medium">Show this QR to the student/parent to pay via UPI</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                    <div className="w-40 h-40 relative flex items-center justify-center bg-gray-50 rounded-xl mb-2 border border-gray-100">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `upi://pay?pa=7510012346@ybl&pn=KGF HOSTEL OFFICIAL&am=${totalAmount}&cu=INR&tn=Hostel Fee Payment`
                        )}`}
                        alt="KGF Hostel Official Dynamic QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <p className="text-xs font-extrabold text-gray-800 tracking-wide">KGF HOSTEL OFFICIAL</p>
                    <p className="text-[10px] text-gray-500 font-semibold">UPI ID: 7510012346@ybl</p>
                    <div className="mt-2 text-center bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 w-full">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Amount to Pay</p>
                      <p className="text-sm font-extrabold text-gray-900">₹ {totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs sm:text-sm text-blue-900">
                      <p className="font-bold mb-1">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 font-medium">
                        <li>Ask the student/parent to open their UPI app.</li>
                        <li>Have them scan the QR code (amount <strong>₹ {totalAmount.toLocaleString()}</strong> is pre-filled).</li>
                        <li>After they pay, enter the 12-digit UTR below and confirm.</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      {/* Upload 1: Student Receipt */}
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700">
                          Upload Payment Receipt (Student) <span className="text-red-500">*</span>
                        </label>

                        {!studentScreenshotPreview ? (
                          <label
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-[#4F8DCF] cursor-pointer transition-all group"
                          >
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-[#4F8DCF] mb-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="text-[10px] font-semibold text-gray-500 group-hover:text-[#4F8DCF] transition">Upload student receipt</p>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              className="hidden"
                              onChange={(e) => handleScreenshotChange(e, 'student')}
                            />
                          </label>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden border-2 border-[#4F8DCF]/40 shadow-sm bg-gray-50">
                            <img
                              src={studentScreenshotPreview}
                              alt="Student Receipt"
                              className="w-full max-h-32 object-contain"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => removeScreenshot('student')}
                                className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 shadow hover:bg-red-100 transition"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="p-2 bg-white border-t border-[#4F8DCF]/20">
                              {studentOcrRunning ? (
                                <div className="text-xs text-blue-600 flex items-center justify-center gap-1 font-semibold">
                                  <span className="animate-spin text-sm">◌</span> Scanning...
                                </div>
                              ) : studentUtr ? (
                                <div className="text-xs font-bold text-center text-green-700">
                                  UTR: {studentUtr}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upload 2: Admin SMS */}
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700">
                          Upload Bank SMS Screenshot (Admin) <span className="text-red-500">*</span>
                        </label>

                        {!adminScreenshotPreview ? (
                          <label
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-[#4F8DCF] cursor-pointer transition-all group"
                          >
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-[#4F8DCF] mb-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="text-[10px] font-semibold text-gray-500 group-hover:text-[#4F8DCF] transition">Upload bank SMS</p>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              className="hidden"
                              onChange={(e) => handleScreenshotChange(e, 'admin')}
                            />
                          </label>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden border-2 border-[#4F8DCF]/40 shadow-sm bg-gray-50">
                            <img
                              src={adminScreenshotPreview}
                              alt="Admin SMS"
                              className="w-full max-h-32 object-contain"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => removeScreenshot('admin')}
                                className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 shadow hover:bg-red-100 transition"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="p-2 bg-white border-t border-[#4F8DCF]/20">
                              {adminOcrRunning ? (
                                <div className="text-xs text-blue-600 flex items-center justify-center gap-1 font-semibold">
                                  <span className="animate-spin text-sm">◌</span> Scanning...
                                </div>
                              ) : adminUtr ? (
                                <div className="text-xs font-bold text-center text-green-700">
                                  UTR: {adminUtr}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                                            {studentUtr && adminUtr && (
                        <div className={`mt-4 p-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center text-center border shadow-sm ${studentUtr === adminUtr ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {studentUtr === adminUtr ? (
                            <>
                              <span className="text-lg">✅ UTRs Match Successfully!</span>
                              <span className="text-xs font-medium text-green-600 mt-1">Both screenshots show UTR: {studentUtr}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">❌ UTR Mismatch Detected</span>
                              <span className="text-xs font-medium text-red-600 mt-1">Student: {studentUtr} | Admin: {adminUtr}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {isAmountMatched !== null && (
                        <div className={`mt-2 p-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center text-center border shadow-sm ${isAmountMatched ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {isAmountMatched ? (
                            <>
                              <span className="text-lg">✅ Amount Verified!</span>
                              <span className="text-xs font-medium text-green-600 mt-1">Detected correctly: ₹{totalAmount}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">❌ Amount Mismatch</span>
                              <span className="text-xs font-medium text-red-600 mt-1">Detected: ₹{detectedAmount || '???'} | Expected: ₹{totalAmount}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-700">Notes</label>
                      <input
                        type="text"
                        placeholder="Admin remarks"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4F8DCF] focus:border-transparent outline-none font-semibold text-gray-800 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleProceedToPay}
                  disabled={processing || !studentScreenshot || !adminScreenshot || !studentUtr || !adminUtr || studentUtr !== adminUtr || !isAmountMatched}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-[#4F8DCF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-2xl px-6 py-4 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:grayscale disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative flex items-center justify-center gap-2">
                    {processing ? 'Recording Payment...' : 'Submit UTR & Mark Paid'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
