#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏥 Scraper des Pharmacies de Garde - Togo
Source : https://www.pharmaciens.tg/on-call
"""

import requests
import re
import json
import os
import sys
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any
import logging

# ===== CONFIGURATION =====
BASE_URL = "https://www.pharmaciens.tg/on-call"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
BACKUP_FILE = os.path.join(OUTPUT_DIR, 'backup.json')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'pharmacies.json')
LOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'logs')
LOG_FILE = os.path.join(LOG_DIR, f'scraper_{datetime.now().strftime("%Y%m%d")}.log')

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

PHONE_PATTERN = re.compile(r'(?:\+228)?\s*(?:\d{2}\s*){4}|\d{8}')
WEEK_PATTERN = re.compile(r'SEMAINE\s+DU\s+(\d{1,2})\s+([A-ZÀ-Ü]+)\s+(?:AU|À|A)\s+(\d{1,2})\s+([A-ZÀ-Ü]+)\s+(\d{4})', re.IGNORECASE)


# ===== LOGGING =====
def setup_logging():
    """Configure les logs"""
    os.makedirs(LOG_DIR, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# ===== HELPER FUNCTIONS =====
def normalize_phone(phone: str) -> tuple:
    """Normalise un numéro de téléphone togolais."""
    if not phone:
        return "", ""
    
    compact_num = re.sub(r'\D', '', phone)
    
    if compact_num.startswith('228') and len(compact_num) == 11:
        compact_num = compact_num[3:]
    
    if len(compact_num) != 8:
        return phone, phone # Pas un format togolais standard

    compact_format = f"+228{compact_num}"
    formatted = f"+228 {compact_num[0:2]} {compact_num[2:4]} {compact_num[4:6]} {compact_num[6:8]}"
    
    return compact_format, formatted

def sanitize_id(text: str) -> str:
    """Crée un ID safe depuis un texte"""
    import unicodedata
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    text = re.sub(r'_+', '_', text)
    return text.strip('_')

def month_fr_to_num(month: str) -> int:
    """Convertit un mois français en numéro"""
    months = {
        'janvier': 1, 'février': 2, 'fevrier': 2, 'mars': 3, 'avril': 4,
        'mai': 5, 'juin': 6, 'juillet': 7, 'aout': 8, 'août': 8,
        'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12, 'decembre': 12
    }
    return months.get(month.lower().strip(), 1)

def extract_week_dates(text: str) -> Dict[str, str]:
    """Extrait les dates de la semaine depuis le texte"""
    match = WEEK_PATTERN.search(text.upper())
    if match:
        start_day, start_month_str, end_day, end_month_str, year = match.groups()
        
        start_month_num = month_fr_to_num(start_month_str)
        end_month_num = month_fr_to_num(end_month_str)
        
        start_year = int(year)
        end_year = start_year
        
        if end_month_num < start_month_num:
            end_year = start_year + 1

        try:
            start_date = datetime(start_year, start_month_num, int(start_day))
            end_date = datetime(end_year, end_month_num, int(end_day))
            
            return {
                "week_start": start_date.strftime("%Y-%m-%d"),
                "week_end": end_date.strftime("%Y-%m-%d")
            }
        except ValueError as e:
            logger.error(f"Date invalide: {e}")

    logger.warning("Impossible d'extraire la date de la semaine via regex. Utilisation de la semaine actuelle comme fallback.")
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    return {
        "week_start": start_of_week.strftime('%Y-%m-%d'),
        "week_end": end_of_week.strftime('%Y-%m-%d'),
    }

def parse_zone_header(zone_text: str) -> Dict:
    """Parse l'en-tête d'une zone pour en extraire les informations."""
    zone_text = zone_text.strip().upper()
    zone_text = re.sub(r'^ZONE\s+', 'ZONE ', zone_text)

    city_map = {
        'KARA': 'Kara', 'DAPAONG': 'Dapaong', 'SOKODE': 'Sokodé', 'SOKODÉ': 'Sokodé',
        'KPALIME': 'Kpalimé', 'KPALIMÉ': 'Kpalimé', 'ATAKPAME': 'Atakpamé', 'ATAKPAMÉ': 'Atakpamé',
        'BASSAR': 'Bassar', 'MANGO': 'Mango', 'TSEVIE': 'Tsévié', 'TSÉVIÉ': 'Tsévié'
    }

    for city_key, city_name in city_map.items():
        if city_key in zone_text:
            return { "zone_id": city_key, "zone_code": city_key.title(), "zone_name": city_name, "city": city_name }

    if zone_text.startswith("ZONE "):
        parts = zone_text.split(':', 1)
        zone_code_part = parts[0].strip()
        zone_name_part = parts[1].strip() if len(parts) > 1 else ""
        zone_id = zone_code_part.replace('ZONE ', '').strip()
        return { "zone_id": zone_id, "zone_code": zone_code_part, "zone_name": zone_name_part or zone_id, "city": "Lomé" }
    
    if "LOME" in zone_text:
        return { "zone_id": "LOME", "zone_code": "Lomé", "zone_name": "Lomé", "city": "Lomé" }

    return { "zone_id": sanitize_id(zone_text), "zone_code": zone_text, "zone_name": zone_text.title(), "city": "Unknown" }


# ===== PARSING LOGIC (ADAPTED FROM USER) =====
def split_assurances(text: str) -> List[str]:
    """Sépare les assurances en une liste lisible."""
    known = ['AMU', 'CNSS', 'INAM', 'SANLAM', 'GRAS SAVOYE', 'GTA-C2A', 'GTA-C2', 'AGCA', 'SUNU', 'TRANSVIE', 'FIDELIA ASSURANCE', 'FIDELIA', 'LA CITOYENNE', 'OLEA', 'NSIA', 'MSH', 'ASCOMA', 'LORICA']
    text = re.sub(r'[/,-]', ' ', text.upper())
    text = re.sub(r'ASSURANCES?:?\s*', '', text)
    
    pattern = r'\b(' + '|'.join(sorted([re.escape(k) for k in known], key=len, reverse=True)) + r')\b'
    found = re.findall(pattern, text)
    
    return sorted(list(set([f.strip().title() for f in found])))

def extract_raw_pharmacies(html_content: str) -> List[Dict]:
    """Extrait les données brutes des pharmacies en analysant le texte ligne par ligne."""
    soup = BeautifulSoup(html_content, 'html.parser')
    pharmacies = []
    text = soup.get_text(separator='\n', strip=True)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    current_zone = None
    current_pharmacy = {}
    
    for line in lines:
        if "SEMAINE DU" in line: continue
        
        is_zone = re.match(r'^(ZONE\s*[A-Z0-9]+[:\s-]*.*|[A-ZÀ-Ü\s-]{4,})$', line) and not line.startswith("Pharmacie") and len(line) < 50
        
        if is_zone:
            if current_pharmacy.get('nom'):
                pharmacies.append(current_pharmacy)
                current_pharmacy = {}
            current_zone = line
            continue
            
        if line.startswith('Pharmacie '):
            if current_pharmacy.get('nom'):
                pharmacies.append(current_pharmacy)
            
            current_pharmacy = {
                'zone': current_zone,
                'nom': line.replace('#### ', '').strip(),
                'adresse': '',
                'telephone': '',
                'assurances': []
            }
            continue
            
        if current_pharmacy.get('nom'):
            phones = PHONE_PATTERN.findall(line)
            if phones:
                current_pharmacy['telephone'] = (current_pharmacy.get('telephone', '') + ' ' + ' '.join(phones)).strip()
            elif 'Assurances' in line or line.isupper():
                assurances_list = split_assurances(line)
                if assurances_list:
                     current_pharmacy['assurances'].extend(assurances_list)
            elif not current_pharmacy['adresse']:
                current_pharmacy['adresse'] = line
            else:
                current_pharmacy['adresse'] += ' ' + line
    
    if current_pharmacy.get('nom'):
        pharmacies.append(current_pharmacy)
    
    return pharmacies


# ===== SCRAPING & DATA STRUCTURING =====
def scrape_pharmacies(url: str = BASE_URL) -> Optional[Dict]:
    """Fonction principale de scraping et de structuration des données."""
    logger.info(f"🔍 Récupération de {url}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        response.raise_for_status()
        response.encoding = response.apparent_encoding or 'utf-8'
        html_content = response.text
        logger.info(f"✅ Page récupérée ({len(html_content)} octets)")
    except requests.RequestException as e:
        logger.error(f"❌ Erreur de requête: {e}")
        return None

    raw_pharmacies = extract_raw_pharmacies(html_content)
    if not raw_pharmacies:
        logger.warning("Aucune pharmacie brute extraite. La structure du site a peut-être changé.")
        return None

    soup = BeautifulSoup(html_content, 'html.parser')
    dates = extract_week_dates(soup.get_text())

    result = {
        "metadata": {
            "week_start": dates["week_start"], "week_end": dates["week_end"],
            "source_url": url, "last_updated": datetime.utcnow().isoformat() + "Z",
        },
        "zones": [], "cities": {}
    }

    zones_dict = {}

    for raw_pharm in raw_pharmacies:
        if not raw_pharm.get('zone') or not raw_pharm.get('nom'):
            continue
        
        zone_info = parse_zone_header(raw_pharm['zone'])
        zone_id = zone_info['zone_id']

        if zone_id not in zones_dict:
            zones_dict[zone_id] = {**zone_info, "pharmacies": []}

        phone, phone_formatted = "", ""
        all_phones_formatted = []
        if raw_pharm.get('telephone'):
            for i, p_raw in enumerate(PHONE_PATTERN.findall(raw_pharm['telephone'])):
                p_compact, p_formatted = normalize_phone(p_raw)
                if i == 0:
                    phone, phone_formatted = p_compact, p_formatted
                all_phones_formatted.append(p_formatted)

        pharm_id = f"pharm_{sanitize_id(raw_pharm['nom'])}_{zone_id.lower()}"
        
        pharm_data = {
            "id": pharm_id,
            "name": raw_pharm['nom'].title(),
            "address": raw_pharm.get('adresse', "Adresse non disponible").strip(),
            "phone": phone,
            "phone_formatted": " / ".join(all_phones_formatted) or phone_formatted,
            "insurances": sorted(list(set(raw_pharm.get('assurances', [])))),
            "coordinates": {"latitude": None, "longitude": None},
            "is_24h": "24h" in raw_pharm['nom'].lower() or "24/7" in raw_pharm['nom'].lower()
        }
        
        if not any(p['id'] == pharm_data['id'] for p in zones_dict[zone_id]['pharmacies']):
            zones_dict[zone_id]['pharmacies'].append(pharm_data)

    result['zones'] = [zone for zone in zones_dict.values() if zone['pharmacies']]
    
    # Calculer les stats par ville
    for zone in result['zones']:
        city_name = zone['city']
        if city_name not in result['cities']:
            result['cities'][city_name] = {"name": city_name, "zones": [], "pharmacy_count": 0}
        
        if zone['zone_id'] not in result['cities'][city_name]['zones']:
            result['cities'][city_name]['zones'].append(zone['zone_id'])
        result['cities'][city_name]['pharmacy_count'] += len(zone['pharmacies'])

    result['cities'] = list(result['cities'].values())

    total_pharmacies = sum(len(z['pharmacies']) for z in result['zones'])
    logger.info(f"✅ Scraping terminé : {len(result['zones'])} zones, {total_pharmacies} pharmacies structurées.")
    
    return result if total_pharmacies > 0 else None

# ===== SAUVEGARDE =====
def save_backup():
    """Sauvegarde l'ancien fichier en backup"""
    if os.path.exists(OUTPUT_FILE):
        try:
            import shutil
            shutil.copy2(OUTPUT_FILE, BACKUP_FILE)
            logger.info(f"💾 Backup créé : {BACKUP_FILE}")
        except Exception as e:
            logger.warning(f"⚠️ Échec backup: {e}")

def save_json(data: Dict, filepath: str):
    """Sauvegarde les données en JSON"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"💾 Données sauvegardées : {filepath}")


# ===== MAIN =====
def main():
    """Point d'entrée principal"""
    logger.info("=" * 60)
    logger.info("🚀 Démarrage du scraper Pharmacies de Garde Togo")
    logger.info("=" * 60)
    
    save_backup()
    data = scrape_pharmacies()
    
    if data:
        save_json(data, OUTPUT_FILE)
        total = sum(len(z['pharmacies']) for z in data['zones'])
        logger.info("=" * 60)
        logger.info(f"✅ SUCCÈS : {len(data['zones'])} zones, {total} pharmacies")
        logger.info(f"📅 Semaine : {data['metadata']['week_start']} au {data['metadata']['week_end']}")
        logger.info("=" * 60)
        return 0
    else:
        logger.error("❌ ÉCHEC : Aucune donnée de pharmacie n'a pu être extraite.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
