// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { scanProduct } from '../services/api';

const Scanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [quantityTaken, setQuantityTaken] = useState(1);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
    setScanning(false);
  }, []);

  const handleCancel = () => {
    stopCamera();
    setQrCode('');
    setMessage('');
    setScannedProduct(null);
  };

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code) {
      let data = code.data;
      try {
        const parsed = JSON.parse(data);
        if (parsed.qrCode) data = parsed.qrCode;
      } catch (e) {
        // Not a JSON string, use as is
      }
      setQrCode(data);
      setMessage('QR scanned successfully');
      stopCamera();
      return;
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = async () => {
    setMessage('');
    setScannedProduct(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setShowCamera(true);
      setScanning(true);
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      setMessage('Camera access denied. Please allow camera permission.');
    }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQrCode = qrCode;
    const currentQuantity = quantityTaken;
    
    // Empty the input field immediately after clicking as requested
    setQrCode('');
    setQuantityTaken(1);

    try {
      const { data } = await scanProduct({ qrCode: currentQrCode, quantityTaken: currentQuantity });
      setScannedProduct(data);
      setMessage(`${currentQuantity} units scanned. Remaining: ${data.quantity}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Product not found');
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1 className="gradient-text" style={{ fontSize: '32px', marginBottom: '30px' }}>QR Scanner</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Scan Product</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={startCamera} className="btn btn-success" style={{ flex: 1 }} disabled={showCamera}>
              Open Camera
            </button>
            <button onClick={handleCancel} className="btn btn-secondary" style={{ flex: 1 }} disabled={!showCamera}>
              Cancel / Close
            </button>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center', display: showCamera ? 'block' : 'none' }}>
            <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '300px' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
              {scanning && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '60%', height: '60%', border: '3px solid #10b981', borderRadius: '8px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
                  <div style={{ marginTop: '10px', color: '#10b981', fontSize: '13px', fontWeight: '600', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '20px' }}>Scanning...</div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          <form onSubmit={handleScan}>
            <input
              type="text"
              placeholder="Enter QR Code or use camera"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              style={{ width: '100%', marginBottom: '15px' }}
              required
            />
            <input
              type="number"
              placeholder="Quantity Taken"
              value={quantityTaken}
              onChange={(e) => setQuantityTaken(parseInt(e.target.value))}
              min="1"
              style={{ width: '100%', marginBottom: '15px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Scan & Update Stock
            </button>
          </form>

          {message && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: message.includes('scanned') || message.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '8px', 
              color: message.includes('scanned') || message.includes('successfully') ? '#10b981' : '#ef4444',
              border: `1px solid ${message.includes('scanned') || message.includes('successfully') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {message}
            </div>
          )}
        </div>

        {scannedProduct && (
          <div className="card fade-in" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: 'white' }}>Product Details</h3>
            <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: 'var(--primary)' }}>{scannedProduct.productName}</div>
            <p style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Category: {scannedProduct.category}</p>
            <p style={{ marginBottom: '10px', color: 'white' }}>Price: ${scannedProduct.price}</p>
            <p style={{ marginBottom: '10px', fontSize: '20px', fontWeight: '600', color: scannedProduct.quantity < scannedProduct.minStockLevel ? '#ef4444' : '#10b981' }}>
              Stock: {scannedProduct.quantity}
            </p>
            <p style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>QR Code: {scannedProduct.qrCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
