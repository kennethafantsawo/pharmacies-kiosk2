// types.ts

export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  phone_formatted: string;
  insurances: string[];
  coordinates: Coordinates;
  is_24h: boolean;
}

export interface Zone {
  zone_id: string;
  zone_code: string;
  zone_name: string;
  city: string;
  pharmacies: Pharmacy[];
}

export interface City {
    name: string;
    zones: string[];
    pharmacy_count: number;
}

export interface Metadata {
  week_start: string;
  week_end: string;
  source_url: string;
  last_updated: string;
}

export interface PharmacyData {
  metadata: Metadata;
  zones: Zone[];
  cities: City[];
}

export interface AppConfig {
  dataRefreshIntervalMinutes: number;
  pageReloadHours: number;
  scrollSpeedPixelsPerSecond: number;
  pauseAtTopSeconds: number;
  pauseAtBottomSeconds: number;
}
