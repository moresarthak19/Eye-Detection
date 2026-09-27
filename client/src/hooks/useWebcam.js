/**
 * Webcam hook for capturing video frames
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { CAMERA_CONFIG } from '../config/constants';

const useWebcam = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('📹 Requesting camera access...');
      console.log('📹 videoRef.current:', videoRef.current);
      console.log('📹 canvasRef.current:', canvasRef.current);

      const constraints = {
        video: {
          width: { ideal: CAMERA_CONFIG.width },
          height: { ideal: CAMERA_CONFIG.height },
          facingMode: CAMERA_CONFIG.facingMode,
        },
        audio: false,
      };

      console.log('📹 Camera constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('📹 Camera stream obtained:', stream);
      console.log('📹 Stream active:', stream.active);
      console.log('📹 Stream tracks:', stream.getTracks());
      
      streamRef.current = stream;

      if (videoRef.current) {
        console.log('📹 Setting stream to video element...');
        videoRef.current.srcObject = stream;
        console.log('📹 Stream set, attempting to play...');
        await videoRef.current.play();
        console.log('📹 Video element playing, readyState:', videoRef.current.readyState);
      } else {
        console.error('❌ videoRef.current is null!');
        throw new Error('Video element ref is not set');
      }

      setIsActive(true);
      setPermissionStatus('granted');
      console.log('✅ Camera started successfully');

      return true;
    } catch (err) {
      console.error('❌ Error starting camera:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access.');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
      
      setIsActive(false);
      return false;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    console.log('Camera stopped');
  }, []);

  // Capture current frame as base64 JPEG
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size if not already set
      if (canvas.width !== CAMERA_CONFIG.width || canvas.height !== CAMERA_CONFIG.height) {
        canvas.width = CAMERA_CONFIG.width;
        canvas.height = CAMERA_CONFIG.height;
      }

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 JPEG
      const base64Image = canvas.toDataURL('image/jpeg', CAMERA_CONFIG.jpegQuality);

      return base64Image;
    } catch (err) {
      console.error('Error capturing frame:', err);
      return null;
    }
  }, []);

  // Start capture loop
  const startCaptureLoop = useCallback((onFrameCapture) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    const interval = 1000 / CAMERA_CONFIG.frameRate; // Convert FPS to ms

    captureIntervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame && onFrameCapture) {
        onFrameCapture(frame, Date.now());
      }
    }, interval);

    console.log(`Capture loop started at ${CAMERA_CONFIG.frameRate} FPS`);
  }, [captureFrame]);

  // Stop capture loop
  const stopCaptureLoop = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      console.log('Capture loop stopped');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCaptureLoop();
      stopCamera();
    };
  }, [stopCamera, stopCaptureLoop]);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    permissionStatus,
    startCamera,
    stopCamera,
    captureFrame,
    startCaptureLoop,
    stopCaptureLoop,
  };
};

export default useWebcam;
