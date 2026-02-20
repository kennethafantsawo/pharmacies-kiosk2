import { Phone, Clock, ShieldCheck, MapPin } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const PharmacyCard = ({ pharmacy }: PharmacyCardProps) => {
  return (
    <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-4 flex-shrink-0">
        <CardTitle className="flex justify-between items-start text-2xl text-foreground font-bold">
          <span className="pr-2">{pharmacy.name}</span>
          {pharmacy.is_24h && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs ml-3 flex-shrink-0">
              <Clock className="mr-1.5 h-4 w-4" /> 24/7
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm flex-grow flex flex-col justify-between">
        <div>
            <div className="flex items-start text-foreground mb-3">
                <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
                <p>{pharmacy.address}</p>
            </div>
            {pharmacy.phone_formatted && (
              <div className="flex items-center text-foreground font-semibold mb-4">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-muted-foreground" />
                <span>{pharmacy.phone_formatted}</span>
              </div>
            )}
        </div>
        {pharmacy.insurances.length > 0 && (
          <div className="flex items-start mt-auto pt-4 border-t border-dashed">
            <ShieldCheck className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              {pharmacy.insurances.map((insurance) => (
                <Badge key={insurance} variant="secondary" className="font-normal text-xs">
                  {insurance}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PharmacyCard;
