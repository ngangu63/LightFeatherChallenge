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

You can run the app either **without Docker** (Node.js on your machine) or **with Docker**. Both start a frontend and a backend.

### Option 1: Run without Docker

**Prerequisites:** Node.js 20+ and npm installed.

#### 1. Install dependencies
From the project root, install the frontend and backend dependencies:
```bash
npm install
cd server && npm install && cd ..
```

#### 2. Start the backend server
In one terminal, run:
```bash
cd server
npm start
```

The backend will be available at:
```text
http://localhost:3001
```

#### 3. Start the frontend
In a separate terminal, from the project root, run:
```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:
```text
http://localhost:5173
```

The frontend proxies API calls (`/api/*`) to the backend automatically, so no extra configuration is needed. To point the frontend at a different backend, set the `VITE_BACKEND_URL` environment variable before running `npm run dev`.

### Option 2: Run with Docker

**Prerequisites:** Docker and Docker Compose installed.

From the project root, build and start both services with a single command:
```bash
docker compose up --build
```

This starts:
- the **frontend** at `http://localhost:5173`
- the **backend** at `http://localhost:3002` (mapped from the container's port 3001 to avoid clashing with a locally running backend)

Open the app at:
```text
http://localhost:5173
```

The frontend container reaches the backend internally over the Compose network (`VITE_BACKEND_URL=http://backend:3001`), so you only need to interact with `http://localhost:5173` in the browser.

To stop the containers, press `Ctrl+C`, then remove them with:
```bash
docker compose down
```

> **Note:** If you prefer to run the backend locally while using the frontend in Docker, stop the local backend process first or adjust the `VITE_BACKEND_URL` in `docker-compose.yml`.

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
