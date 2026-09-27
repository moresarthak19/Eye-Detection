# Eye Detection Backend

Python backend for real-time eye tracking and cognitive load analysis using MediaPipe Face Mesh.

## Features

- **Real-time Face Detection**: MediaPipe Face Mesh with 468 facial landmarks + iris tracking
- **Eye Metrics**: Blink rate, pupil dilation, gaze direction
- **Cognitive Load Analysis**: Multi-factor algorithm combining pupil size, blink patterns, and gaze fixation
- **WebSocket Communication**: Low-latency bidirectional communication with React frontend
- **FastAPI**: Modern async Python web framework

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. Navigate to the backend directory:
```bash
cd d:\project\eye-detection\backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the FastAPI server with uvicorn:

```bash
python main.py
```

Or use uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on:
- **WebSocket**: `ws://localhost:8000/ws`
- **Health Check**: `http://localhost:8000/health`
- **API Docs**: `http://localhost:8000/docs`

## API Endpoints

### WebSocket: `/ws`

Real-time frame processing endpoint.

**Client → Server Message Format:**
```json
{
  "type": "frame",
  "data": "base64_encoded_jpeg_string",
  "timestamp": 1234567890
}
```

**Server → Client Response Format:**
```json
{
  "type": "metrics",
  "timestamp": 1234567890,
  "processing_time_ms": 45.2,
  "face_detected": true,
  "landmarks": [[x, y, z], ...],
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
```

**Other Message Types:**
- `{"type": "reset"}` - Reset metrics calculator
- `{"type": "ping"}` - Heartbeat check

### HTTP: `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890
}
```

## Architecture

```
backend/
├── main.py                 # FastAPI app & WebSocket endpoint
├── config.py              # Configuration constants
├── requirements.txt       # Python dependencies
├── services/
│   ├── face_detector.py   # MediaPipe Face Mesh wrapper
│   └── metrics_calculator.py # Eye metrics & cognitive load
└── utils/
    └── frame_processor.py # Frame decoding & preprocessing
```

## Metrics Explanation

### Blink Rate
- Calculated using Eye Aspect Ratio (EAR)
- EAR < 0.21 threshold = blink detected
- Tracked over 30-second rolling window
- Normal range: 12-20 blinks/minute

### Pupil Dilation
- Estimated from iris diameter using MediaPipe iris landmarks
- Baseline established in first 3 seconds
- Increased dilation indicates higher cognitive load
- Normal range: 2-8mm

### Gaze Direction
- Calculated from iris position relative to eye center
- X-axis: -1 (left) to +1 (right)
- Y-axis: -1 (up) to +1 (down)
- Smoothed over 5 frames

### Cognitive Load
Multi-factor algorithm:
1. **Pupil Dilation** (40%): Deviation from baseline
2. **Blink Rate** (30%): Deviation from optimal (17/min)
3. **Gaze Fixation** (30%): Centered gaze = high focus

Levels:
- **LOW**: 0-40 (relaxed)
- **MEDIUM**: 40-70 (engaged)
- **HIGH**: 70-85 (stressed)
- **CRITICAL**: 85-100 (overwhelmed)

### Attention Score
- 0-100 scale (higher = more attentive)
- Based on optimal cognitive load (40-70) and blink rate (12-20)
- Combines engagement without overwhelm

## Configuration

Edit `config.py` to customize:

- MediaPipe detection confidence
- Blink detection threshold
- Cognitive load thresholds
- Frame processing settings
- CORS origins

## Performance

- **Target**: 10 FPS (100ms per frame)
- **Typical Processing Time**: 30-50ms
- **Frame Size**: 640x480 (automatically resized)
- **Compression**: JPEG quality 80%, base64 encoded

## Troubleshooting

### Import Errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### MediaPipe Installation Issues
On Windows, you may need Visual C++ redistributables:
- Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe

### WebSocket Connection Failed
- Check if port 8000 is available
- Verify CORS configuration in `config.py`
- Ensure frontend is connecting to correct URL

### Poor Performance
- Reduce frame rate in frontend (try 5-8 FPS)
- Lower JPEG quality in frame capture
- Reduce frame resolution (320x240)

## Development

### Run with hot reload:
```bash
uvicorn main:app --reload
```

### API Documentation:
Visit `http://localhost:8000/docs` for interactive Swagger UI.

## License

MIT License - See main project LICENSE file.
