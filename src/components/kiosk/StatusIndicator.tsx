import type { DataStatus } from '@/hooks/usePharmacyData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wifi, WifiOff, Loader, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  status: DataStatus;
  lastUpdated?: string;
}

const StatusIndicator = ({ status, lastUpdated }: StatusIndicatorProps) => {
  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Badge variant="secondary" className="text-lg bg-blue-500/20 text-blue-300 border-blue-400">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour...
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive" className="text-lg bg-orange-500/20 text-orange-300 border-orange-400">
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
           <Badge variant="secondary" className="text-lg bg-green-500/20 text-green-300 border-green-400">
            <CheckCircle className="mr-2 h-4 w-4" />
            Données à jour
          </Badge>
        );
      default:
        return null;
    }
  };

  const timeAgo = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: fr })
    : '';

  return (
    <div className="flex items-center gap-4 mt-3 text-muted-foreground text-lg">
      {getStatusContent()}
      {lastUpdated && (
        <span>Dernière vérification: {timeAgo}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
