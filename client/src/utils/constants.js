// Application constants
export const COGNITIVE_LOAD_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger'
};

// Realistic ranges for eye tracking metrics
export const METRICS_RANGES = {
  BLINK_RATE: { min: 10, max: 25 }, // blinks per minute
  PUPIL_SIZE: { min: 2, max: 8 },   // millimeters
  GAZE_X: { min: -100, max: 100 },  // pixels from center
  GAZE_Y: { min: -100, max: 100 }   // pixels from center
};

// Thresholds for alerts
export const ALERT_THRESHOLDS = {
  HIGH_COGNITIVE_LOAD_DURATION: 120000, // 2 minutes in milliseconds
  LOW_BLINK_RATE: 8,
  HIGH_BLINK_RATE: 30
};

// Chart configuration
export const CHART_CONFIG = {
  MAX_DATA_POINTS: 30,  // Show last 30 data points
  UPDATE_INTERVAL: 2000 // Update every 2 seconds
};

// Color scheme
export const COLORS = {
  LOW: '#4ade80',      // green
  MEDIUM: '#fbbf24',   // yellow
  HIGH: '#ef4444',     // red
  PRIMARY: '#00d4ff',  // cyan
  BACKGROUND: '#1a1a2e',
  SURFACE: '#16213e'
};
