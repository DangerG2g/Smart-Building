# CampusShield — TechTrix'26 Prototype

A React + Vite software prototype for an IoT-based building safety, security, and maintenance monitoring system. The sample campus is fictional and includes six buildings.

## Features in this prototype
- Six-building campus overview with status counts and search/filter.
- Simulated temperature/humidity-style telemetry with configurable demo thresholds.
- Simulated restricted-zone events and access log entries.
- Alert acknowledgement and conversion of an alert into an incident.
- Demo SOS incident form.
- Maintenance requests, categories, priorities, status updates, and optional inspection photo filename capture.
- Visitor check-in/check-out and access log.
- Basic historical activity and maintenance-category summaries.
- Browser-local persistence through `localStorage`.

## Important limitations
This is a software simulation. It does not connect to physical sensors, cameras, access-control hardware, emergency services, push notifications, or live location. SOS does not dispatch help or share location. Photo upload currently records the filename only; image bytes are not uploaded or securely stored. The role selector changes only the displayed demo role and is not authentication or authorization. Data is stored in the current browser only, not shared across devices. Use fictional records only.

## Run locally
1. Install Node.js (LTS).
2. Extract the ZIP and open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

## Production build
- Run `npm run build`.
- Vite outputs the production site into `dist/`.
- For Vercel, Netlify, or Cloudflare Pages, use build command `npm run build` and output directory `dist`.

## Suggested next integrations
A real deployment would require a backend API, shared database, verified sensor gateway (for example MQTT), secure authentication and authorization, privacy/retention controls, secure image storage, and properly configured notification services. Add these only after testing and documenting the integration.
