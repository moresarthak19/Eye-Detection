"""
Configuration constants for Eye Detection Backend
"""

# MediaPipe Configuration
MEDIAPIPE_CONFIG = {
    "max_num_faces": 1,
    "refine_landmarks": True,  # Enable iris tracking
    "min_detection_confidence": 0.5,
    "min_tracking_confidence": 0.5,
    "static_image_mode": False,  # Video stream mode
}

# Eye Aspect Ratio (EAR) Configuration
EAR_CONFIG = {
    "blink_threshold": 0.21,  # EAR below this = blink
    "consec_frames": 2,  # Frames to confirm blink
    "window_size": 300,  # Frame window for blink rate calculation (30 sec at 10fps)
}

# Cognitive Load Thresholds
COGNITIVE_LOAD_THRESHOLDS = {
    "LOW": (0, 40),
    "MEDIUM": (40, 70),
    "HIGH": (70, 85),
    "CRITICAL": (85, 100),
}

# Gaze Configuration
GAZE_CONFIG = {
    "smoothing_window": 5,  # Frames to smooth gaze coordinates
}

# Frame Processing
FRAME_CONFIG = {
    "target_width": 640,
    "target_height": 480,
    "max_fps": 10,
}

# WebSocket Configuration
WEBSOCKET_CONFIG = {
    "max_queue_size": 30,
    "timeout": 60,  # seconds
}

# CORS Configuration
CORS_CONFIG = {
    "allow_origins": ["http://localhost:5173", "http://localhost:3000"],
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

# Pupil Size Configuration (mm estimates based on average human eye)
PUPIL_CONFIG = {
    "avg_iris_diameter_mm": 11.7,  # Average human iris diameter
    "min_pupil_mm": 2.0,
    "max_pupil_mm": 8.0,
}
