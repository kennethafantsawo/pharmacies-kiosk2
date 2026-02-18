"use client";

import { useEffect, useRef, useState } from 'react';
import type { AppConfig } from '@/lib/types';
import type { PharmacyData } from '@/lib/types';
import usePharmacyData from '@/hooks/usePharmacyData';
import useAutoScroll from '@/hooks/useAutoScroll';

import Header from './Header';
import PharmacyList from './PharmacyList';
import { cn } from '@/lib/utils';

interface KioskClientProps {
  initialData: PharmacyData | null;
  backupData: PharmacyData | null;
  config: AppConfig;
}

const KioskClient = ({ initialData, backupData, config }: KioskClientProps) => {
  const { data, status, lastUpdated } = usePharmacyData({
    initialData,
    backupData,
    refreshInterval: config.dataRefreshIntervalMinutes * 60 * 1000,
  });

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount to avoid hydration mismatch
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      // Using new Date() directly is simpler and resyncs the clock every second,
      // preventing potential drift from interval inaccuracies.
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this runs only once on mount


  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useAutoScroll({
    ref: scrollContainerRef,
    isEnabled: status === 'success' || status === 'offline',
    ...config,
  });

  useEffect(() => {
    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, config.pageReloadHours * 60 * 60 * 1000);

    return () => clearTimeout(reloadTimeout);
  }, [config.pageReloadHours]);

  const showContent = status === 'success' || status === 'offline';

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      <Header 
        weekStart={data?.metadata.week_start} 
        weekEnd={data?.metadata.week_end}
        status={status}
        lastUpdated={lastUpdated}
        currentTime={currentTime}
      />
      
      <main 
        ref={scrollContainerRef}
        className={cn(
          "flex-grow overflow-y-auto pt-[180px] pb-[20px]", // Give some space for header
          "transition-opacity duration-1000",
          showContent ? "opacity-100" : "opacity-0"
        )}
      >
        {status === 'loading' && (
             <div className="flex flex-col items-center justify-center h-full text-2xl text-center p-8">
                <svg className="animate-spin h-16 w-16 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-bold text-4xl">TogoPharm Kiosk</p>
                <p className="text-xl text-muted-foreground mt-2">Chargement des pharmacies...</p>
            </div>
        )}
        {showContent && data && <PharmacyList zones={data.zones} />}
      </main>

      {/* Footer is removed as per user request */}
    </div>
  );
};

export default KioskClient;
