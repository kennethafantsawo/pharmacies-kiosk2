import Clock from './Clock';
import StatusIndicator from './StatusIndicator';
import type { DataStatus } from '@/hooks/usePharmacyData';

interface HeaderProps {
  weekStart?: string;
  weekEnd?: string;
  status: DataStatus;
  lastUpdated?: string;
  currentTime: Date | null;
}

const Header = ({ weekStart, weekEnd, status, lastUpdated, currentTime }: HeaderProps) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-6 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-primary drop-shadow-sm">
            PHARMACIES DE GARDE
          </h1>
          <p className="text-xl font-bold text-foreground">
            {weekStart && weekEnd ? `Du ${formatDate(weekStart)} au ${formatDate(weekEnd)}` : 'Chargement de la semaine...'}
          </p>
          <StatusIndicator status={status} lastUpdated={lastUpdated} currentTime={currentTime} />
        </div>
        <Clock currentTime={currentTime} />
      </div>
    </header>
  );
};

export default Header;
