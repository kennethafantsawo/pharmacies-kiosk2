import type { Zone } from '@/lib/types';
import PharmacyCard from './PharmacyCard';

interface ZoneCardProps {
  zone: Zone;
}

const ZoneCard = ({ zone, ...props }: ZoneCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <section {...props}>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-6 px-6 mb-4 border-y border-border shadow-sm">
        <h2 className="text-2xl font-bold text-foreground">
          {zone.zone_code}: <span className="font-semibold text-primary">{zone.zone_name}</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {zone.pharmacies.map((pharmacy) => (
          <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
        ))}
      </div>
    </section>
  );
};

export default ZoneCard;
