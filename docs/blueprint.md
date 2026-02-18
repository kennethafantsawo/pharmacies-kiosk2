# **App Name**: TogoPharm Kiosk

## Core Features:

- Data Fetching and Parsing: Fetch pharmacy data from https://www.pharmaciens.tg/on-call, parse the HTML content, and extract relevant information like pharmacy names, addresses, phone numbers, and insurance details, using the provided Python script.
- Data Storage and Backup: Store the extracted pharmacy data in a structured JSON format (data/pharmacies.json) and automatically create backups (data/backup.json) before each update using the provided Python script.
- Automated Updates: Implement cron jobs to automatically run the scraping script (update_cron.sh) on a weekly basis to keep the pharmacy data up-to-date. The shell script manages the automated execution of the scraper.
- Real-time Clock Display: Display the current week and time in a clear and readable format, updating dynamically in the header section of the kiosk display.
- Automatic Data Refresh and Page Reload: Automatically refresh the pharmacy data every 15 minutes and reload the entire page every 24 hours to ensure the kiosk displays the latest information.
- Continuous Autoscroll: Implement a smooth, continuous autoscroll feature (from top to bottom and back to top) that pauses briefly at the top and bottom of the list to allow viewers to easily read all of the content on screen.
- Offline Mode with Local Storage: Implement a fallback mechanism using local storage to allow the kiosk to continue functioning and displaying cached data even when there is no active internet connection.

## Style Guidelines:

- Primary color: Turquoise (#64FFDA) for a vibrant and attention-grabbing presence.
- Background color: Dark, professional navy blue (#0A1929) to ensure legibility and reduce eye strain.
- Accent color: Light gray (#CCD6F6) to provide good contrast and highlight important information.
- Body and headline font: 'Inter', a sans-serif font for clear readability on digital screens.
- Use simple, clear icons for zones and categories for ease of recognition.
- Design a card-based layout for each zone, listing pharmacies with addresses and contact information. Maintain a fixed header and footer.
- Incorporate subtle transitions for auto-scrolling and data refreshing to avoid jarring changes on screen.