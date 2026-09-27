import { useState, useEffect, useCallback } from 'react';
import { COGNITIVE_LOAD_LEVELS, ALERT_TYPES, ALERT_THRESHOLDS } from '../utils/constants';

/**
 * Custom hook to manage alert system
 */
export const useAlertSystem = (currentData) => {
  const [alerts, setAlerts] = useState([]);
  const [highLoadStartTime, setHighLoadStartTime] = useState(null);

  // Add new alert (avoid duplicates within 10 seconds)
  const addAlert = useCallback((newAlert) => {
    setAlerts(prev => {
      // Check if similar alert exists in last 10 seconds
      const recentSimilar = prev.find(
        alert => 
          alert.message === newAlert.message && 
          Date.now() - alert.timestamp < 10000
      );

      if (recentSimilar) return prev;

      return [...prev, { ...newAlert, id: Date.now() }];
    });
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Monitor cognitive load and blink rate
  useEffect(() => {
    if (!currentData) return;

    const { cognitiveLoad, blinkRate } = currentData;

    // Track high cognitive load duration
    if (cognitiveLoad === COGNITIVE_LOAD_LEVELS.HIGH) {
      if (!highLoadStartTime) {
        setHighLoadStartTime(Date.now());
      } else {
        const duration = Date.now() - highLoadStartTime;
        
        // Alert if high load persists for threshold duration
        if (duration >= ALERT_THRESHOLDS.HIGH_COGNITIVE_LOAD_DURATION) {
          addAlert({
            type: ALERT_TYPES.DANGER,
            message: 'High cognitive load detected! Consider taking a break.',
            timestamp: Date.now()
          });
          setHighLoadStartTime(Date.now()); // Reset to avoid duplicate alerts
        }
      }
    } else {
      setHighLoadStartTime(null);
    }

    // Alert for abnormal blink rate
    if (blinkRate < ALERT_THRESHOLDS.LOW_BLINK_RATE) {
      addAlert({
        type: ALERT_TYPES.WARNING,
        message: 'Low blink rate detected. Remember to blink to avoid eye strain.',
        timestamp: Date.now()
      });
    } else if (blinkRate > ALERT_THRESHOLDS.HIGH_BLINK_RATE) {
      addAlert({
        type: ALERT_TYPES.WARNING,
        message: 'High blink rate detected. You might be experiencing fatigue.',
        timestamp: Date.now()
      });
    }

    // Alert for medium cognitive load
    if (cognitiveLoad === COGNITIVE_LOAD_LEVELS.MEDIUM) {
      addAlert({
        type: ALERT_TYPES.INFO,
        message: 'Moderate cognitive load detected. Stay focused!',
        timestamp: Date.now()
      });
    }
  }, [currentData, highLoadStartTime, addAlert]);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alerts.length === 0) return;

    const timeout = setTimeout(() => {
      setAlerts(prev => prev.slice(1)); // Remove oldest alert
    }, 5000);

    return () => clearTimeout(timeout);
  }, [alerts]);

  return {
    alerts,
    dismissAlert,
    clearAllAlerts
  };
};
