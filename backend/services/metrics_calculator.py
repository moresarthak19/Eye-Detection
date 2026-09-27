"""
Eye metrics and cognitive load calculation
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import deque
import time
from datetime import datetime

from config import (
    EAR_CONFIG,
    COGNITIVE_LOAD_THRESHOLDS,
    GAZE_CONFIG,
    PUPIL_CONFIG,
)


class MetricsCalculator:
    """Calculate eye metrics and cognitive load from face landmarks"""
    
    def __init__(self):
        # Blink detection state
        self.blink_counter = 0
        self.total_blinks = 0
        self.blink_timestamps = deque(maxlen=EAR_CONFIG["window_size"])
        self.consec_frames_below_threshold = 0
        
        # Gaze smoothing
        self.gaze_history = deque(maxlen=GAZE_CONFIG["smoothing_window"])
        
        # Startup message to verify new code is loaded
        print("✅ MetricsCalculator initialized with DYNAMIC PUPIL CALCULATION v2.0")
        
        # Pupil baseline for cognitive load
        self.pupil_baseline = None
        self.pupil_history = deque(maxlen=30)  # 3 seconds at 10fps
        
        # Session start time
        self.session_start = time.time()
    
    def calculate_eye_aspect_ratio(self, eye_landmarks: List[List[float]]) -> float:
        """
        Calculate Eye Aspect Ratio (EAR) for blink detection
        
        Formula: EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
        
        Args:
            eye_landmarks: 6 eye contour points [p1, p2, p3, p4, p5, p6]
            
        Returns:
            float: Eye Aspect Ratio
        """
        eye = np.array(eye_landmarks)
        
        # Vertical distances
        vertical1 = np.linalg.norm(eye[1] - eye[5])  # p2 - p6
        vertical2 = np.linalg.norm(eye[2] - eye[4])  # p3 - p5
        
        # Horizontal distance
        horizontal = np.linalg.norm(eye[0] - eye[3])  # p1 - p4
        
        # Calculate EAR
        ear = (vertical1 + vertical2) / (2.0 * horizontal)
        
        return ear
    
    def detect_blink(self, left_ear: float, right_ear: float) -> bool:
        """
        Detect blink based on EAR threshold
        
        Args:
            left_ear: Left eye aspect ratio
            right_ear: Right eye aspect ratio
            
        Returns:
            bool: True if blink detected
        """
        avg_ear = (left_ear + right_ear) / 2.0
        
        # Check if below threshold
        if avg_ear < EAR_CONFIG["blink_threshold"]:
            self.consec_frames_below_threshold += 1
        else:
            # Check if we just completed a blink
            if self.consec_frames_below_threshold >= EAR_CONFIG["consec_frames"]:
                self.total_blinks += 1
                self.blink_timestamps.append(time.time())
                self.consec_frames_below_threshold = 0
                return True
            self.consec_frames_below_threshold = 0
        
        return False
    
    def calculate_blink_rate(self) -> float:
        """
        Calculate blinks per minute based on last 60 seconds
        
        Returns:
            float: Blinks per minute
        """
        if len(self.blink_timestamps) < 1:
            return 0.0
        
        # Use sliding 60-second window
        current_time = time.time()
        window_start = current_time - 60.0  # Last 60 seconds
        
        # Count blinks in the last 60 seconds
        recent_blinks = [t for t in self.blink_timestamps if t >= window_start]
        
        # Keep only recent blinks in history
        self.blink_timestamps = recent_blinks
        
        # Calculate blinks per minute based on actual blinks in last 60s
        return round(len(recent_blinks), 1)  # Already per minute since window is 60s
    
    def calculate_pupil_size(self, iris_landmarks: List[List[float]], eye_landmarks: List[List[float]] = None, ear: float = 1.0, eye_side: str = 'left') -> float:
        """
        Estimate pupil size in mm based on iris diameter relative to eye size
        
        Args:
            iris_landmarks: 5 iris points [center, right, top, left, bottom]
            eye_landmarks: Eye contour points (optional, for better scaling)
            ear: Eye Aspect Ratio (0 = closed, 1 = open) - affects pupil visibility
            eye_side: 'left' or 'right' - to maintain separate state per eye
            
        Returns:
            float: Estimated pupil diameter in mm
        """
        # Create separate state variables for each eye
        phase_attr = f'_pupil_variation_phase_{eye_side}'
        base_size_attr = f'_pupil_base_size_{eye_side}'
        last_iris_attr = f'_last_iris_diameter_{eye_side}'
        last_pupil_attr = f'_last_pupil_value_{eye_side}'
        
        # If eye is closed (EAR < 0.2), pupil is not visible
        if ear < 0.2:
            # Return 0 since pupil cannot be seen when eye is closed
            return 0.0
        
        iris = np.array(iris_landmarks)
        
        # Calculate iris diameter in pixels (average of horizontal and vertical)
        # MediaPipe iris landmarks are: [center, right, top, left, bottom]
        horizontal = np.linalg.norm(iris[1] - iris[3])  # right - left
        vertical = np.linalg.norm(iris[2] - iris[4])  # top - bottom
        iris_diameter_px = (horizontal + vertical) / 2.0
        
        # Smooth iris diameter to reduce jitter from landmark detection
        iris_history_attr = f'_iris_history_{eye_side}'
        if not hasattr(self, iris_history_attr):
            setattr(self, iris_history_attr, deque(maxlen=5))
        
        iris_history = getattr(self, iris_history_attr)
        iris_history.append(iris_diameter_px)
        iris_diameter_px = np.mean(list(iris_history))  # Moving average
        
        # If eye landmarks provided, use eye width for better calibration
        if eye_landmarks is not None and len(eye_landmarks) > 0:
            eye = np.array(eye_landmarks)
            # Calculate eye width (outer to inner corner)
            eye_width = np.linalg.norm(eye[0] - eye[3])
            # Iris is typically 11.7mm, eye width is typically 24-25mm
            # Use eye width as reference for better accuracy
            iris_to_mm_ratio = (24.0 / eye_width) if eye_width > 0 else (PUPIL_CONFIG["avg_iris_diameter_mm"] / iris_diameter_px)
        else:
            # Fallback: use iris diameter directly
            iris_to_mm_ratio = PUPIL_CONFIG["avg_iris_diameter_mm"] / max(iris_diameter_px, 1.0)
        
        # Calculate actual pupil size based on iris measurements
        # Pupil is estimated as a proportion of iris diameter
        # Using a stable baseline ratio of 40-45% (normal indoor lighting)
        pupil_ratio = 0.42  # Realistic average pupil-to-iris ratio
        
        # Calculate actual pupil size based on iris measurements
        # Pupil is estimated as a proportion of iris diameter
        # Using a stable baseline ratio of 40-45% (normal indoor lighting)
        pupil_ratio = 0.42  # Realistic average pupil-to-iris ratio
        
        # Calculate pupil diameter in mm
        pupil_diameter_mm = iris_diameter_px * iris_to_mm_ratio * pupil_ratio
        
        # Apply smoothing to reduce measurement noise
        pupil_smooth_attr = f'_pupil_smooth_{eye_side}'
        if not hasattr(self, pupil_smooth_attr):
            setattr(self, pupil_smooth_attr, deque(maxlen=3))
        
        pupil_smooth = getattr(self, pupil_smooth_attr)
        pupil_smooth.append(pupil_diameter_mm)
        pupil_diameter_mm = np.mean(list(pupil_smooth))
        
        # Clamp to realistic values
        pupil_diameter_mm = np.clip(
            pupil_diameter_mm,
            PUPIL_CONFIG["min_pupil_mm"],
            PUPIL_CONFIG["max_pupil_mm"]
        )
        
        # Store last valid value per eye
        setattr(self, last_pupil_attr, pupil_diameter_mm)
        
        # Add to history for baseline calculation
        self.pupil_history.append(pupil_diameter_mm)
        
        # Update baseline (moving average of first 30 measurements)
        if len(self.pupil_history) >= 10:
            self.pupil_baseline = np.mean(list(self.pupil_history)[:30])
        
        return round(pupil_diameter_mm, 2)
    
    def calculate_gaze_direction(
        self,
        eye_landmarks: List[List[float]],
        iris_landmarks: List[List[float]]
    ) -> Tuple[float, float]:
        """
        Calculate gaze direction based on iris position relative to eye
        
        Args:
            eye_landmarks: Eye contour points
            iris_landmarks: Iris center and edge points
            
        Returns:
            Tuple[float, float]: (gaze_x, gaze_y) normalized to [-1, 1]
        """
        eye = np.array(eye_landmarks)
        iris_center = np.array(iris_landmarks[0][:2])  # Only x, y
        
        # Calculate eye center
        eye_center = np.mean(eye[:, :2], axis=0)  # Only x, y
        
        # Calculate eye dimensions
        eye_width = np.linalg.norm(eye[0][:2] - eye[3][:2])
        eye_height = np.linalg.norm(eye[1][:2] - eye[5][:2])
        
        # Calculate gaze vector
        gaze_vector = iris_center - eye_center
        
        # Normalize to [-1, 1]
        gaze_x = np.clip(gaze_vector[0] / (eye_width / 2), -1, 1)
        gaze_y = np.clip(gaze_vector[1] / (eye_height / 2), -1, 1)
        
        # Smooth gaze with history
        self.gaze_history.append((gaze_x, gaze_y))
        if len(self.gaze_history) > 0:
            gaze_x = np.mean([g[0] for g in self.gaze_history])
            gaze_y = np.mean([g[1] for g in self.gaze_history])
        
        # Debug logging
        if not hasattr(self, '_gaze_debug_counter'):
            self._gaze_debug_counter = 0
        self._gaze_debug_counter += 1
        if self._gaze_debug_counter % 100 == 0:
            print(f"👀 Gaze: x={gaze_x:.3f} y={gaze_y:.3f} (normalized -1 to 1)")
        
        return float(gaze_x), float(gaze_y)
    
    def calculate_cognitive_load(
        self,
        pupil_size: float,
        blink_rate: float,
        gaze_x: float,
        gaze_y: float
    ) -> Tuple[str, int]:
        """
        Calculate cognitive load based on multiple factors
        
        Args:
            pupil_size: Current pupil size in mm
            blink_rate: Current blink rate per minute
            gaze_x: Horizontal gaze direction
            gaze_y: Vertical gaze direction
            
        Returns:
            Tuple[str, int]: (load_level, load_value)
        """
        load_score = 0
        
        # Factor 1: Pupil dilation (0-40 points)
        if self.pupil_baseline and len(self.pupil_history) >= 10:
            pupil_change = ((pupil_size - self.pupil_baseline) / self.pupil_baseline) * 100
            # Increased dilation = higher cognitive load
            pupil_score = np.clip(pupil_change * 2, 0, 40)
            load_score += pupil_score
        else:
            # No baseline yet, use moderate score
            load_score += 20
        
        # Factor 2: Blink rate (0-30 points)
        # Low blink rate (high concentration) or very high (fatigue) = higher load
        optimal_blink_rate = 17  # Normal resting blink rate
        blink_deviation = abs(blink_rate - optimal_blink_rate)
        blink_score = np.clip(blink_deviation * 1.5, 0, 30)
        load_score += blink_score
        
        # Factor 3: Gaze fixation (0-30 points)
        # Centered gaze with low movement = high concentration
        gaze_distance = np.sqrt(gaze_x**2 + gaze_y**2)
        if gaze_distance < 0.3:  # Centered gaze
            fixation_score = 20
        else:
            fixation_score = np.clip(gaze_distance * 15, 0, 30)
        load_score += fixation_score
        
        # Normalize to 0-100
        load_score = int(np.clip(load_score, 0, 100))
        
        # Determine load level
        for level, (min_val, max_val) in COGNITIVE_LOAD_THRESHOLDS.items():
            if min_val <= load_score < max_val:
                return level, load_score
        
        return "CRITICAL", load_score
    
    def calculate_attention_score(self, cognitive_load_value: int, blink_rate: float) -> int:
        """
        Calculate attention score (0-100)
        
        Args:
            cognitive_load_value: Cognitive load score
            blink_rate: Current blink rate
            
        Returns:
            int: Attention score (higher = more attentive)
        """
        # Moderate cognitive load with normal blink rate = high attention
        # Very low or very high load = low attention
        
        # Optimal load for attention is 40-70 (engaged but not overwhelmed)
        if 40 <= cognitive_load_value <= 70:
            load_attention = 100 - abs(cognitive_load_value - 55)
        else:
            load_attention = 100 - abs(cognitive_load_value - 55) * 1.5
        
        # Optimal blink rate for attention is 12-20 per minute
        if 12 <= blink_rate <= 20:
            blink_attention = 100
        else:
            blink_attention = 100 - abs(blink_rate - 16) * 3
        
        # Combine factors
        attention_score = int(np.clip((load_attention * 0.6 + blink_attention * 0.4), 0, 100))
        
        return attention_score
    
    def calculate_all_metrics(self, face_data: Dict) -> Dict:
        """
        Calculate all eye metrics from face detection data
        
        Args:
            face_data: Face detection results from FaceDetector
            
        Returns:
            Dict: All calculated metrics
        """
        # Calculate EAR for both eyes
        left_ear = self.calculate_eye_aspect_ratio(face_data["left_eye"])
        right_ear = self.calculate_eye_aspect_ratio(face_data["right_eye"])
        
        # Detect blink
        blink_detected = self.detect_blink(left_ear, right_ear)
        
        # Calculate blink rate
        blink_rate = self.calculate_blink_rate()
        
        # Calculate pupil size (average of both eyes) - pass EAR and eye side
        left_pupil = self.calculate_pupil_size(face_data["left_iris"], face_data["left_eye"], left_ear, 'left')
        right_pupil = self.calculate_pupil_size(face_data["right_iris"], face_data["right_eye"], right_ear, 'right')
        avg_pupil_size = round((left_pupil + right_pupil) / 2, 2)
        
        # Calculate gaze direction (average of both eyes)
        left_gaze_x, left_gaze_y = self.calculate_gaze_direction(
            face_data["left_eye"], face_data["left_iris"]
        )
        right_gaze_x, right_gaze_y = self.calculate_gaze_direction(
            face_data["right_eye"], face_data["right_iris"]
        )
        # Average and scale up for frontend display (normalize -1 to 1 becomes -100 to 100)
        avg_gaze_x = round((left_gaze_x + right_gaze_x) / 2 * 100, 1)
        avg_gaze_y = round((left_gaze_y + right_gaze_y) / 2 * 100, 1)
        
        # Calculate cognitive load
        cognitive_load_level, cognitive_load_value = self.calculate_cognitive_load(
            avg_pupil_size, blink_rate, avg_gaze_x, avg_gaze_y
        )
        
        # Calculate attention score
        attention_score = self.calculate_attention_score(cognitive_load_value, blink_rate)
        
        return {
            "blink_detected": blink_detected,
            "blink_rate": blink_rate,
            "total_blinks": self.total_blinks,
            "pupil_size_mm": avg_pupil_size,
            "left_pupil_mm": left_pupil,
            "right_pupil_mm": right_pupil,
            "gaze_x": avg_gaze_x,
            "gaze_y": avg_gaze_y,
            "left_ear": round(left_ear, 3),
            "right_ear": round(right_ear, 3),
            "cognitive_load": cognitive_load_level,
            "cognitive_load_value": cognitive_load_value,
            "attention_score": attention_score,
        }
    
    def reset(self):
        """Reset all metrics and state"""
        self.blink_counter = 0
        self.total_blinks = 0
        self.blink_timestamps.clear()
        self.consec_frames_below_threshold = 0
        self.gaze_history.clear()
        self.pupil_baseline = None
        self.pupil_history.clear()
        self.session_start = time.time()
