import type { Zone } from '@/lib/types';
import PharmacyCard from './PharmacyCard';

interface ZoneCardProps {
  zone: Zone;
}

const ZoneCard = ({ zone, ...props }: ZoneCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <section {...props}>
      <div className="sticky top-0 z-10 bg-background py-3 -mx-6 px-6 mb-4 border-y-2 border-primary shadow-lg shadow-black/20">
        <h2 className="text-4xl font-extrabold text-foreground">
          {zone.zone_code}: <span className="text-primary">{zone.zone_name}</span>
        </h2>
      </div>
      <div>
        {zone.pharmacies.map((pharmacy) => (
          <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
        ))}
      </div>
    </section>
  );
};

export default ZoneCard;
