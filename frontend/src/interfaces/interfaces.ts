export interface ITripData {
    _id: string;
    userId: string;
    name: string;
    gpsData: IGPSData[]
}

export interface IGPSData {
    latitude: number;
    longitude: number;
    timestamp: Date;
    ignition: boolean;
}