// Maximum number of data points to store (24 hours of 3-minute intervals)
const MAX_DATA_POINTS = 480;

export const cleanupHistoricalData = <T extends { timestamp: number }>(
  data: T[],
  maxPoints: number = MAX_DATA_POINTS
): T[] => {
  if (data.length <= maxPoints) return data;
  
  // Keep only the most recent data points
  return data.slice(-maxPoints);
};

export const optimizeDataStorage = <T>(
  data: T[],
  interval: number = 180000 // 3 minutes in milliseconds
): T[] => {
  // Keep reduced dataset for older periods
  const now = Date.now();
  const sixHoursAgo = now - (6 * 60 * 60 * 1000);
  
  return data.filter((_, index) => {
    if (index < data.length - 120) { // Last 6 hours (120 3-minute intervals)
      // Keep only every other point for older data
      return index % 2 === 0;
    }
    return true;
  });
};