export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  phone_formatted: string;
  insurances: string[];
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
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

export interface PharmacyData {
  metadata: {
    week_start: string;
    week_end: string;
    source_url: string;
    last_updated: string;
  };
  zones: Zone[];
  cities: City[];
}

export interface AppConfig {
  dataRefreshIntervalMinutes: number;
  pageReloadHours: number;
  scrollTopPauseSeconds: number;
  scrollBottomPauseSeconds: number;
  scrollSpeed: number;
}
