import { METRICS_RANGES, COGNITIVE_LOAD_LEVELS } from './constants';

/**
 * Generate random number within a range
 */
export const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Generate realistic blink rate (blinks per minute)
 * Factors: fatigue increases blink rate, concentration decreases it
 */
export const generateBlinkRate = (currentLoad) => {
  const { min, max } = METRICS_RANGES.BLINK_RATE;
  
  if (currentLoad === COGNITIVE_LOAD_LEVELS.LOW) {
    return Math.floor(randomInRange(min, min + 5)); // 10-15
  } else if (currentLoad === COGNITIVE_LOAD_LEVELS.MEDIUM) {
    return Math.floor(randomInRange(min + 5, max - 5)); // 15-20
  } else {
    return Math.floor(randomInRange(max - 5, max)); // 20-25
  }
};

/**
 * Generate pupil dilation in mm
 * Larger pupils indicate higher cognitive load
 */
export const generatePupilSize = (currentLoad) => {
  const { min, max } = METRICS_RANGES.PUPIL_SIZE;
  
  if (currentLoad === COGNITIVE_LOAD_LEVELS.LOW) {
    return (randomInRange(min, min + 2)).toFixed(1); // 2-4mm
  } else if (currentLoad === COGNITIVE_LOAD_LEVELS.MEDIUM) {
    return (randomInRange(min + 2, max - 1)).toFixed(1); // 4-7mm
  } else {
    return (randomInRange(max - 1, max)).toFixed(1); // 7-8mm
  }
};

/**
 * Generate cognitive load level
 * Simulates varying cognitive states over time
 */
export const generateCognitiveLoad = () => {
  const rand = Math.random();
  
  if (rand < 0.3) {
    return COGNITIVE_LOAD_LEVELS.LOW;
  } else if (rand < 0.7) {
    return COGNITIVE_LOAD_LEVELS.MEDIUM;
  } else {
    return COGNITIVE_LOAD_LEVELS.HIGH;
  }
};

/**
 * Generate gaze position (x, y coordinates)
 * Simulates eye movement patterns
 */
export const generateGazePosition = (isDistracted = false) => {
  const { min: xMin, max: xMax } = METRICS_RANGES.GAZE_X;
  const { min: yMin, max: yMax } = METRICS_RANGES.GAZE_Y;
  
  if (isDistracted) {
    // More erratic movements when distracted
    return {
      x: Math.floor(randomInRange(xMin, xMax)),
      y: Math.floor(randomInRange(yMin, yMax))
    };
  } else {
    // More centered when focused
    return {
      x: Math.floor(randomInRange(xMin / 2, xMax / 2)),
      y: Math.floor(randomInRange(yMin / 2, yMax / 2))
    };
  }
};

/**
 * Generate complete eye tracking data snapshot
 */
export const generateDataSnapshot = () => {
  const cognitiveLoad = generateCognitiveLoad();
  const isDistracted = cognitiveLoad === COGNITIVE_LOAD_LEVELS.HIGH;
  
  return {
    timestamp: new Date().toISOString(),
    cognitiveLoad,
    blinkRate: generateBlinkRate(cognitiveLoad),
    pupilSize: parseFloat(generatePupilSize(cognitiveLoad)),
    gazePosition: generateGazePosition(isDistracted),
    attentionScore: Math.floor(
      cognitiveLoad === COGNITIVE_LOAD_LEVELS.LOW ? randomInRange(80, 100) :
      cognitiveLoad === COGNITIVE_LOAD_LEVELS.MEDIUM ? randomInRange(50, 80) :
      randomInRange(20, 50)
    )
  };
};

/**
 * Generate initial historical data for charts
 */
export const generateHistoricalData = (points = 30) => {
  const data = [];
  const now = Date.now();
  
  for (let i = points; i > 0; i--) {
    const timestamp = new Date(now - i * 10000); // 10 seconds apart
    const snapshot = generateDataSnapshot();
    data.push({
      ...snapshot,
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
};
