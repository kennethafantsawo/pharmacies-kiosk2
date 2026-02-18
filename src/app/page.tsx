import fs from 'fs/promises';
import path from 'path';
import KioskClient from '@/components/kiosk/KioskClient';
import type { PharmacyData, AppConfig } from '@/lib/types';

// Cette page est rendue côté serveur (SSR)
export const revalidate = 0; // Pas de cache, toujours frais

async function loadJsonData(filePath: string): Promise<any | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return null;
  }
}

export default async function KioskPage() {
  const initialData = await loadJsonData('public/data/pharmacies.json');
  const backupData = await loadJsonData('public/data/backup.json');
  const config = await loadJsonData('config.json');

  if (!initialData || !backupData || !config) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-destructive text-destructive-foreground p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Erreur de Configuration</h1>
          <p className="text-xl">
            Impossible de charger les fichiers de données ou de configuration.
            Veuillez vérifier les fichiers `pharmacies.json`, `backup.json`, et `config.json`.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[1080px] h-[1920px] mx-auto bg-background overflow-hidden">
        <KioskClient
            initialData={initialData as PharmacyData}
            backupData={backupData as PharmacyData}
            config={config as AppConfig}
        />
    </div>
  );
}
