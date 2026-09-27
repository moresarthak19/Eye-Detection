import React from 'react';
import { Activity, Eye, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { COGNITIVE_LOAD_LEVELS, COLORS } from '../../utils/constants';

const MetricsPanel = ({ currentData }) => {
  if (!currentData) {
    return (
      <div className="w-full p-6 bg-slate-800/50 rounded-xl border border-cyan-400/20">
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Activity className="animate-spin mb-2" size={24} />
          <p>Waiting for data...</p>
        </div>
      </div>
    );
  }

  const { blinkRate, pupilSize, cognitiveLoad, attentionScore } = currentData;

  // Determine cognitive load color
  const getCognitiveLoadColor = () => {
    switch (cognitiveLoad) {
      case COGNITIVE_LOAD_LEVELS.LOW:
        return COLORS.LOW;
      case COGNITIVE_LOAD_LEVELS.MEDIUM:
        return COLORS.MEDIUM;
      case COGNITIVE_LOAD_LEVELS.HIGH:
        return COLORS.HIGH;
      default:
        return COLORS.PRIMARY;
    }
  };

  // Get trend icon based on value comparison with average
  const getTrendIcon = (value, avgLow, avgHigh) => {
    if (value < avgLow) return <TrendingDown className="w-5 h-5 ml-auto text-green-400" />;
    if (value > avgHigh) return <TrendingUp className="w-5 h-5 ml-auto text-red-500" />;
    return <Minus className="w-5 h-5 ml-auto text-yellow-400" />;
  };

  return (
    <div className="w-full p-6 bg-slate-800/50 rounded-xl border border-cyan-400/20">
      <h2 className="text-gray-200 text-xl font-semibold mb-6 flex items-center gap-2">
        Real-Time Metrics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Blink Rate Card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-cyan-400/10 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="text-cyan-400 w-5 h-5" />
            <span className="text-gray-400 text-sm font-medium">Blink Rate</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-gray-200 text-3xl font-bold leading-none">{blinkRate}</span>
            <span className="text-gray-500 text-base font-medium">/min</span>
            {getTrendIcon(blinkRate, 12, 22)}
          </div>
          <div className="mt-2">
            <span className="text-gray-500 text-xs">Normal: 12-20/min</span>
          </div>
        </div>

        {/* Pupil Dilation Card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-cyan-400/10 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-cyan-400 w-5 h-5" />
            <span className="text-gray-400 text-sm font-medium">Pupil Size</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-gray-200 text-3xl font-bold leading-none">{pupilSize}</span>
            <span className="text-gray-500 text-base font-medium">mm</span>
            {getTrendIcon(pupilSize, 3, 6)}
          </div>
          <div className="mt-2">
            <span className="text-gray-500 text-xs">Normal: 3-6mm</span>
          </div>
        </div>

        {/* Cognitive Load Card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-cyan-400/10 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="text-cyan-400 w-5 h-5" />
            <span className="text-gray-400 text-sm font-medium">Cognitive Load</span>
          </div>
          <div className="flex justify-center mb-3">
            <span 
              className="px-6 py-2 rounded-full text-lg font-bold uppercase tracking-wide transition-all duration-300"
              style={{ 
                backgroundColor: getCognitiveLoadColor(),
                color: '#000'
              }}
            >
              {cognitiveLoad}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-600/30 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: cognitiveLoad === COGNITIVE_LOAD_LEVELS.LOW ? '33%' :
                         cognitiveLoad === COGNITIVE_LOAD_LEVELS.MEDIUM ? '66%' : '100%',
                  backgroundColor: getCognitiveLoadColor()
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Attention Score Card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-cyan-400/10 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,212,255,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-cyan-400 w-5 h-5" />
            <span className="text-gray-400 text-sm font-medium">Attention Score</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-gray-200 text-3xl font-bold leading-none">{attentionScore}</span>
            <span className="text-gray-500 text-base font-medium">%</span>
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-600/30 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${attentionScore}%`,
                  backgroundColor: attentionScore > 70 ? COLORS.LOW : 
                                 attentionScore > 40 ? COLORS.MEDIUM : COLORS.HIGH
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
