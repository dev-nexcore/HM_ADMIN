"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ItemDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use your backend API URL from env variable
  const apiUrl = process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5224";
  const res = await fetch(`${apiUrl}/api/adminauth/public/${slug}`);
  if (!res.ok) throw new Error("Item not found");
  const data = await res.json();
  setItem(data.item);
      } catch (err) {
        setError(err.message || "Failed to fetch item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading item details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!item) return <div className="p-8 text-center">No item found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">{item.itemName}</h1>
      <div className="mb-2"><b>Location:</b> {item.location}</div>
      <div className="mb-2"><b>Barcode ID:</b> {item.barcodeId}</div>
      <div className="mb-2"><b>Status:</b> {item.status}</div>
      <div className="mb-2"><b>Category:</b> {item.category}</div>
      <div className="mb-2"><b>Room No:</b> {item.roomNo}</div>
      <div className="mb-2"><b>Floor:</b> {item.floor}</div>
      <div className="mb-2"><b>Purchase Date:</b> {item.purchaseDate}</div>
      <div className="mb-2"><b>Purchase Cost:</b> {item.purchaseCost}</div>
      {item.description && <div className="mb-2"><b>Description:</b> {item.description}</div>}
      {item.receiptUrl && (
        <div className="mb-2">
          <b>Receipt:</b> <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Receipt</a>
        </div>
      )}
      {item.qrCodeUrl && (
        <div className="mt-4">
          <img
            src={
              item.qrCodeUrl.startsWith('http')
                ? item.qrCodeUrl.replace('/public/qrcodes', '/qrcodes')
                : `${process.env.NEXT_PUBLIC_PROD_API_URL || 'http://localhost:5224'}${item.qrCodeUrl.replace('/public/qrcodes', '/qrcodes')}`
            }
            alt="QR Code"
            className="w-32 h-32 mx-auto border border-gray-300 rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
