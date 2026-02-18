import type { Zone } from '@/lib/types';
import ZoneCard from './ZoneCard';

interface PharmacyListProps {
  zones: Zone[];
}

const PharmacyList = ({ zones }: PharmacyListProps) => {
  return (
    <div className="px-6 py-4 space-y-8">
      {zones.map((zone) => (
        <ZoneCard key={zone.zone_id} zone={zone} />
      ))}
      {/* Duplicate content to ensure smooth infinite scroll */}
      {zones.map((zone) => (
        <ZoneCard key={`${zone.zone_id}-clone`} zone={zone} aria-hidden="true" />
      ))}
    </div>
  );
};

export default PharmacyList;
