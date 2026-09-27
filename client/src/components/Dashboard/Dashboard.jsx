import React from 'react';
import { Video, Info } from 'lucide-react';
import CameraView from '../CameraView/CameraView';
import MetricsPanel from '../MetricsPanel/MetricsPanel';
import GazeTracker from '../Charts/GazeTracker';
import CognitiveLoadChart from '../Charts/CognitiveLoadChart';
import BlinkRateChart from '../Charts/BlinkRateChart';
import PupilDilationChart from '../Charts/PupilDilationChart';
import AlertBanner from '../AlertSystem/AlertBanner';
import ControlPanel from '../Controls/ControlPanel';
import useRealTimeData from '../../hooks/useRealTimeData';
import { useAlertSystem } from '../../hooks/useAlertSystem';

const Dashboard = () => {
  const {
    isActive,
    metrics,
    gazeData,
    faceDetected,
    landmarks,
    sessionDuration,
    metricsHistory,
    blinkHistory,
    pupilHistory,
    processingTime,
    fps,
    wsStatus,
    isConnected,
    permissionStatus,
    error,
    startSession,
    stopSession,
    resetSession,
    videoRef,
    canvasRef,
  } = useRealTimeData();

  const { alerts, dismissAlert } = useAlertSystem(metrics);

  const handleStart = () => {
    startSession();
  };

  const handleStop = () => {
    stopSession();
  };

  const handleReset = () => {
    resetSession();
  };

  // Transform data for charts
  const currentData = {
    metrics: {
      blinkRate: metrics.blinkRate,
      pupilSize: metrics.pupilSize,
      cognitiveLoad: metrics.cognitiveLoad,
      cognitiveLoadValue: metrics.cognitiveLoadValue,
      attentionScore: metrics.attentionScore,
    },
    gazeData: {
      x: gazeData.x,
      y: gazeData.y,
      direction: getGazeDirection(gazeData.x, gazeData.y),
    },
  };

  const historicalData = {
    cognitiveLoad: metricsHistory,
    blinkRate: blinkHistory,
    pupilDilation: pupilHistory,
  };

  // Helper function to determine gaze direction
  function getGazeDirection(x, y) {
    const threshold = 0.3;
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) return 'Center';
    
    const angle = Math.atan2(y, x);
    const degree = (angle * 180) / Math.PI;
    
    if (degree >= -22.5 && degree < 22.5) return 'Right';
    if (degree >= 22.5 && degree < 67.5) return 'Down-Right';
    if (degree >= 67.5 && degree < 112.5) return 'Down';
    if (degree >= 112.5 && degree < 157.5) return 'Down-Left';
    if (degree >= 157.5 || degree < -157.5) return 'Left';
    if (degree >= -157.5 && degree < -112.5) return 'Up-Left';
    if (degree >= -112.5 && degree < -67.5) return 'Up';
    if (degree >= -67.5 && degree < -22.5) return 'Up-Right';
    
    return 'Center';
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl mb-6 border border-cyan-400/30 shadow-[0_4px_20px_rgba(0,212,255,0.1)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Video className="text-cyan-400 w-8 h-8" />
            <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
              EyeX
            </h1>
          </div>
          <p className="text-gray-400 text-[0.95rem] ml-11">AI-based Cognitive Load Analyzer</p>
        </div>
        <button 
          className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 p-3 rounded-lg hover:bg-cyan-400/20 hover:scale-105 transition-all duration-300 flex items-center justify-center"
          title="About"
        >
          <Info size={20} />
        </button>
      </header>

      {/* Alert System */}
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* Control Panel */}
      <div className="mb-6">
        <ControlPanel
          isActive={isActive}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          sessionDuration={sessionDuration}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column - Camera View */}
        <div className="flex flex-col min-h-[400px]">
          <CameraView 
            isActive={isActive}
            videoRef={videoRef}
            canvasRef={canvasRef}
            faceDetected={faceDetected}
            landmarks={landmarks}
            gazeData={gazeData}
            fps={fps}
            processingTime={processingTime}
            wsStatus={wsStatus}
            permissionStatus={permissionStatus}
            error={error}
          />
        </div>

        {/* Right Column - Metrics and Gaze */}
        <div className="flex flex-col gap-4">
          <MetricsPanel currentData={currentData.metrics} />
          <div className="flex-1">
            <GazeTracker gazePosition={currentData?.gazeData} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-cyan-400/20">
          <CognitiveLoadChart historicalData={historicalData} />
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="mb-6">
        <h2 className="text-gray-200 text-2xl font-semibold mb-4">📈 Detailed Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-cyan-400/20">
            <BlinkRateChart historicalData={historicalData} />
          </div>
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-cyan-400/20">
            <PupilDilationChart historicalData={historicalData} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-8 pt-4 text-gray-500 text-sm border-t border-cyan-400/10 mt-8">
        <p className="my-1">EyeX - Real-time Eye Movement and Cognitive Load Detection System</p>
        <p className="flex items-center justify-center gap-2 mt-2">
          {isActive ? (
            <>
              <span className="text-green-400 font-semibold">● Monitoring Active</span>
              {isConnected && (
                <span className="text-cyan-400 text-xs ml-2">
                  | Connected to Backend | {fps} FPS
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 font-semibold">○ Monitoring Inactive</span>
          )}
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
