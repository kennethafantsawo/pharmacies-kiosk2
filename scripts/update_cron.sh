#!/bin/bash

# update_cron.sh
# Ce script est destiné à être exécuté par un cron job pour mettre à jour les données des pharmacies.

# IMPORTANT : Modifiez ce chemin pour pointer vers le répertoire racine de votre projet.
PROJECT_DIR="/path/to/your/togo-pharm-kiosk"

# Vérifiez si le répertoire du projet existe
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Erreur : Le répertoire du projet '$PROJECT_DIR' n'a pas été trouvé."
  echo "Veuillez éditer ce script pour définir le chemin correct."
  exit 1
fi

# Aller dans le répertoire du scraper
cd "$PROJECT_DIR/scraper"

# Exécuter le scraper Python
# Assurez-vous que python3 et les dépendances (requirements.txt) sont installés.
# La sortie (stdout et stderr) est redirigée vers un fichier de log.
echo "Lancement du scraper de pharmacies le $(date)"
python3 scrape_pharmacies.py >> "$PROJECT_DIR/logs/cron_update.log" 2>&1

echo "Mise à jour terminée."

# --- Comment ajouter ce script à crontab ---
#
# 1. Rendez ce script exécutable :
#    chmod +x /path/to/your/togo-pharm-kiosk/scripts/update_cron.sh
#
# 2. Ouvrez l'éditeur de crontab :
#    crontab -e
#
# 3. Ajoutez une ligne pour planifier l'exécution.
#    Par exemple, pour l'exécuter tous les lundis à 3h00 du matin :
#
#    0 3 * * 1 /path/to/your/togo-pharm-kiosk/scripts/update_cron.sh
#
#    Signification :
#    - 0 : minute 0
#    - 3 : heure 3 (3 AM)
#    - * : tous les jours du mois
#    - * : tous les mois
#    - 1 : le lundi (0=Dimanche, 1=Lundi, ..., 6=Samedi)
#
# 4. Sauvegardez et fermez l'éditeur. Cron exécutera automatiquement le script à l'heure prévue.
