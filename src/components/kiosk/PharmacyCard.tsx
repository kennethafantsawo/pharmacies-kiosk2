import { Phone, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const PharmacyCard = ({ pharmacy }: PharmacyCardProps) => {
  return (
    <Card className="bg-card/50 border-secondary mb-4">
      <CardHeader className="p-4">
        <CardTitle className="flex justify-between items-start text-3xl text-primary font-bold">
          <span>{pharmacy.name}</span>
          {pharmacy.is_24h && (
            <Badge variant="default" className="bg-green-500 text-white text-lg ml-4 flex-shrink-0">
              <Clock className="mr-2 h-5 w-5" /> 24/7
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-2xl">
        <p className="text-foreground mb-3">{pharmacy.address}</p>
        {pharmacy.phone_formatted && (
          <div className="flex items-center text-accent font-semibold mb-3">
            <Phone className="h-6 w-6 mr-3 flex-shrink-0" />
            <span>{pharmacy.phone_formatted}</span>
          </div>
        )}
        {pharmacy.insurances.length > 0 && (
          <div className="flex items-start">
            <ShieldCheck className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {pharmacy.insurances.map((insurance) => (
                <Badge key={insurance} variant="secondary" className="text-lg">
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
