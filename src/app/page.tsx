import { fetchPharmacies } from '@/lib/data';
import PharmacyList from '@/components/PharmacyList';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

export const revalidate = 3600; // ISR: régénère la page chaque heure

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full text-2xl text-center p-8">
    <svg className="animate-spin h-16 w-16 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="font-bold text-4xl">TogoPharm</p>
    <p className="text-xl text-muted-foreground mt-2">Chargement des pharmacies...</p>
  </div>
);


export default async function HomePage() {
  const data = await fetchPharmacies();
  
  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-slate-50">
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">🏥 Pharmacies de Garde</h1>
          <p className="text-lg text-slate-600 mt-1">
            Semaine du <span className="font-semibold">{data.metadata.periode}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Source: {data.metadata.source} (dernière mise à jour: {data.metadata.extraction})
          </p>
        </header>
        
        <Suspense fallback={<LoadingFallback/>}>
          <PharmacyList initialPharmacies={data.pharmacies} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
