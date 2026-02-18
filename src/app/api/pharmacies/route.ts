import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { PharmaciesApiResponse, Pharmacy } from '@/lib/types';

export async function GET(request: Request) {
  try {
    // Read the data from the local JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'pharmacies.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const PHARMACIES_DATA: PharmaciesApiResponse = JSON.parse(fileContent);
    
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');
    const search = searchParams.get('search')?.toLowerCase();

    let result: Pharmacy[] = PHARMACIES_DATA.pharmacies;

    // Filter by zone
    if (zone && zone !== 'all') {
      result = result.filter(p => 
        p.zone.toLowerCase().includes(zone.toLowerCase())
      );
    }

    // Text search (name, address, insurances)
    if (search) {
      result = result.filter(p =>
        p.nom.toLowerCase().includes(search) ||
        p.adresse.toLowerCase().includes(search) ||
        p.assurances.some(a => a.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      metadata: PHARMACIES_DATA.metadata,
      pharmacies: result,
      filtered_count: result.length
    });
  } catch (error) {
    console.error("API Error fetching pharmacies:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
