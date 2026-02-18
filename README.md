# TogoPharm Kiosk - Next.js Edition

This is a Next.js application designed to run in kiosk mode on a portrait display (1080x1920), showing on-call pharmacies in Togo. It's built for performance, reliability, and unattended operation.

## Features

- **Server-Side Rendering (SSR)**: Initial pharmacy data is loaded on the server for a fast first paint with no content flashing.
- **Real-time Data Fetching**: Fetches the latest on-call pharmacy data from a local JSON file, which is updated by a scraper.
- **Automated Updates**:
  - Pharmacy data is refreshed on the client-side every 15 minutes.
  - The entire page performs a hard reload every 24 hours to ensure all scripts and assets are fresh.
- **Continuous Auto-scroll**: The list of pharmacies smoothly scrolls up and down continuously, with configurable pauses at the top and bottom, ensuring all information is visible without user interaction.
- **Robust Offline Fallback**:
  - If fetching the primary data file fails, it attempts to load data from the browser's local storage.
  - If local storage is empty, it falls back to a bundled `backup.json` file.
  - This ensures the kiosk remains functional even during internet outages or server issues.
- **Kiosk-Optimized**:
  - Designed for a fullscreen, portrait-oriented display (1080x1920).
  - Right-click context menu is disabled to prevent user tampering.
- **Dynamic Header & Footer**:
  - A fixed header displays the current week, date, and a live-updating clock.
  - A fixed footer displays an emergency contact number.
- **Configurable**: Key parameters like refresh intervals and scroll speed are managed in a central `config.json` file.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- Python 3.x (for running the scraper)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd togo-pharm-kiosk
    ```

2.  Install Next.js dependencies:
    ```bash
    npm install
    ```

3.  Install Python dependencies for the scraper:
    ```bash
    pip install -r scraper/requirements.txt
    ```

### Running the Scraper

To fetch the latest pharmacy data, run the Python scraper. This script will first back up the old data and then create a new `public/data/pharmacies.json`.

```bash
python scraper/scrape_pharmacies.py
```

It is highly recommended to set this up as a cron job to run weekly. This ensures the data is always up to date. A sample script is provided in `scripts/update_cron.sh`.

### Development

To run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser. For the best preview, use your browser's developer tools to emulate a 1080x1920 portrait device.

### Production & Kiosk Mode

1.  **Build the application:**
    ```bash
    npm run build
    ```

2.  **Start the production server:**
    ```bash
    npm run start
    ```

3.  **Launch in Kiosk Mode:**
    A script is provided to launch a Chromium-based browser in the correct kiosk configuration. Make sure the production server is running, then execute:
    ```bash
    ./scripts/kiosk-start.sh
    ```
    You may need to adjust this script based on your operating system and browser installation path.

## Project Structure

- `public/data/`: Contains the `pharmacies.json` data file and a `backup.json` fallback.
- `scraper/`: Contains the Python script to scrape pharmacy data.
- `scripts/`: Contains shell scripts for starting the kiosk and setting up cron jobs.
- `src/app/`: The main Next.js application source.
  - `page.tsx`: The main entry point, server-rendered.
- `src/components/kiosk/`: React components specific to the kiosk UI (Header, Footer, Lists, etc.).
- `src/hooks/`: Custom React hooks for managing application logic (data fetching, auto-scrolling).
- `src/lib/`: TypeScript types and utility functions.
- `config.json`: Configuration for refresh intervals, scroll behavior, and other settings.
