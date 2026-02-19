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
    // Log l'erreur pour le débogage mais ne plante pas si un fichier est juste manquant
    console.warn(`Avertissement: Impossible de charger le JSON de ${filePath}:`, error);
    return null;
  }
}

export default async function KioskPage() {
  const initialData = await loadJsonData('public/data/pharmacies.json');
  const backupData = await loadJsonData('public/data/backup.json');
  const config = await loadJsonData('public/data/config.json');

  // Le fichier de config et au moins un fichier de données sont obligatoires
  if (!config || (!initialData && !backupData)) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-destructive text-destructive-foreground p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Erreur de Configuration Critique</h1>
          <p className="text-xl">
            Impossible de charger `config.json` et/ou les fichiers de données (`pharmacies.json`, `backup.json`).
          </p>
          <p className="text-lg mt-2">Veuillez vérifier que ces fichiers existent et sont valides.</p>
        </div>
      </div>
    );
  }

  // Priorise les données fraîches, mais se rabat sur le backup si elles sont indisponibles.
  // Cela rend le rendu côté serveur résilient.
  const primaryData = initialData ?? backupData;
  
  // Le hook côté client a aussi besoin d'un fichier de secours. Si le backup original est manquant,
  // on peut fournir initialData comme secours pour le hook.
  const secondaryData = backupData ?? initialData;

  return (
    <div className="w-[1080px] h-[1920px] mx-auto bg-background overflow-hidden">
        <KioskClient
            initialData={primaryData as PharmacyData}
            backupData={secondaryData as PharmacyData}
            config={config as AppConfig}
        />
    </div>
  );
}
