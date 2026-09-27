import React from 'react';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ALERT_TYPES } from '../../utils/constants';

const AlertBanner = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case ALERT_TYPES.DANGER:
        return <AlertCircle size={20} />;
      case ALERT_TYPES.WARNING:
        return <AlertTriangle size={20} />;
      case ALERT_TYPES.INFO:
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case ALERT_TYPES.DANGER:
        return {
          container: 'bg-gradient-to-br from-red-500/95 to-red-600/95 border-l-red-500',
          text: 'text-white',
          button: 'text-white/70 hover:bg-white/10 hover:text-white'
        };
      case ALERT_TYPES.WARNING:
        return {
          container: 'bg-gradient-to-br from-yellow-400/95 to-yellow-500/95 border-l-yellow-400',
          text: 'text-black',
          button: 'text-black/60 hover:bg-black/10 hover:text-black'
        };
      case ALERT_TYPES.INFO:
        return {
          container: 'bg-gradient-to-br from-cyan-400/95 to-sky-500/95 border-l-cyan-400',
          text: 'text-black',
          button: 'text-black/60 hover:bg-black/10 hover:text-black'
        };
      default:
        return {
          container: 'bg-gradient-to-br from-cyan-400/95 to-sky-500/95 border-l-cyan-400',
          text: 'text-black',
          button: 'text-black/60 hover:bg-black/10 hover:text-black'
        };
    }
  };

  return (
    <div className="fixed top-5 right-5 z-1000 flex flex-col gap-2.5 max-w-[400px]">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={alert.id}
            className={`flex items-center justify-between px-5 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-md animate-[slideIn_0.3s_ease-out] border-l-4 ${styles.container}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center shrink-0">
                {getAlertIcon(alert.type)}
              </div>
              <div className={`text-[0.95rem] leading-6 font-medium ${styles.text}`}>
                {alert.message}
              </div>
            </div>
            <button
              className={`bg-transparent p-1 flex items-center justify-center rounded transition-all duration-200 shrink-0 ml-2 ${styles.button}`}
              onClick={() => onDismiss(alert.id)}
              aria-label="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AlertBanner;
