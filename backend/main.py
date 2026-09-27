"""
FastAPI WebSocket server for Eye Detection and Cognitive Load Analysis
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import time
from typing import Dict

from config import CORS_CONFIG, FRAME_CONFIG
from services.face_detector import FaceDetector
from services.metrics_calculator import MetricsCalculator
from utils.frame_processor import FrameProcessor

# Initialize FastAPI app
app = FastAPI(
    title="Eye Detection Backend",
    description="Real-time eye tracking and cognitive load analysis using MediaPipe",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_CONFIG["allow_origins"],
    allow_credentials=CORS_CONFIG["allow_credentials"],
    allow_methods=CORS_CONFIG["allow_methods"],
    allow_headers=CORS_CONFIG["allow_headers"],
)

# Global instances (one per WebSocket connection will be created)
face_detector = None
metrics_calculator = None


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Eye Detection Backend API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time frame processing
    
    Expected message format from client:
    {
        "type": "frame",
        "data": "base64_jpeg_string",
        "timestamp": 1234567890
    }
    
    Response format:
    {
        "type": "metrics",
        "timestamp": 1234567890,
        "processing_time_ms": 45.2,
        "face_detected": true,
        "landmarks": [...],
        "metrics": {
            "blink_rate": 15.2,
            "pupil_size_mm": 4.5,
            "gaze_x": 0.2,
            "gaze_y": -0.1,
            "cognitive_load": "MEDIUM",
            "cognitive_load_value": 65,
            "attention_score": 82
        }
    }
    """
    await websocket.accept()
    print("WebSocket connection established")
    
    # Initialize per-connection instances
    detector = FaceDetector()
    calculator = MetricsCalculator()
    processor = FrameProcessor()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                start_time = time.time()
                
                # Extract frame data
                base64_frame = message.get("data")
                client_timestamp = message.get("timestamp")
                
                if not base64_frame:
                    await websocket.send_json({
                        "type": "error",
                        "message": "No frame data provided",
                        "timestamp": time.time(),
                    })
                    continue
                
                # Process frame
                result = processor.process_frame(
                    base64_frame,
                    FRAME_CONFIG["target_width"],
                    FRAME_CONFIG["target_height"]
                )
                
                if result is None:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Failed to decode frame",
                        "timestamp": time.time(),
                    })
                    continue
                
                rgb_frame, frame_dims = result
                
                # Detect face
                face_data = detector.detect(rgb_frame, frame_dims)
                
                if face_data is None:
                    # No face detected
                    await websocket.send_json({
                        "type": "metrics",
                        "timestamp": client_timestamp,
                        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                        "face_detected": False,
                        "landmarks": None,
                        "metrics": None,
                    })
                    continue
                
                # Calculate metrics
                metrics = calculator.calculate_all_metrics(face_data)
                
                # Calculate processing time
                processing_time = round((time.time() - start_time) * 1000, 2)
                
                # Send response
                await websocket.send_json({
                    "type": "metrics",
                    "timestamp": client_timestamp,
                    "processing_time_ms": processing_time,
                    "face_detected": True,
                    "landmarks": face_data["all_landmarks"],
                    "face_oval": face_data["face_oval"],
                    "left_eye": face_data["left_eye"],
                    "right_eye": face_data["right_eye"],
                    "left_iris": face_data["left_iris"],
                    "right_iris": face_data["right_iris"],
                    "metrics": metrics,
                })
                
            elif message.get("type") == "reset":
                # Reset both metrics calculator and face detector
                calculator.reset()
                detector.reset()
                await websocket.send_json({
                    "type": "reset_confirmed",
                    "timestamp": time.time(),
                    "message": "Metrics and detector reset successfully",
                })
                
            elif message.get("type") == "ping":
                # Respond to ping
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": time.time(),
                })
                
    except WebSocketDisconnect:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e),
                "timestamp": time.time(),
            })
        except:
            pass
    finally:
        # Cleanup
        detector.close()
        print("WebSocket connection cleaned up")


if __name__ == "__main__":
    import uvicorn
    
    print("Starting Eye Detection Backend...")
    print("WebSocket endpoint: ws://localhost:8000/ws")
    print("Health check: http://localhost:8000/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
