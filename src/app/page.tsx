import KioskClient from '@/components/kiosk/KioskClient';
import { Suspense } from 'react';
import fs from 'fs/promises';
import path from 'path';
import type { PharmacyData } from '@/lib/types';
import config from '../../config.json';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';

async function getInitialData(filePath: string): Promise<PharmacyData | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn(`Could not read data file: ${filePath}. This is expected if the scraper hasn't run yet.`);
    return null;
  }
}

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full text-2xl text-center p-8">
    <svg className="animate-spin h-16 w-16 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="font-bold text-4xl">TogoPharm Kiosk</p>
    <p className="text-xl text-muted-foreground mt-2">Initialisation des données...</p>
  </div>
);

const ErrorFallback = ({ initialData, backupData }: {initialData: PharmacyData | null, backupData: PharmacyData | null}) => (
  <div className="flex items-center justify-center h-full p-8">
    <Alert variant="destructive" className="max-w-2xl">
      <Terminal className="h-4 w-4" />
      <AlertTitle className="text-2xl font-bold">Erreur Critique de Données</AlertTitle>
      <AlertDescription className="mt-2 text-lg">
        Impossible de charger les données des pharmacies. 
        {!initialData && " Le fichier `public/data/pharmacies.json` est manquant ou corrompu."}
        {!backupData && " Le fichier de secours `public/data/backup.json` est aussi indisponible."}
        <p className="mt-4 font-semibold">Veuillez exécuter le script du scraper pour générer les fichiers de données :</p>
        <code className="block bg-black/50 p-2 rounded-md mt-2 text-primary font-mono">python scraper/scrape_pharmacies.py</code>
      </AlertDescription>
    </Alert>
  </div>
)

export default async function Home() {
  const initialData = await getInitialData('public/data/pharmacies.json');
  const backupData = await getInitialData('public/data/backup.json');

  if (!initialData && !backupData) {
    return (
      <div className="w-full h-screen bg-background text-foreground overflow-hidden">
        <ErrorFallback initialData={initialData} backupData={backupData}/>
      </div>
    );
  }

  // Pour la démo, on ajuste la date au 18 Février 2026
  const demoDate = new Date('2026-02-18T10:30:00Z');
  const demoWeekStart = startOfWeek(demoDate, { weekStartsOn: 1 }).toISOString().split('T')[0];
  const demoWeekEnd = endOfWeek(demoDate, { weekStartsOn: 1 }).toISOString().split('T')[0];
  const demoLastUpdated = new Date(demoDate.getTime() - (5 * 60 * 1000)).toISOString(); // 5 minutes before demo date

  if (initialData) {
    initialData.metadata.week_start = demoWeekStart;
    initialData.metadata.week_end = demoWeekEnd;
    initialData.metadata.last_updated = demoLastUpdated;
  }
  if (backupData) {
    backupData.metadata.week_start = demoWeekStart;
    backupData.metadata.week_end = demoWeekEnd;
    backupData.metadata.last_updated = demoLastUpdated;
  }


  return (
    <div className="w-full h-screen bg-background text-foreground overflow-hidden">
      <Suspense fallback={<LoadingFallback />}>
        <KioskClient 
          initialData={initialData} 
          backupData={backupData} 
          config={config} 
          demoDate={demoDate.toISOString()}
        />
      </Suspense>
    </div>
  );
}
