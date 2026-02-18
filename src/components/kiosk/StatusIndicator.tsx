"use client";

import { useState, useEffect } from 'react';
import type { DataStatus } from '@/hooks/usePharmacyData';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wifi, WifiOff, Loader, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  status: DataStatus;
  lastUpdated?: string;
  currentTime: Date | null;
}

const StatusIndicator = ({ status, lastUpdated, currentTime }: StatusIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated || !currentTime) {
      setTimeAgo('');
      return;
    }

    const lastUpdatedDate = new Date(lastUpdated);
    setTimeAgo(formatDistance(lastUpdatedDate, currentTime, { addSuffix: true, locale: fr }));

  }, [lastUpdated, currentTime]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Badge variant="outline" className="text-lg text-blue-600 border-blue-500/50 bg-blue-50">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour...
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="text-lg text-orange-600 border-orange-500/50 bg-orange-50">
            <WifiOff className="mr-2 h-4 w-4" />
            Mode hors-ligne
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="text-lg">
            Erreur de chargement
          </Badge>
        );
      case 'success':
        return (
           <Badge variant="outline" className="text-lg text-green-600 border-green-500/50 bg-green-50">
            <CheckCircle className="mr-2 h-4 w-4" />
            Données à jour
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-4 mt-3 text-muted-foreground text-base">
      {getStatusContent()}
      {timeAgo && (
        <span>Dernière vérification: {timeAgo}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
