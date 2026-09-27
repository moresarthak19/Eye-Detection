"""
MediaPipe Face Mesh integration for face and eye landmark detection
"""
import mediapipe as mp
import numpy as np
from typing import Optional, Dict, List, Tuple
import cv2

from config import MEDIAPIPE_CONFIG


class FaceDetector:
    """Wrapper for MediaPipe Face Mesh with iris tracking"""
    
    # MediaPipe Face Mesh landmark indices
    LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]  # Eye contour points
    RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
    
    LEFT_IRIS_INDICES = [468, 469, 470, 471, 472]  # Iris center + 4 edge points
    RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477]
    
    FACE_OVAL_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
    
    def __init__(self):
        """Initialize MediaPipe Face Mesh"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=MEDIAPIPE_CONFIG["max_num_faces"],
            refine_landmarks=MEDIAPIPE_CONFIG["refine_landmarks"],
            min_detection_confidence=MEDIAPIPE_CONFIG["min_detection_confidence"],
            min_tracking_confidence=MEDIAPIPE_CONFIG["min_tracking_confidence"],
            static_image_mode=MEDIAPIPE_CONFIG["static_image_mode"],
        )
        
    def detect(self, rgb_frame: np.ndarray, frame_dims: Tuple[int, int]) -> Optional[Dict]:
        """
        Detect face and extract landmarks
        
        Args:
            rgb_frame: RGB image (MediaPipe format)
            frame_dims: Original frame dimensions (width, height)
            
        Returns:
            Dict with face detection results or None if no face detected
        """
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return None
        
        # Get first face (we only process one face)
        face_landmarks = results.multi_face_landmarks[0]
        
        # Extract landmark coordinates
        width, height = frame_dims
        landmarks_3d = []
        
        for landmark in face_landmarks.landmark:
            x = landmark.x * width
            y = landmark.y * height
            z = landmark.z * width  # Depth relative to face width
            landmarks_3d.append([x, y, z])
        
        landmarks_3d = np.array(landmarks_3d)
        
        # Extract specific landmark groups
        left_eye = self._extract_landmarks(landmarks_3d, self.LEFT_EYE_INDICES)
        right_eye = self._extract_landmarks(landmarks_3d, self.RIGHT_EYE_INDICES)
        left_iris = self._extract_landmarks(landmarks_3d, self.LEFT_IRIS_INDICES)
        right_iris = self._extract_landmarks(landmarks_3d, self.RIGHT_IRIS_INDICES)
        face_oval = self._extract_landmarks(landmarks_3d, self.FACE_OVAL_INDICES)
        
        return {
            "face_detected": True,
            "all_landmarks": landmarks_3d.tolist(),
            "left_eye": left_eye,
            "right_eye": right_eye,
            "left_iris": left_iris,
            "right_iris": right_iris,
            "face_oval": face_oval,
            "frame_dims": frame_dims,
        }
    
    def _extract_landmarks(self, landmarks: np.ndarray, indices: List[int]) -> List[List[float]]:
        """Extract specific landmarks by indices"""
        return landmarks[indices].tolist()
    
    def reset(self):
        """Reset MediaPipe Face Mesh - useful after pause/resume"""
        print("🔄 Resetting FaceDetector...")
        if self.face_mesh:
            self.face_mesh.close()
        
        # Reinitialize with same config
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=MEDIAPIPE_CONFIG["max_num_faces"],
            refine_landmarks=MEDIAPIPE_CONFIG["refine_landmarks"],
            min_detection_confidence=MEDIAPIPE_CONFIG["min_detection_confidence"],
            min_tracking_confidence=MEDIAPIPE_CONFIG["min_tracking_confidence"],
            static_image_mode=MEDIAPIPE_CONFIG["static_image_mode"],
        )
        print("✅ FaceDetector reset complete")
    
    def close(self):
        """Clean up MediaPipe resources"""
        if self.face_mesh:
            self.face_mesh.close()
            self.face_mesh = None
