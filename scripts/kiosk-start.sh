#!/bin/bash

# kiosk-start.sh
# Lance un navigateur en mode Kiosk pour l'application d'affichage.
# À adapter selon votre système d'exploitation et le navigateur installé.

# URL de l'application (assurez-vous que le serveur Next.js tourne sur ce port)
APP_URL="http://localhost:3000"

# Dimensions de l'écran Kiosk (Portrait)
WIDTH=1080
HEIGHT=1920

echo "Lancement du Kiosk sur $APP_URL..."
echo "Assurez-vous que le serveur de l'application est bien démarré ('npm run start' ou 'npm run dev')."
echo "Pour quitter le mode Kiosk, utilisez Alt+F4 ou Ctrl+W (peut varier)."

# --- Options pour différents navigateurs (décommentez celle que vous utilisez) ---

# Option 1: Google Chrome
# Assurez-vous que 'google-chrome' est dans votre PATH.
# Sur Linux, le chemin peut être /usr/bin/google-chrome-stable
# Sur macOS, /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
# Sur Windows, vous devrez adapter pour utiliser le .exe
# google-chrome --kiosk --app="$APP_URL" --window-size="$WIDTH,$HEIGHT" --incognito --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI

# Option 2: Chromium (souvent utilisé sur Raspberry Pi et autres systèmes Linux)
# Assurez-vous que 'chromium-browser' ou 'chromium' est installé.
chromium-browser \
  --kiosk \
  --app="$APP_URL" \
  --window-size="$WIDTH,$HEIGHT" \
  --incognito \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --check-for-update-interval=31536000 # Empêche la vérification de mise à jour

# Option 3: Mozilla Firefox
# Firefox n'a pas de mode Kiosk aussi intégré que Chrome. Ceci est une approximation.
# firefox -kiosk -private-window "$APP_URL"

echo "Le navigateur a été lancé. Si la fenêtre n'apparaît pas, vérifiez que le nom de l'exécutable du navigateur est correct."
