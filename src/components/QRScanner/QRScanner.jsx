import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Search } from 'lucide-react';

const QRScanner = ({ isOpen, onClose, onScanResult }) => {
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setManualInput('');
      requestCameraPermission();
    } else {
      stopCamera();
      setScanning(false);
    }

    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraPermission('granted');
          setScanning(true);
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera permission denied:', err);
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions or use manual input.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startScanning = () => {
    const scanFrame = () => {
      if (!scanning || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = detectQRCode(imageData);
        
        if (qrCode) {
          handleQRCodeDetected(qrCode);
          return;
        }
      }

      animationRef.current = requestAnimationFrame(scanFrame);
    };

    scanFrame();
  };

  // Simple QR code detection using browser's built-in BarcodeDetector if available
  const detectQRCode = async (imageData) => {
    try {
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const canvas = canvasRef.current;
        const barcodes = await barcodeDetector.detect(canvas);
        
        if (barcodes.length > 0) {
          return barcodes[0].rawValue;
        }
      }
    } catch (error) {
      console.debug('BarcodeDetector not supported or failed:', error);
    }
    return null;
  };

  const handleQRCodeDetected = async (data) => {
    if (!data) return;
    
    setLoading(true);
    setScanning(false);
    
    try {
      let slug = '';
      
      // Check if it's a full URL or just a slug
      if (data.includes('/inventory/item/')) {
        const urlParts = data.split('/');
        slug = urlParts[urlParts.length - 1];
      } else if (data.includes('/p/')) {
        // Handle short URL format
        const urlParts = data.split('/p/');
        slug = urlParts[1];
      } else {
        // Assume it's just the slug
        slug = data;
      }
      
      // Fetch item details
      const response = await fetch(`/api/inventory/public/${slug}`);
      const result = await response.json();
      
      if (result.success) {
        onScanResult(result.item);
        onClose();
      } else {
        setError('Item not found or QR code is invalid');
        setScanning(true);
        startScanning();
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('Error fetching item details. Please try again.');
      setScanning(true);
      startScanning();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleQRCodeDetected(manualInput.trim());
    }
  };

  const resetScanner = () => {
    setError('');
    setLoading(false);
    requestCameraPermission();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const qrCode = await detectQRCode();
        if (qrCode) {
          handleQRCodeDetected(qrCode);
        } else {
          setError('No QR code found in the uploaded image');
          setLoading(false);
        }
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      setError('Error processing uploaded image');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera size={24} />
            Scan QR Code
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera Scanner */}
        <div className="relative mb-4">
          {cameraPermission === 'granted' && !error ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-gray-200 rounded-lg object-cover"
              />
              
              {/* Hidden canvas for QR detection */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent">
                  {/* Corner indicators */}
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                  
                  {/* Scanning animation */}
                  {scanning && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute w-full h-1 bg-blue-500 opacity-75 animate-pulse"
                           style={{
                             top: '50%',
                             transform: 'translateY(-50%)',
                             animation: 'scan 2s ease-in-out infinite'
                           }}>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Processing QR Code...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Processing...</p>
                </div>
              ) : cameraPermission === 'denied' ? (
                <div className="text-center p-4">
                  <Camera size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Camera access required</p>
                  <button
                    onClick={requestCameraPermission}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Enable Camera
                  </button>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <p className="text-red-600 mb-2 text-sm">{error}</p>
                  <button
                    onClick={resetScanner}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-pulse">
                    <Camera size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {scanning && !loading && (
          <div className="text-center text-sm text-gray-600 mb-4">
            Position the QR code within the frame to scan
          </div>
        )}

        {/* File Upload Option */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Or upload QR code image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Manual Input Alternative */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Or enter manually:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter QR code URL or slug"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit(e);
                }
              }}
            />
            <button
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
              disabled={!manualInput.trim() || loading}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• Make sure the QR code is well-lit and clear</p>
          <p>• Hold your device steady</p>
          <p>• Ensure the entire QR code is visible in the frame</p>
          <p>• Allow camera permissions when prompted</p>
          {!('BarcodeDetector' in window) && (
            <p className="text-orange-600">• For best results, use a modern browser with QR detection support</p>
          )}
        </div>

        {/* CSS for scanning animation */}
        <style jsx>{`
          @keyframes scan {
            0% {
              top: 0%;
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              top: 100%;
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QRScanner;

