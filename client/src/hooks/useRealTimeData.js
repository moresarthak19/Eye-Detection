/**
 * Real-time data hook - Integrates WebSocket and Webcam
 * Replaces useDummyData with actual backend metrics
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket from './useWebSocket';
import useWebcam from './useWebcam';
import { PROCESSING_CONFIG } from '../config/constants';

const useRealTimeData = () => {
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState({
    blinkRate: 0,
    pupilSize: 0,
    cognitiveLoad: 'LOW',
    cognitiveLoadValue: 0,
    attentionScore: 100,
  });
  const [gazeData, setGazeData] = useState({ x: 0, y: 0 });
  const [faceDetected, setFaceDetected] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [fps, setFps] = useState(0);
  
  // History for charts
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [blinkHistory, setBlinkHistory] = useState([]);
  const [pupilHistory, setPupilHistory] = useState([]);
  
  // Session statistics
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartRef = useRef(null);
  const sessionIntervalRef = useRef(null);
  const lastFrameTimeRef = useRef(null);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Initialize hooks
  const {
    status: wsStatus,
    error: wsError,
    latestMetrics: wsMetrics,
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendFrame,
    resetMetrics: wsResetMetrics,
    isConnected,
  } = useWebSocket();

  const {
    videoRef,
    canvasRef,
    error: cameraError,
    permissionStatus,
    startCamera,
    stopCamera,
    startCaptureLoop,
    stopCaptureLoop,
  } = useWebcam();

  // Update metrics from WebSocket
  useEffect(() => {
    if (!wsMetrics) return;

    const { metrics: backendMetrics, face_detected, landmarks: backendLandmarks, processing_time_ms } = wsMetrics;

    if (face_detected && backendMetrics) {
      // Debug: Log pupil size to verify it's changing
      if (!window._pupilDebugCount) window._pupilDebugCount = 0;
      window._pupilDebugCount++;
      if (window._pupilDebugCount % 20 === 0) {
        console.log('👁️ Pupil:', backendMetrics.pupil_size_mm?.toFixed(2), 'mm');
      }
      
      // Update current metrics
      setMetrics({
        blinkRate: backendMetrics.blink_rate || 0,
        pupilSize: backendMetrics.pupil_size_mm || 0,
        cognitiveLoad: backendMetrics.cognitive_load || 'LOW',
        cognitiveLoadValue: backendMetrics.cognitive_load_value || 0,
        attentionScore: backendMetrics.attention_score || 100,
      });

      setGazeData({
        x: backendMetrics.gaze_x || 0,
        y: backendMetrics.gaze_y || 0,
      });
      
      // Debug: Log gaze data
      if (window._pupilDebugCount % 20 === 0) {
        console.log('👀 Gaze:', { x: backendMetrics.gaze_x, y: backendMetrics.gaze_y });
      }

      setFaceDetected(true);
      setLandmarks({
        all: backendLandmarks,
        faceOval: wsMetrics.face_oval,
        leftEye: wsMetrics.left_eye,
        rightEye: wsMetrics.right_eye,
        leftIris: wsMetrics.left_iris,
        rightIris: wsMetrics.right_iris,
      });

      // Update history for charts
      const timestamp = Date.now();
      const newDataPoint = {
        timestamp,
        cognitiveLoad: backendMetrics.cognitive_load_value,
        blinkRate: backendMetrics.blink_rate,
        pupilSize: backendMetrics.pupil_size_mm,
        attentionScore: backendMetrics.attention_score,
      };

      setMetricsHistory(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-PROCESSING_CONFIG.metricsHistorySize);
      });

      setBlinkHistory(prev => {
        const updated = [...prev, { timestamp, value: backendMetrics.blink_rate }];
        return updated.slice(-PROCESSING_CONFIG.metricsHistorySize);
      });

      setPupilHistory(prev => {
        const updated = [...prev, { timestamp, value: backendMetrics.pupil_size_mm }];
        return updated.slice(-PROCESSING_CONFIG.metricsHistorySize);
      });
    } else {
      setFaceDetected(false);
      setLandmarks(null);
    }

    setProcessingTime(processing_time_ms || 0);
    isProcessingRef.current = false;
  }, [wsMetrics]);

  // Handle frame capture
  const handleFrameCapture = useCallback((frame, timestamp) => {
    // Skip if still processing previous frame
    if (isProcessingRef.current) {
      return;
    }

    // Send frame to backend
    const sent = sendFrame(frame, timestamp);
    if (sent) {
      isProcessingRef.current = true;
      frameCountRef.current += 1;
      lastFrameTimeRef.current = timestamp;
      
      // Log every 10th frame to avoid console spam
      if (frameCountRef.current % 10 === 0) {
        console.log(`📤 Sent frame #${frameCountRef.current}`);
      }
    }
  }, [sendFrame]);

  // Start session
  const startSession = useCallback(async () => {
    console.log('=== Starting session ===');
    console.log('videoRef:', videoRef);
    console.log('canvasRef:', canvasRef);
    console.log('1. Connecting to WebSocket...');

    // Connect to WebSocket
    wsConnect();

    // Wait a bit for WebSocket to connect
    console.log('2. Waiting for WebSocket connection...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('3. WebSocket should be connected now');

    // Start camera
    console.log('4. Starting camera...');
    const cameraStarted = await startCamera();
    console.log('5. Camera start result:', cameraStarted);
    
    if (!cameraStarted) {
      console.error('❌ Failed to start camera');
      return false;
    }

    console.log('6. Camera started successfully!');

    // Start capture loop
    console.log('7. Starting capture loop...');
    startCaptureLoop(handleFrameCapture);
    console.log('8. Capture loop started');

    // Start session timer
    sessionStartRef.current = Date.now();
    sessionIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      setSessionDuration(elapsed);
    }, 1000);

    // Start FPS counter
    frameCountRef.current = 0;
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    setIsActive(true);
    console.log('Session started successfully');
    return true;
  }, [wsConnect, startCamera, startCaptureLoop, handleFrameCapture, videoRef, canvasRef]);

  // Stop session
  const stopSession = useCallback(() => {
    console.log('Stopping session...');

    stopCaptureLoop();
    stopCamera();
    wsDisconnect();

    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }

    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }

    // Reset processing flag
    isProcessingRef.current = false;
    
    // Clear face detection state
    setFaceDetected(false);
    setLandmarks(null);

    setIsActive(false);
    setFps(0);
    console.log('Session stopped');
  }, [stopCaptureLoop, stopCamera, wsDisconnect]);

  // Reset session
  const resetSession = useCallback(() => {
    console.log('Resetting session...');

    // Reset backend metrics and detector
    wsResetMetrics();
    
    // Clear frontend state
    setMetricsHistory([]);
    setBlinkHistory([]);
    setPupilHistory([]);
    setSessionDuration(0);
    sessionStartRef.current = Date.now();

    setMetrics({
      blinkRate: 0,
      pupilSize: 0,
      cognitiveLoad: 'LOW',
      cognitiveLoadValue: 0,
      attentionScore: 100,
    });
    setGazeData({ x: 0, y: 0 });
    setFaceDetected(false);
    setLandmarks(null);
    
    // Reset processing flag to allow new frames
    isProcessingRef.current = false;

    console.log('Session reset complete');
  }, [wsResetMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopSession();
      }
    };
  }, [isActive, stopSession]);

  return {
    // State
    isActive,
    metrics,
    gazeData,
    faceDetected,
    landmarks,
    sessionDuration,
    
    // History for charts
    metricsHistory,
    blinkHistory,
    pupilHistory,
    
    // Performance metrics
    processingTime,
    fps,
    
    // Connection status
    wsStatus,
    isConnected,
    permissionStatus,
    
    // Errors
    error: wsError || cameraError,
    
    // Controls
    startSession,
    stopSession,
    resetSession,
    
    // Refs for components
    videoRef,
    canvasRef,
  };
};

export default useRealTimeData;
