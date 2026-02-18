"use client";

import { useEffect, useRef } from 'react';
import type { AppConfig } from '@/lib/types';
import type { PharmacyData } from '@/lib/types';
import usePharmacyData from '@/hooks/usePharmacyData';
import useAutoScroll from '@/hooks/useAutoScroll';

import Header from './Header';
import Footer from './Footer';
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
    <div className="relative w-full h-full flex flex-col">
      <Header 
        weekStart={data?.metadata.week_start} 
        weekEnd={data?.metadata.week_end}
        status={status}
        lastUpdated={lastUpdated}
      />
      
      <main 
        ref={scrollContainerRef}
        className={cn(
          "flex-grow overflow-y-auto pt-[180px] pb-[120px]",
          "transition-opacity duration-1000",
          showContent ? "opacity-100" : "opacity-0"
        )}
      >
        {showContent && data && <PharmacyList zones={data.zones} />}
      </main>

      <Footer />
    </div>
  );
};

export default KioskClient;
