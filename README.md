# EyeX - Real-time Eye Tracking & Cognitive Load Analyzer

A full-stack application that uses AI-powered eye tracking to analyze cognitive load in real-time.

## 🏗️ Architecture

```
Frontend (React + Vite) → WebSocket → Backend (Python + FastAPI) → MediaPipe Face Mesh → Real-time Metrics
```

## ✨ Features

- ✅ **Real Webcam Integration** - Live video feed with face detection
- ✅ **468 Facial Landmarks** - MediaPipe Face Mesh tracking
- ✅ **Iris Tracking** - Precise pupil and gaze detection
- ✅ **Blink Detection** - Eye Aspect Ratio (EAR) algorithm
- ✅ **Pupil Dilation** - Real-time pupil size measurement
- ✅ **Gaze Tracking** - X/Y gaze direction with visual arrows
- ✅ **Cognitive Load Analysis** - AI-powered mental workload assessment
- ✅ **Attention Scoring** - 0-100 engagement metrics
- ✅ **Real-time Charts** - Live data visualization
- ✅ **WebSocket Communication** - Low-latency bidirectional data flow

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Webcam** for video capture

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

✅ Backend running on: **ws://localhost:8000/ws**

### Frontend Setup

```bash
# Navigate to frontend
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

## 📊 How It Works

1. **Camera Capture** → 10 FPS webcam frames
2. **Compression** → JPEG (640x480, 80% quality)
3. **WebSocket** → Send to Python backend
4. **MediaPipe** → Extract 468 facial landmarks
5. **Metrics** → Calculate blink rate, pupil size, gaze, cognitive load
6. **Response** → Send metrics back to frontend
7. **Visualization** → Live video overlay + charts

## 🎯 Tech Stack

### Frontend
- React 19.1.1 + Vite 7.1.12
- Tailwind CSS v4
- Chart.js for visualizations
- WebSocket for real-time communication

### Backend
- FastAPI 0.115.0
- MediaPipe 0.10.18 (Face Mesh)
- OpenCV 4.10.0.84
- NumPy 1.26.4
- Uvicorn (ASGI server)

## 📈 Metrics Explained

| Metric | Method | Range | Normal |
|--------|--------|-------|--------|
| **Blink Rate** | Eye Aspect Ratio (EAR) | 0-60/min | 12-20/min |
| **Pupil Size** | Iris diameter | 2-8mm | 3-5mm |
| **Gaze Direction** | Iris position | -1 to +1 | 0 (center) |
| **Cognitive Load** | Multi-factor | 0-100 | 40-70 (optimal) |
| **Attention Score** | Engagement | 0-100 | 70+ (focused) |

## 🐛 Troubleshooting

**Camera Permission Denied**  
→ Click "Reload & Grant Permission" or check browser settings

**WebSocket Connection Failed**  
→ Ensure backend is running on port 8000

**No Face Detected**  
→ Check lighting and position face within camera view

**Poor Performance**  
→ Reduce FPS to 5-8 in `client/src/config/constants.js`

## 📄 License

MIT License

---

**Built with ❤️ for real-time cognitive load analysis**