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

### Option 1: Run locally

#### 1. Install dependencies
From the project root:
```bash
npm install
cd server
npm install
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
In a separate terminal, run:
```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:
```text
http://localhost:5173
```

### Option 2: Run with Docker
From the project root:
```bash
docker compose up --build
```

If port 3001 is already in use on your machine, the Docker setup maps the backend to port 3002. In that case, use:
```text
http://localhost:5173
http://localhost:3002
```

If you prefer to run the backend locally while using the frontend in Docker, stop the local backend process first or change the frontend API URL in the app.

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
