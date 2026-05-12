"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Tag, 
  Info, 
  QrCode, 
  ChevronLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_PROD_API_URL;

const ItemDetailsPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        // Using the public-safe endpoint if possible, but the user requested "detail dekh"
        // Let's try the QR slug endpoint first
        const response = await api.get(`/api/adminauth/inventory/qr/${slug}`);
        if (response.data.success) {
          setItem(response.data.item);
        } else {
          setError("Item not found");
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
        setError(err.response?.data?.message || "Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "In Use": return "text-blue-600 bg-blue-50 border-blue-100";
      case "In maintenance": return "text-amber-600 bg-amber-50 border-amber-100";
      case "Damaged": return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#7A8B5E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Fetching Item Details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-rose-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Item Not Found</h1>
          <p className="text-slate-500 mb-8">{error || "The requested item could not be found in our inventory system."}</p>
          <button 
            onClick={() => router.push("/inventory")}
            className="w-full py-4 bg-[#7A8B5E] text-white rounded-2xl font-semibold shadow-lg shadow-[#7A8B5E]/20 hover:bg-[#6b7a52] transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} />
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Header/Nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push("/inventory")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-lg text-slate-800 truncate px-4">Item Details</h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Item Summary Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#7A8B5E] to-[#5f6b49] p-8 text-white relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                <span className={`px-3 py-1 bg-white rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(item.status).split(' ')[0]}`}>
                  {item.status}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight leading-tight">{item.itemName}</h2>
              <p className="text-white/80 font-mono text-sm flex items-center gap-1.5">
                <Tag size={14} /> {item.barcodeId}
              </p>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Package size={120} />
            </div>
          </div>

          <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={16} /> Asset Information
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem 
                      icon={<MapPin size={20} />} 
                      label="Location" 
                      value={item.location} 
                      subValue={`${item.floor ? `Floor ${item.floor}` : ''}${item.roomNo ? ` • Room ${item.roomNo}` : ''}`}
                    />
                    <InfoItem 
                      icon={<Calendar size={20} />} 
                      label="Purchase Date" 
                      value={formatDate(item.purchaseDate)} 
                    />
                    <InfoItem 
                      icon={<Clock size={20} />} 
                      label="Last Audit" 
                      value={formatDate(item.updatedAt)} 
                    />
                  </div>
                </div>

                {/* Right Column: Descriptions & Media */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} /> Verification
                  </h3>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-3">Description</p>
                    <p className="text-slate-700 leading-relaxed">
                      {item.description || "No specific details or description provided for this inventory asset."}
                    </p>
                  </div>

                  {item.receiptUrl && (
                    <a 
                      href={item.receiptUrl.startsWith('http') ? item.receiptUrl : `${API_BASE_URL}${item.receiptUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl group transition-all hover:bg-indigo-100/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-indigo-900 text-sm">Purchase Receipt</p>
                          <p className="text-indigo-600 text-xs">View official document</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    </a>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* QR Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">Inventory Identity</h3>
              <p className="text-slate-600 leading-relaxed">
                This item is registered in our central inventory management system. Use the unique barcode or scan the QR code to verify its authenticity and current status.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  System Verified
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <Clock size={16} className="text-blue-500" />
                  Active Asset
                </div>
              </div>
           </div>
           
           <div className="w-full md:w-auto flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200/60 shadow-inner">
              <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center p-3 shadow-sm">
                {item.qrCodeUrl ? (
                  <img 
                    src={item.qrCodeUrl.startsWith('http') ? item.qrCodeUrl : `${API_BASE_URL}${item.qrCodeUrl}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={120} className="text-slate-200" />
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scan to Verify Asset</p>
           </div>
        </div>
      </main>

      {/* Action Bar (Mobile Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 flex gap-3">
        <button 
          onClick={() => router.push("/inventory")}
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          Back
        </button>
        <button 
          onClick={() => window.print()}
          className="flex-1 py-4 bg-[#7A8B5E] text-white rounded-2xl font-bold shadow-lg shadow-[#7A8B5E]/20"
        >
          Print Label
        </button>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, subValue }) => (
  <div className="flex gap-4 group">
    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-[#7A8B5E]/10 group-hover:text-[#7A8B5E] transition-all">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-bold text-slate-800 text-lg leading-tight">{value || "Not Specified"}</p>
      {subValue && <p className="text-xs text-slate-500 mt-1 font-medium">{subValue}</p>}
    </div>
  </div>
);

export default ItemDetailsPage;
