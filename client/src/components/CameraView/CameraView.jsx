import React, { useEffect, useRef } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { CANVAS_CONFIG } from '../../config/constants';

const CameraView = ({ 
  isActive, 
  videoRef, 
  canvasRef, 
  faceDetected, 
  landmarks,
  gazeData,
  fps,
  processingTime,
  wsStatus,
  permissionStatus,
  error
}) => {
  const displayCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Use refs to always have the latest values in the animation loop
  const landmarksRef = useRef(landmarks);
  const gazeDataRef = useRef(gazeData);
  const faceDetectedRef = useRef(faceDetected);

  // Update refs when props change
  useEffect(() => {
    landmarksRef.current = landmarks;
    gazeDataRef.current = gazeData;
    faceDetectedRef.current = faceDetected;
  }, [landmarks, gazeData, faceDetected]);

  // Draw video feed with landmarks overlay
  useEffect(() => {
    if (!isActive || !displayCanvasRef.current || !videoRef.current) {
      return;
    }

    const displayCanvas = displayCanvasRef.current;
    const ctx = displayCanvas.getContext('2d');
    const video = videoRef.current;

    const draw = () => {
      if (!video || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Set canvas size to match video's actual dimensions
      if (displayCanvas.width !== video.videoWidth || displayCanvas.height !== video.videoHeight) {
        displayCanvas.width = video.videoWidth;
        displayCanvas.height = video.videoHeight;
        console.log('Canvas size set to:', displayCanvas.width, 'x', displayCanvas.height);
      }

      // Clear canvas
      ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

      // Draw video frame
      ctx.drawImage(video, 0, 0, displayCanvas.width, displayCanvas.height);

      // Draw landmarks if face detected (use ref values for latest data)
      if (faceDetectedRef.current && landmarksRef.current) {
        // Calculate scale factors (landmarks are in backend's processed frame coordinates)
        // The backend processes frames at CAMERA_CONFIG dimensions (640x480)
        const scaleX = displayCanvas.width / 640;  // Backend width
        const scaleY = displayCanvas.height / 480; // Backend height
        
        drawLandmarks(ctx, landmarksRef.current, gazeDataRef.current, scaleX, scaleY);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, videoRef]);

  // Draw face landmarks overlay
  const drawLandmarks = (ctx, landmarks, gaze, scaleX, scaleY) => {
    ctx.save();

    // Draw face oval
    if (landmarks.faceOval && landmarks.faceOval.length > 0) {
      ctx.strokeStyle = CANVAS_CONFIG.colors.faceOval;
      ctx.lineWidth = CANVAS_CONFIG.lineWidth;
      ctx.beginPath();
      landmarks.faceOval.forEach((point, index) => {
        const x = point[0] * scaleX;
        const y = point[1] * scaleY;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    }

    // Draw eyes
    [landmarks.leftEye, landmarks.rightEye].forEach((eye) => {
      if (!eye || eye.length === 0) return;

      ctx.strokeStyle = CANVAS_CONFIG.colors.eyeBox;
      ctx.lineWidth = CANVAS_CONFIG.lineWidth;
      ctx.beginPath();
      eye.forEach((point, index) => {
        const x = point[0] * scaleX;
        const y = point[1] * scaleY;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    });

    // Draw iris with glow
    [landmarks.leftIris, landmarks.rightIris].forEach((iris) => {
      if (!iris || iris.length === 0) return;

      const center = iris[0]; // First point is center
      const x = center[0] * scaleX;
      const y = center[1] * scaleY;

      // Glow effect
      ctx.shadowColor = CANVAS_CONFIG.colors.iris;
      ctx.shadowBlur = 10;

      ctx.fillStyle = CANVAS_CONFIG.colors.iris;
      ctx.beginPath();
      ctx.arc(x, y, CANVAS_CONFIG.irisRadius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    // Draw gaze direction vectors
    if (gaze && (gaze.x !== 0 || gaze.y !== 0)) {
      [landmarks.leftIris, landmarks.rightIris].forEach((iris) => {
        if (!iris || iris.length === 0) return;

        const center = iris[0];
        const startX = center[0] * scaleX;
        const startY = center[1] * scaleY;
        // Gaze values come as -100 to 100, normalize to -1 to 1, then multiply by arrow length
        const endX = startX + (gaze.x / 100) * CANVAS_CONFIG.gazeArrowLength * scaleX;
        const endY = startY + (gaze.y / 100) * CANVAS_CONFIG.gazeArrowLength * scaleY;

        ctx.strokeStyle = CANVAS_CONFIG.colors.gaze;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head (scale the arrowhead size too)
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowHeadSize = 10 * Math.min(scaleX, scaleY);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
          endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
          endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      });
    }

    ctx.restore();
  };

  // Render error state
  if (error) {
    return (
      <div className="w-full h-full min-h-[350px]">
        <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-red-400/20">
          <AlertCircle size={64} className="text-red-400 mb-4" />
          <p className="text-red-400 text-lg font-medium">Error</p>
          <p className="text-gray-400 text-sm mt-2 max-w-md text-center px-4">{error}</p>
          {permissionStatus === 'denied' && (
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Reload & Grant Permission
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px]">
      <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-cyan-400/20">
        {/* Hidden video element - ALWAYS render to ensure ref is set */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />

        {/* Hidden canvas for frame capture - ALWAYS render to ensure ref is set */}
        <canvas ref={canvasRef} className="hidden" />

        {isActive ? (
          <>
            {/* Display canvas with landmarks */}
            <canvas
              ref={displayCanvasRef}
              className="w-full h-full object-contain"
            />

            {/* Status overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {/* Connection status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md ${
                wsStatus === 'connected' 
                  ? 'bg-green-500/20 border border-green-400/30' 
                  : 'bg-red-500/20 border border-red-400/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  wsStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></span>
                <span className="text-white text-xs font-medium">
                  {wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>

              {/* Performance metrics */}
              {wsStatus === 'connected' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-slate-800/60 border border-slate-600/30">
                  <span className="text-gray-300 text-xs font-medium">
                    {fps} FPS • {processingTime.toFixed(0)}ms
                  </span>
                </div>
              )}
            </div>

            {/* Face detection status */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${
                faceDetected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`}></span>
              <span className="text-gray-200 text-sm font-medium">
                {faceDetected ? 'Face Detected' : 'Searching for face...'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Camera size={64} className="text-gray-500 mb-4 opacity-50" />
            <p className="text-gray-400 text-lg font-medium">Camera Inactive</p>
            <p className="text-gray-500 text-sm mt-2">Press Start to begin monitoring</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
