import { GPSData, TripMetrics } from "../interfaces/interface";
import { getDistance } from 'geolib';


const formatDuration = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes} Min`;
  }
  
  return `${hours} Hr ${minutes} Min`;
};

const formatDistance = (kilometers: number): string => {
  return `${kilometers.toFixed(2)} KM`;
};

const calculateSpeed = (point1: GPSData, point2: GPSData): number => {
  const distance = getDistance(
    { latitude: point1.latitude, longitude: point1.longitude },
    { latitude: point2.latitude, longitude: point2.longitude }
  );
  const timeDiff = new Date(point2.timestamp).getTime() - new Date(point1.timestamp).getTime();
  const timeHours = timeDiff / (1000 * 60 * 60);
  return (distance / 1000) / timeHours;
};

export const calculateTripMetrics = (gpsData: GPSData[]): TripMetrics => {
  if (gpsData.length < 2) {
    return {
      totalDistance: '0 KM',
      totalDuration: '0 Min',
      overspeedDistance: '0 KM',
      overspeedDuration: '0 Min',
      stoppedDuration: '0 Min'
    };
  }

  let totalDistanceMeters = 0;
  let overspeedDistanceMeters = 0;
  let overspeedDuration = 0;
  let stoppedDuration = 0;
  const SPEED_LIMIT = 60;

  // Sort GPS data by timestamp and filter out duplicate timestamps
  const sortedData = [...gpsData]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter((point, index, array) => {
      if (index === 0) return true;
      return new Date(point.timestamp).getTime() !== new Date(array[index - 1].timestamp).getTime();
    });

  // Process consecutive points with valid time differences
  for (let i = 0; i < sortedData.length - 1; i++) {
    const currentPoint = sortedData[i];
    const nextPoint = sortedData[i + 1];

    const timeDiff = new Date(nextPoint.timestamp).getTime() - new Date(currentPoint.timestamp).getTime();
    
    // Skip if time difference is 0 or unreasonably large (e.g., > 30 seconds)
    if (timeDiff <= 0 || timeDiff > 30000) continue;

    // Calculate distance between consecutive points
    const segmentDistance = getDistance(
      { latitude: currentPoint.latitude, longitude: currentPoint.longitude },
      { latitude: nextPoint.latitude, longitude: nextPoint.longitude }
    );

    // Skip if distance is unreasonably large (e.g., > 1km between consecutive points)
    if (segmentDistance > 1000) continue;

    // Calculate speed for this segment
    const speed = calculateSpeed(currentPoint, nextPoint);

    // Add to total distance
    totalDistanceMeters += segmentDistance;

    // Check if this segment involves overspeeding
    if (speed > SPEED_LIMIT) {
      overspeedDistanceMeters += segmentDistance;
      overspeedDuration += timeDiff;
    }

    // Calculate stopped duration
    if (!currentPoint.ignition) {
      stoppedDuration += timeDiff;
    }
  }

  // Calculate total duration
  const totalDuration = new Date(sortedData[sortedData.length - 1].timestamp).getTime() - 
                       new Date(sortedData[0].timestamp).getTime();

  // Convert distances to kilometers and format all values
  return {
    totalDistance: formatDistance(totalDistanceMeters / 1000),
    totalDuration: formatDuration(totalDuration),
    overspeedDistance: formatDistance(overspeedDistanceMeters / 1000),
    overspeedDuration: formatDuration(overspeedDuration),
    stoppedDuration: formatDuration(stoppedDuration)
  };
};