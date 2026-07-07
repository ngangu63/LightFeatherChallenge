# LightFeather Challenge

This project implements a supervisor notification module for LightFeather.
It includes:
- a React + TypeScript frontend form
- a Node.js + Express backend API

## What this app does

Users can:
- view a list of supervisors loaded from the provided API
- submit a notification request for a selected supervisor
- receive validation feedback for invalid input

## How to run the project

This application runs entirely in Docker. Both the frontend and backend are started with a single command.

**Prerequisites:** Docker and Docker Compose installed.

From the project root, build and start both services:
```bash
docker compose up --build
```

This starts:
- the **frontend** at `http://localhost:5173`
- the **backend** at `http://localhost:3001`

Open the app at:
```text
http://localhost:5173
```

The frontend container reaches the backend internally over the Compose network (`VITE_BACKEND_URL=http://backend:3001`), so you only need to interact with `http://localhost:5173` in the browser.

To stop the containers, press `Ctrl+C`, then remove them with:
```bash
docker compose down
```

## API endpoints

- GET /api/supervisors
  - returns the normalized list of supervisors
- POST /api/submit
  - accepts a new notification request payload

## Validation rules

The backend validates:
- required first name and last name
- letters-only name fields
- valid email when provided
- valid phone number when provided
- required supervisor selection

## Notes

- Supervisors are fetched from the provided external endpoint and formatted as required.
- Numeric jurisdictions are filtered out.
- Successful submissions are logged to the backend console.
