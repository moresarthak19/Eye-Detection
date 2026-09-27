import { useState, useEffect, useCallback } from 'react';
import { generateDataSnapshot, generateHistoricalData } from '../utils/dataGenerator';
import { CHART_CONFIG } from '../utils/constants';

/**
 * Custom hook to generate and manage dummy eye tracking data
 */
export const useDummyData = (isActive = false) => {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Initialize with historical data
  useEffect(() => {
    if (isActive && historicalData.length === 0) {
      const initialData = generateHistoricalData(CHART_CONFIG.MAX_DATA_POINTS);
      setHistoricalData(initialData);
      setCurrentData(initialData[initialData.length - 1]);
      setSessionStartTime(Date.now());
    }
  }, [isActive, historicalData.length]);

  // Update data at regular intervals
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newSnapshot = generateDataSnapshot();
      setCurrentData(newSnapshot);

      // Add to historical data and keep only last MAX_DATA_POINTS
      setHistoricalData(prev => {
        const updated = [...prev, newSnapshot];
        return updated.slice(-CHART_CONFIG.MAX_DATA_POINTS);
      });
    }, CHART_CONFIG.UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate session duration
  const getSessionDuration = useCallback(() => {
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds
  }, [sessionStartTime]);

  // Reset data
  const resetData = useCallback(() => {
    setCurrentData(null);
    setHistoricalData([]);
    setSessionStartTime(null);
  }, []);

  return {
    currentData,
    historicalData,
    sessionDuration: getSessionDuration(),
    resetData
  };
};
