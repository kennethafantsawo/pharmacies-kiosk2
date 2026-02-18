import type { PharmaciesApiResponse } from './types';
import path from 'path';
import fs from 'fs/promises';

export async function fetchPharmacies(filters?: {
  zone?: string;
  search?: string;
}): Promise<PharmaciesApiResponse> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'pharmacies.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: PharmaciesApiResponse = JSON.parse(fileContent);

    if (!filters) {
      return data;
    }
    
    let result = data.pharmacies;

    const zone = filters.zone;
    const search = filters.search?.toLowerCase();

    // Filtre par zone
    if (zone && zone !== 'all') {
      result = result.filter(p => 
        p.zone.toLowerCase().includes(zone.toLowerCase())
      );
    }
  
    // Recherche texte (nom, adresse, assurances)
    if (search) {
      result = result.filter(p =>
        p.nom.toLowerCase().includes(search) ||
        p.adresse.toLowerCase().includes(search) ||
        p.assurances.some(a => a.toLowerCase().includes(search))
      );
    }
  
    return {
      metadata: data.metadata,
      pharmacies: result,
      filtered_count: result.length
    };

  } catch (error) {
    console.error('Failed to fetch pharmacies from file system:', error);
    // This will be caught by Next.js's error boundary
    throw new Error('Échec du chargement des pharmacies');
  }
}
