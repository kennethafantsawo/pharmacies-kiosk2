// src/hooks/usePharmacyData.ts
import { useState, useEffect } from 'react';
import type { PharmacyData } from '@/lib/types';

export type DataStatus = 'loading' | 'success' | 'offline' | 'error';

const LOCAL_STORAGE_KEY = 'togo-pharm-data';

interface UsePharmacyDataProps {
  initialData: PharmacyData | null;
  backupData: PharmacyData | null;
  refreshInterval: number; // This is no longer used but part of config
}

const usePharmacyData = ({
  initialData,
  backupData,
  refreshInterval, // No longer used
}: UsePharmacyDataProps) => {
  const [data, setData] = useState<PharmacyData | null>(null);
  const [status, setStatus] = useState<DataStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Data is now bundled with the app. The most "up-to-date" data is what's passed from the server.
    // The concept of fetching fresh data on the client is removed to ensure compatibility
    // with static hosting environments like Vercel.
    // The app will get new data when it's redeployed and the page is reloaded.

    // Try loading from local storage first, for offline resilience.
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

    const localData = loadFromLocalStorage();

    if (initialData) {
      // If we have fresh data from the server, use it and update local storage.
      setData(initialData);
      setStatus('success');
      setLastUpdated(initialData.metadata.last_updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
      } catch (error) {
        console.error("Failed to save data to local storage", error);
      }
    } else if (localData) {
      // If server data is missing but we have local storage data
      setData(localData);
      setStatus('offline'); // Indicate that we're using potentially stale offline data
      setLastUpdated(new Date().toISOString());
    } else if (backupData) {
      // If all else fails, use the bundled backup data
      setData(backupData);
      setStatus('offline');
      setLastUpdated(backupData.metadata.last_updated);
    } else {
      // No data available at all
      setStatus('error');
    }
  }, [initialData, backupData]);

  // The client-side fetch interval is removed.
  // Data updates now happen via deployment.

  return { data, status, lastUpdated };
};

export default usePharmacyData;
