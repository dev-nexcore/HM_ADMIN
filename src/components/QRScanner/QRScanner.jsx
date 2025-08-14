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
  const streamRef = useRef(null);

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
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      // Check if we're on a mobile device and prefer back camera
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraPermission('granted');
            setScanning(true);
            startScanning();
          }).catch(err => {
            console.error('Error playing video:', err);
            setError('Error starting camera video');
          });
        };
      }
    } catch (err) {
      console.error('Camera permission denied:', err);
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions or use manual input.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (!scanning || !videoRef.current || !canvasRef.current) {
        clearInterval(scanInterval);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Try to detect QR code using browser's BarcodeDetector
        detectQRCode().then(qrCode => {
          if (qrCode) {
            clearInterval(scanInterval);
            handleQRCodeDetected(qrCode);
          }
        }).catch(err => {
          console.debug('QR detection error:', err);
        });
      }
    }, 500); // Scan every 500ms
  };

  const detectQRCode = async () => {
    try {
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const canvas = canvasRef.current;
        const barcodes = await barcodeDetector.detect(canvas);
        
        if (barcodes.length > 0) {
          return barcodes[0].rawValue;
        }
      } else {
        // Fallback for browsers without BarcodeDetector
        console.log('BarcodeDetector not supported');
      }
    } catch (error) {
      console.debug('BarcodeDetector failed:', error);
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
      
      // Fetch item details using your API
      const response = await fetch(`/api/adminauth/inventory/qr/${slug}`);
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
    setCameraPermission(null);
    requestCameraPermission();
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
              
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                  
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
                    <p className="text-gray-600">Starting camera...</p>
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

        {/* Manual Input Alternative */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Or enter manually:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter QR code URL or slug"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
              disabled={!manualInput.trim() || loading}
            >
              <Search size={16} />
              Search
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• Make sure the QR code is well-lit and clear</p>
          <p>• Hold your device steady</p>
          <p>• Ensure the entire QR code is visible in the frame</p>
          <p>• Allow camera permissions when prompted</p>
          {!('BarcodeDetector' in window) && (
            <p className="text-orange-600">• For best results, use Chrome/Edge browser</p>
          )}
        </div>

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