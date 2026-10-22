# TechTrix'26 — Smart Building Safety Prototype

A one-day React prototype for simulated building monitoring, alerts, emergency SOS records, maintenance requests, and visitor management.

## What is included

- Dashboard for three demo buildings
- Simulated temperature readings and threshold alert trigger
- Alert acknowledgement
- SOS form that creates a demo incident record
- Incident register and close action
- Maintenance request form and status workflow
- Visitor register and check-out action
- Role selector for demonstration purposes
- Browser `localStorage` persistence
- Responsive layout for desktop and mobile

## Important limitations

- Sensor readings and restricted-area events are simulated, not connected to real sensors or CCTV.
- SOS does not contact emergency services and does not send live location.
- The role selector is a UI demonstration, **not secure authentication or authorization**.
- Data is stored only in the current browser profile and is not shared between devices or team members.
- Do not enter real personal or sensitive information into this prototype.

Before real use, add a backend, real authentication, server-enforced authorization rules, secure file uploads, audit logging, and appropriate privacy/security review.

## Run locally

Install Node.js LTS from https://nodejs.org/ if it is not already installed.

In a terminal, inside this project folder, run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Build check

```bash
npm run build
```

The generated production files will be in `dist/`.

## Deploy with Vercel

1. Create a GitHub repository and upload the project files.
2. Sign in at https://vercel.com/ and import the repository.
3. Vercel should detect Vite automatically.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy and open the public URL it provides.

## Suggested one-day build order

1. Start the app and confirm the dashboard loads.
2. Try "Simulate sensor alert" on the overview or Monitoring page.
3. Test SOS creation and close the resulting incident.
4. Create a maintenance request and change its status.
5. Register a visitor and check them out.
6. Refresh the browser and confirm records persist.
7. Test on a mobile-sized screen.
8. Deploy and rehearse a short demo.
