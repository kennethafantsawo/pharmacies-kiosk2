'use client';

import { useState, useMemo } from 'react';
import type { Pharmacy } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Building, MapPin, ShieldCheck } from 'lucide-react';

interface PharmacyListProps {
  initialPharmacies: Pharmacy[];
}

export default function PharmacyList({ initialPharmacies }: PharmacyListProps) {
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const zones = useMemo(() => 
    [...new Set(initialPharmacies.map(p => p.zone))].sort(),
    [initialPharmacies]
  );

  const filtered = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    return initialPharmacies.filter(p => {
      const matchZone = selectedZone === 'all' || p.zone === selectedZone;
      const matchSearch = !search || 
        p.nom.toLowerCase().includes(lowerCaseSearch) ||
        p.adresse.toLowerCase().includes(lowerCaseSearch) ||
        p.assurances.some(a => a.toLowerCase().includes(lowerCaseSearch));
      return matchZone && matchSearch;
    });
  }, [initialPharmacies, search, selectedZone]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-sm p-4 -mx-4 z-10 rounded-lg">
        <Input
          type="text"
          placeholder="Rechercher par nom, adresse ou assurance..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-base"
        />
        <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-full md:w-[380px] text-base">
                <SelectValue placeholder="Filtrer par zone" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} pharmacie{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {filtered.map((pharmacy, idx) => (
          <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-primary">
                <Building className="h-6 w-6" /> 
                {pharmacy.nom}
              </CardTitle>
              <CardDescription className="flex items-center gap-3 pt-1">
                <MapPin className="h-4 w-4"/>
                {pharmacy.zone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="text-slate-600">{pharmacy.adresse}</p>
               {pharmacy.telephone && (
                <a 
                  href={`tel:${pharmacy.telephone}`}
                  className="flex items-center gap-3 text-blue-600 hover:underline"
                >
                  <Phone className="h-4 w-4" /> {pharmacy.telephone}
                </a>
              )}
              {pharmacy.assurances.length > 0 && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-1 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.assurances.map(assu => (
                      <Badge 
                        key={assu}
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {assu}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground bg-white rounded-lg">
                <p>Aucune pharmacie ne correspond à votre recherche.</p>
            </div>
        )}
      </div>
    </div>
  );
}
