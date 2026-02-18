// src/hooks/usePharmacyData.ts
import { useState, useEffect } from 'react';
import type { PharmacyData } from '@/lib/types';

export type DataStatus = 'loading' | 'success' | 'offline' | 'error';

const LOCAL_STORAGE_KEY = 'togo-pharm-data';

interface UsePharmacyDataProps {
  initialData: PharmacyData | null;
  backupData: PharmacyData | null;
  refreshInterval: number;
}

const usePharmacyData = ({
  initialData,
  backupData,
  refreshInterval,
}: UsePharmacyDataProps) => {
  const [data, setData] = useState<PharmacyData | null>(initialData);
  const [status, setStatus] = useState<DataStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  const loadFromLocalStorage = (): PharmacyData | null => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        console.log("Loading data from Local Storage...");
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Failed to load or parse from local storage", error);
    }
    return null;
  };

  useEffect(() => {
    const initializeData = () => {
      const localData = loadFromLocalStorage();
      if (localData) {
        setData(localData);
        setStatus('offline');
        setLastUpdated(new Date().toISOString());
      } else if (initialData) {
        setData(initialData);
        setStatus('success');
        setLastUpdated(initialData.metadata.last_updated);
      } else if (backupData) {
        setData(backupData);
        setStatus('offline');
        setLastUpdated(backupData.metadata.last_updated);
      } else {
        setStatus('error');
      }
    };

    initializeData();

    const fetchData = async () => {
      console.log("Attempting to fetch fresh data...");
      setLastUpdated(new Date().toISOString());
      try {
        const response = await fetch('/data/pharmacies.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        
        const freshData: PharmacyData = await response.json();
        console.log("Successfully fetched fresh data.");
        setData(freshData);
        setStatus('success');
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
      } catch (error) {
        console.error("Failed to fetch fresh data:", error);
        setStatus('offline'); // Fallback to offline on fetch error
        // Data already in state is used (from local storage or initial)
      }
    };

    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [initialData, backupData, refreshInterval]);

  return { data, status, lastUpdated };
};

export default usePharmacyData;
