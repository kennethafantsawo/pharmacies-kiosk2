"use client";

import { useState, useEffect, useCallback } from 'react';
import type { PharmacyData } from '@/lib/types';

const PHARMACY_DATA_CACHE_KEY = 'pharmacyData';

export type DataStatus = 'loading' | 'success' | 'offline' | 'error';

interface UsePharmacyDataProps {
  initialData: PharmacyData | null;
  backupData: PharmacyData | null;
  refreshInterval: number;
}

const usePharmacyData = ({ initialData, backupData, refreshInterval }: UsePharmacyDataProps) => {
  const [data, setData] = useState<PharmacyData | null>(initialData);
  const [status, setStatus] = useState<DataStatus>(initialData ? 'success' : 'loading');
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(initialData?.metadata.last_updated);

  const loadData = useCallback(async () => {
    setStatus('loading');
    try {
      // Add a cache-busting query parameter
      const response = await fetch(`/data/pharmacies.json?t=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fetchedData: PharmacyData = await response.json();
      
      setData(fetchedData);
      setStatus('success');
      setLastUpdated(new Date().toISOString());
      localStorage.setItem(PHARMACY_DATA_CACHE_KEY, JSON.stringify(fetchedData));

    } catch (error) {
      console.warn('Failed to fetch primary data, attempting fallback.', error);
      
      // Fallback 1: Local Storage
      const cachedDataStr = localStorage.getItem(PHARMACY_DATA_CACHE_KEY);
      if (cachedDataStr) {
        console.log('Using cached data from Local Storage.');
        setData(JSON.parse(cachedDataStr));
        setStatus('offline');
        setLastUpdated(new Date().toISOString());
        return;
      }
      
      // Fallback 2: Initial data from SSR (if it wasn't used initially)
      if (initialData) {
        console.log('Using initial data from server.');
        setData(initialData);
        setStatus('offline');
        setLastUpdated(new Date().toISOString());
        return;
      }
      
      // Fallback 3: Backup data from SSR
      if (backupData) {
        console.log('Using backup data file.');
        setData(backupData);
        setStatus('offline');
        setLastUpdated(new Date().toISOString());
        return;
      }

      // All fallbacks failed
      console.error('All data sources failed.');
      setStatus('error');
      setLastUpdated(new Date().toISOString());
    }
  }, [initialData, backupData]);

  useEffect(() => {
    // If we don't have initial data, load immediately.
    if (!initialData) {
      loadData();
    }
    
    // Set up the refresh interval
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loadData, refreshInterval, initialData]);

  return { data, status, lastUpdated };
};

export default usePharmacyData;
