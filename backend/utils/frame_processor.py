"""
Frame processing utilities for decoding and preprocessing video frames
"""
import base64
import cv2
import numpy as np
from typing import Optional, Tuple


class FrameProcessor:
    """Handles frame decoding and preprocessing for MediaPipe"""
    
    @staticmethod
    def decode_base64_frame(base64_string: str) -> Optional[np.ndarray]:
        """
        Decode base64 JPEG string to OpenCV BGR image
        
        Args:
            base64_string: Base64 encoded JPEG image
            
        Returns:
            numpy.ndarray: BGR image or None if decoding fails
        """
        try:
            # Remove data URL prefix if present
            if "base64," in base64_string:
                base64_string = base64_string.split("base64,")[1]
            
            # Decode base64 to bytes
            img_bytes = base64.b64decode(base64_string)
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(img_bytes, np.uint8)
            
            # Decode to BGR image
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return img
        except Exception as e:
            print(f"Error decoding frame: {e}")
            return None
    
    @staticmethod
    def resize_frame(frame: np.ndarray, target_width: int, target_height: int) -> np.ndarray:
        """
        Resize frame while maintaining aspect ratio
        
        Args:
            frame: Input BGR image
            target_width: Target width in pixels
            target_height: Target height in pixels
            
        Returns:
            numpy.ndarray: Resized BGR image
        """
        height, width = frame.shape[:2]
        
        # Calculate aspect ratio
        aspect = width / height
        target_aspect = target_width / target_height
        
        if aspect > target_aspect:
            # Width is the limiting factor
            new_width = target_width
            new_height = int(target_width / aspect)
        else:
            # Height is the limiting factor
            new_height = target_height
            new_width = int(target_height * aspect)
        
        resized = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        return resized
    
    @staticmethod
    def preprocess_for_mediapipe(frame: np.ndarray) -> Tuple[np.ndarray, Tuple[int, int]]:
        """
        Preprocess frame for MediaPipe (convert to RGB)
        
        Args:
            frame: Input BGR image
            
        Returns:
            Tuple of (RGB image, original dimensions)
        """
        original_dims = (frame.shape[1], frame.shape[0])  # (width, height)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return rgb_frame, original_dims
    
    @staticmethod
    def process_frame(base64_string: str, target_width: int = 640, target_height: int = 480) -> Optional[Tuple[np.ndarray, Tuple[int, int]]]:
        """
        Complete frame processing pipeline
        
        Args:
            base64_string: Base64 encoded JPEG image
            target_width: Target width for processing
            target_height: Target height for processing
            
        Returns:
            Tuple of (RGB image ready for MediaPipe, original dimensions) or None
        """
        # Decode frame
        frame = FrameProcessor.decode_base64_frame(base64_string)
        if frame is None:
            return None
        
        # Resize if needed
        height, width = frame.shape[:2]
        if width > target_width or height > target_height:
            frame = FrameProcessor.resize_frame(frame, target_width, target_height)
        
        # Convert to RGB for MediaPipe
        rgb_frame, original_dims = FrameProcessor.preprocess_for_mediapipe(frame)
        
        return rgb_frame, original_dims
