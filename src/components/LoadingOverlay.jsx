'use client';

export default function LoadingOverlay({ isLoading, text = 'Loading...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
