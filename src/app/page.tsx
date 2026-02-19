import KioskClient from '@/components/kiosk/KioskClient';
import type { PharmacyData, AppConfig } from '@/lib/types';

// Import data directly from the src directory.
// This ensures they are included in the build by Next.js/Vercel.
import configData from '@/data/config.json';
import initialData from '@/data/pharmacies.json';
import backupData from '@/data/backup.json';


// This page is rendered on the server (SSR)
export const revalidate = 0; // No cache, always fresh

export default async function KioskPage() {
  const config = configData as AppConfig;

  // The config file and at least one data file are mandatory
  // This check is a safeguard, but an import failure would have already stopped the build.
  if (!config || (!initialData && !backupData)) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-destructive text-destructive-foreground p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Erreur de Configuration Critique</h1>
          <p className="text-xl">
            Impossible de charger `config.json` et/ou les fichiers de données (`pharmacies.json`, `backup.json`).
          </p>
          <p className="text-lg mt-2">Veuillez vérifier que ces fichiers existent dans `src/data` et sont valides.</p>
        </div>
      </div>
    );
  }

  // Prioritize fresh data, but fall back to backup if unavailable.
  // This makes server-side rendering resilient.
  const primaryData = initialData ?? backupData;
  
  // The client-side hook also needs a fallback file. If the original backup is missing,
  // we can provide initialData as a fallback for the hook.
  const secondaryData = backupData ?? initialData;

  return (
    <div className="w-[1080px] h-[1920px] mx-auto bg-background overflow-hidden">
        <KioskClient
            initialData={primaryData as PharmacyData}
            backupData={secondaryData as PharmacyData}
            config={config}
        />
    </div>
  );
}
