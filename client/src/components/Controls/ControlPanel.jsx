import React from 'react';
import { Play, Square, RotateCcw, Settings, Clock } from 'lucide-react';

const ControlPanel = ({ isActive, onStart, onStop, onReset, sessionDuration }) => {
  // Format session duration (seconds to MM:SS)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between gap-6 p-5 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-400/20 flex-wrap">
      <div className="flex gap-4 flex-wrap">
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-[0.95rem] font-semibold transition-all duration-300 ${
            isActive 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-linear-to-br from-green-400 to-green-600 text-black hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,222,128,0.4)] active:translate-y-0'
          }`}
          onClick={onStart}
          disabled={isActive}
        >
          <Play size={20} />
          <span>Start Monitoring</span>
        </button>

        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-[0.95rem] font-semibold transition-all duration-300 ${
            !isActive 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-linear-to-br from-red-500 to-red-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] active:translate-y-0'
          }`}
          onClick={onStop}
          disabled={!isActive}
        >
          <Square size={20} />
          <span>Stop</span>
        </button>

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-[0.95rem] font-semibold bg-linear-to-br from-gray-600 to-gray-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(107,114,128,0.4)] active:translate-y-0"
          onClick={onReset}
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-400/10 rounded-lg border border-cyan-400/30">
          <Clock size={18} className="text-cyan-400" />
          <span className="text-gray-400 text-sm font-medium">Session:</span>
          <span className="text-cyan-400 text-lg font-bold font-mono min-w-[50px]">{formatDuration(sessionDuration)}</span>
        </div>

        <button 
          className="flex items-center justify-center p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-lg text-cyan-400 transition-all duration-300 hover:bg-cyan-400/20 hover:rotate-45"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
