export interface ITripData {
  _id: string;
  userId: string;
  name: string;
  gpsData: IGPSData[];
}

export interface IGPSData {
  latitude: number;
  longitude: number;
  timestamp: Date | string;
  ignition: boolean | string;
}

export interface ITripDetails {
  _id: string;
  userId: string;
  name: string;
  gpsData: IGPSData[];
  duration: string;
  totalDistance: string;
  overspeedDistance: string;
  overspeedDuration: string;
  stoppedDuration: string;
}

export interface RouteSegment {
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  isOverspeeding: boolean;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  durationSeconds: number;
}

export interface StoppedPoint {
  latitude: number;
  longitude: number;
  durationSeconds: number;
}

export interface TableDetailRow {
  timeRange: string; // Formatted time range string
  coordinates: string; // Formatted coordinates string
  ignition: string; // Uppercase ignition status
  speed: string; // Speed in KM/H or empty string
}

  export interface TripsState {
    trips: ITripDetails[];
    isLoading: boolean;
    error: string | null;
    page: string;
  }

    export interface RootState {
      trips: TripsState;
      // ... other state slices
    }
    
