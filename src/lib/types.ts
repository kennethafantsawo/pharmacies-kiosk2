export interface Pharmacy {
  zone: string;
  nom: string;
  adresse: string;
  telephone: string;
  assurances: string[];
}

export interface PharmacyMetadata {
  source: string;
  periode: string;
  extraction: string;
  total_pharmacies: number;
  total_zones: number;
}

export interface PharmaciesApiResponse {
  metadata: PharmacyMetadata;
  pharmacies: Pharmacy[];
  filtered_count?: number;
}
