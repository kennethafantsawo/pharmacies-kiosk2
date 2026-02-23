"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PharmacyData, Zone, Pharmacy, City } from '@/lib/types';
import { updatePharmaciesFile } from './actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react';


// Helper functions adapted from the Python scraper
const normalizePhone = (phone: string): [string, string] => {
  if (!phone) return ["", ""];
  const compactNum = phone.replace(/\D/g, '');
  
  if (compactNum.startsWith('228') && compactNum.length === 11) {
    const localNum = compactNum.substring(3);
    return [`+228${localNum}`, `+228 ${localNum.slice(0, 2)} ${localNum.slice(2, 4)} ${localNum.slice(4, 6)} ${localNum.slice(6, 8)}`];
  }
  if (compactNum.length === 8) {
    return [`+228${compactNum}`, `+228 ${compactNum.slice(0, 2)} ${compactNum.slice(2, 4)} ${compactNum.slice(4, 6)} ${compactNum.slice(6, 8)}`];
  }
  
  return [phone, phone]; // Not a standard Togolese format
};

const sanitizeId = (text: string): string => {
    let sanitized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    return sanitized;
};

const parseZoneHeader = (zoneText: string): Omit<Zone, 'pharmacies'> => {
    const text = zoneText.trim().toUpperCase();
    const cityMap: { [key: string]: string } = {
        'KARA': 'Kara', 'DAPAONG': 'Dapaong', 'SOKODE': 'Sokodé', 'SOKODÉ': 'Sokodé',
        'KPALIME': 'Kpalimé', 'KPALIMÉ': 'Kpalimé', 'ATAKPAME': 'Atakpamé', 'ATAKPAMÉ': 'Atakpamé',
        'BASSAR': 'Bassar', 'MANGO': 'Mango', 'TSEVIE': 'Tsévié', 'TSÉVIÉ': 'Tsévié'
    };

    for (const cityKey in cityMap) {
        if (text.includes(cityKey)) {
            return { zone_id: cityKey, zone_code: cityKey.toUpperCase(), zone_name: cityKey, city: cityMap[cityKey] };
        }
    }

    if (text.startsWith("ZONE ")) {
        const parts = text.split(':', 1);
        const zoneCodePart = parts[0].trim();
        const zoneNamePart = text.substring(zoneCodePart.length + 1).trim();
        const zoneId = zoneCodePart.replace('ZONE ', '').trim();
        return { zone_id: zoneId, zone_code: zoneCodePart, zone_name: zoneNamePart || zoneId, city: "Lomé" };
    }
    
    return { zone_id: sanitizeId(text), zone_code: text, zone_name: text, city: "Lomé" };
};


const AdminToolPage = () => {
  const [rawText, setRawText] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null);


  const handleGenerate = () => {
    setError('');
    setJsonOutput('');
    if (!rawText.trim()) {
      setError("Le champ de texte brut ne peut pas être vide.");
      return;
    }

    try {
        const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
        const zones: Zone[] = [];
        let currentZone: Zone | null = null;
        let currentPharmacy: Partial<Pharmacy> & { raw_address_lines: string[] } | null = null;
        let isInsuranceSection = false;

        for (const line of lines) {
            if (line.toUpperCase().startsWith('ZONE')) {
                if (currentPharmacy && currentZone) {
                    finalizePharmacy(currentPharmacy, currentZone);
                }
                currentPharmacy = null;
                
                const zoneInfo = parseZoneHeader(line);
                currentZone = { ...zoneInfo, pharmacies: [] };
                zones.push(currentZone);
                isInsuranceSection = false;
            } else if (line.toUpperCase().startsWith('PHARMACIE')) {
                 if (currentPharmacy && currentZone) {
                    finalizePharmacy(currentPharmacy, currentZone);
                }
                if (!currentZone) continue;
                
                currentPharmacy = { 
                  name: line.replace(/^Pharmacie\s/i, '').trim(), 
                  raw_address_lines: [], 
                  insurances: [] 
                };
                isInsuranceSection = false;

            } else if (line.toLowerCase().startsWith('assurances acceptées')) {
                if (currentPharmacy) {
                    isInsuranceSection = true;
                    const insuranceText = line.split(':')[1] || '';
                    if (insuranceText.trim()) {
                         currentPharmacy.insurances = [...(currentPharmacy.insurances || []), insuranceText.trim().toUpperCase()];
                    }
                }
            } else if (/(\+?228)?\s*(\d{2}\s*){4}/.test(line) || /^\d{8}$/.test(line.replace(/\s/g, ''))) {
                if (currentPharmacy) {
                    const [phone, phone_formatted] = normalizePhone(line);
                    currentPharmacy.phone = phone;
                    currentPharmacy.phone_formatted = phone_formatted;
                }
            } else {
                 if (currentPharmacy) {
                    if (isInsuranceSection) {
                        currentPharmacy.insurances = [...(currentPharmacy.insurances || []), line.trim().toUpperCase()];
                    } else {
                        currentPharmacy.raw_address_lines.push(line);
                    }
                }
            }
        }
        if (currentPharmacy && currentZone) {
           finalizePharmacy(currentPharmacy, currentZone);
        }

        const citiesMap: { [key: string]: { name: string; zones: string[]; pharmacy_count: number } } = {};
        zones.forEach(zone => {
            const city_name = zone.city;
            if (!citiesMap[city_name]) {
                citiesMap[city_name] = { name: city_name, zones: [], pharmacy_count: 0 };
            }
            if (!citiesMap[city_name].zones.includes(zone.zone_id)) {
                citiesMap[city_name].zones.push(zone.zone_id);
            }
            citiesMap[city_name].pharmacy_count += zone.pharmacies.length;
        });

      const output: PharmacyData = {
        metadata: {
          week_start: "YYYY-MM-DD", // REMPLACER MANUELLEMENT
          week_end: "YYYY-MM-DD",   // REMPLACER MANUELLEMENT
          source_url: "https://www.pharmaciens.tg/on-call",
          last_updated: new Date().toISOString(),
        },
        zones: zones.filter(z => z.pharmacies.length > 0),
        cities: Object.values(citiesMap),
      };

      setJsonOutput(JSON.stringify(output, null, 2));

    } catch (e: any) {
      setError(`Une erreur est survenue lors de la conversion : ${e.message}`);
      console.error(e);
    }
  };

  const finalizePharmacy = (pharm: Partial<Pharmacy> & { raw_address_lines: string[] }, zone: Zone) => {
    if (!pharm.name) return;
    const finalPharm: Pharmacy = {
        id: `pharm_${sanitizeId(pharm.name)}_${sanitizeId(zone.zone_id)}`,
        name: `Pharmacie ${pharm.name}`.replace(/Pharmacie Pharmacie/i, 'Pharmacie').trim(),
        address: pharm.raw_address_lines.join(' ').trim() || "Adresse non disponible",
        phone: pharm.phone || "",
        phone_formatted: pharm.phone_formatted || "",
        insurances: (pharm.insurances || []).map(i => i.split(/[/,-]/).map(s => s.trim().toUpperCase())).flat().filter(Boolean).sort(),
        coordinates: { latitude: null, longitude: null },
        is_24h: pharm.name.toLowerCase().includes('24h') || pharm.name.toLowerCase().includes('24/7')
    };
    zone.pharmacies.push(finalPharm);
  };

  const handleUpdateServer = async () => {
    if (!jsonOutput) return;
    setIsUpdating(true);
    setUpdateResult(null);
    const result = await updatePharmaciesFile(jsonOutput);
    setUpdateResult(result);
    setIsUpdating(false);
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Outil de Conversion de Données</CardTitle>
          <CardDescription>
            Cet outil vous aide à transformer une liste brute de pharmacies en format JSON pour le site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="raw-text">1. Collez les données brutes ici :</label>
            <Textarea
              id="raw-text"
              placeholder="Exemple : 
ZONE A3: CENTRE VILLE ET BE
Pharmacie DU CENTRE
ASSIVITO face WATT
+22891038383
..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleGenerate}>Générer le JSON</Button>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {jsonOutput && (
            <>
                <div className="grid gap-2">
                <label htmlFor="json-output">2. Copiez le JSON généré :</label>
                <Textarea
                    id="json-output"
                    value={jsonOutput}
                    readOnly
                    rows={25}
                    className="font-mono text-sm bg-muted/50"
                />
                </div>

                <div className="space-y-4 rounded-lg border bg-card p-4">
                <h3 className="font-semibold">3. Mettre à jour les données</h3>
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Note importante sur le déploiement</AlertTitle>
                  <AlertDescription>
                    La mise à jour via le bouton ci-dessous **fonctionne uniquement en environnement de développement local**. Sur Vercel, le système de fichiers est en lecture seule. Pour mettre à jour en production, vous devez copier le JSON, le coller dans `src/data/pharmacies.json` et `src/data/backup.json`, puis faire un `push` sur GitHub.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleUpdateServer} disabled={isUpdating}>
                  {isUpdating ? 'Mise à jour en cours...' : 'Mettre à jour le serveur (Local)'}
                </Button>
                {updateResult && (
                  <p className={`text-sm font-medium ${updateResult.success ? 'text-green-600' : 'text-destructive'}`}>
                    {updateResult.message}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminToolPage;
