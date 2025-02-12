export interface GPSData {
    latitude: number;
    longitude: number;
    timestamp: Date;
    ignition: boolean;
}

export interface ExcelRow {
    latitude: string | number;
    longitude: string | number;
    timestamp: string | number;
    ignition: string | number | boolean;
}