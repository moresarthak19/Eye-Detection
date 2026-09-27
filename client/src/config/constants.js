/**
 * Application configuration constants
 */

export const WEBSOCKET_CONFIG = {
  url: 'ws://localhost:8000/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  pingInterval: 30000,
  connectionTimeout: 10000,
};

export const CAMERA_CONFIG = {
  frameRate: 10, // FPS
  width: 640,
  height: 480,
  jpegQuality: 0.8,
  facingMode: 'user', // Front camera
};

export const CANVAS_CONFIG = {
  colors: {
    faceOval: '#4ade80', // Green
    eyeBox: '#22d3ee', // Cyan
    iris: '#ef4444', // Red
    gaze: '#fbbf24', // Yellow
    landmarks: 'rgba(255, 255, 255, 0.3)', // White semi-transparent
    blinkFlash: 'rgba(34, 211, 238, 0.3)', // Cyan flash
  },
  lineWidth: 2,
  pointRadius: 2,
  irisRadius: 5,
  gazeArrowLength: 150, // Increased from 50 to make gaze arrows more visible
};

export const PROCESSING_CONFIG = {
  maxProcessingTime: 200, // ms - skip frame if processing takes longer
  metricsHistorySize: 100, // Number of data points to keep for charts
  smoothingWindow: 5, // Frames to average for smoothing
};
