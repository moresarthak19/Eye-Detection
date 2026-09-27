import React from 'react';
import { Target } from 'lucide-react';

const GazeTracker = ({ gazePosition }) => {
  if (!gazePosition) {
    return (
      <div className="w-full p-4 bg-linear-to-br from-slate-800 to-slate-900 rounded-lg border border-cyan-400/20">
        <div className="flex flex-col items-center justify-center p-4">
          <Target className="text-gray-500 w-12 h-12 animate-pulse" />
          <p className="text-gray-500 text-sm mt-2">Waiting for gaze data...</p>
        </div>
      </div>
    );
  }

  const { x, y } = gazePosition;
  
  // Normalize position for display (within a 200x200 container)
  const normalizedX = 100 + x; // Center at 100, range -100 to 100
  const normalizedY = 100 + y;

  // Determine gaze direction label
  const getGazeDirection = () => {
    if (Math.abs(x) < 30 && Math.abs(y) < 30) return 'Center';
    if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? 'Right' : 'Left';
    } else {
      return y > 0 ? 'Down' : 'Up';
    }
  };

  return (
    <div className="w-full p-4 bg-linear-to-br from-slate-800 to-slate-900 rounded-lg border border-cyan-400/20">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-cyan-400 w-5 h-5" />
        <span className="text-gray-200 text-base font-semibold">Gaze Tracker</span>
      </div>
      
      <div className="flex items-center justify-center p-4">
        {/* Compass background */}
        <div className="relative w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(0,212,255,0.05)_0%,transparent_70%)] border-2 border-cyan-400/30 rounded-full">
          {/* Directional markers */}
          <div className="absolute top-[5px] left-1/2 -translate-x-1/2 text-gray-500 text-2xl font-bold select-none">↑</div>
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 text-gray-500 text-2xl font-bold select-none">↓</div>
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold select-none">←</div>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold select-none">→</div>
          
          {/* Center point */}
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00d4ff]"></div>
          
          {/* Gaze dot */}
          <div 
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
            style={{
              left: `${normalizedX}px`,
              top: `${normalizedY}px`
            }}
          >
            <div className="w-full h-full bg-green-400 rounded-full shadow-[0_0_15px_#4ade80,0_0_30px_rgba(74,222,128,0.5)] animate-[gaze-pulse_1.5s_ease-in-out_infinite]"></div>
          </div>
          
          {/* Gaze trail effect */}
          <div 
            className="absolute w-10 h-10 bg-[radial-gradient(circle,rgba(74,222,128,0.3)_0%,transparent_70%)] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 pointer-events-none"
            style={{
              left: `${normalizedX}px`,
              top: `${normalizedY}px`
            }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-cyan-400/20 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Direction:</span>
          <span className="text-cyan-400 text-lg font-semibold">{getGazeDirection()}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-500 text-sm font-mono">X: {x.toFixed(0)}</span>
          <span className="text-gray-500 text-sm font-mono">Y: {y.toFixed(0)}</span>
        </div>
      </div>

      <style>{`
        @keyframes gaze-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default GazeTracker;
