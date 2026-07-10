# Supervisor Notification Module

A small full-stack module that lets an employee submit a notification request for a selected supervisor. Supervisors are pulled from an external API, normalized, filtered, and sorted before being shown in the form. The whole module runs as a single containerized unit via Docker Compose.

---

## Table of Contents

- [Features](#features)
- [Screenshot](#screenshot)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)


---

## Features

- **Supervisor dropdown** populated from an external API, normalized to `"<jurisdiction> - <lastName>, <firstName>"`.
- **Sorted & filtered** list — alphabetical by jurisdiction, last name, then first name; entries with a numeric jurisdiction are excluded.
- **Notification form** with First Name, Last Name, optional Email / Phone Number, and a required Supervisor.
- **Opt-in contact fields** — Email and Phone Number inputs enable only when their checkbox is ticked (answering "How would you prefer to be notified?").
- **Server-side validation** with clear, per-field error messages.
- **Success feedback** and automatic form reset after a valid submission.
- **Backend logging** — every successful submission is logged to the backend console.
- **Fully containerized** — one command brings up both services.

---

## Screenshot

![Notification Form](docs/screenshot.png)

---

## Architecture

```
┌─────────────────────────────┐          ┌──────────────────────────────┐
│         Frontend            │          │           Backend            │
│  React + TypeScript (Vite)  │          │      Node.js + Express       │
│      localhost:5173         │          │       localhost:3001         │
│                             │          │                              │
│  GET  /api/supervisors  ────┼──proxy──▶│  GET  /api/supervisors ──┐   │
│  POST /api/submit       ────┼──proxy──▶│  POST /api/submit        │   │
└─────────────────────────────┘          └──────────────────────────┼───┘
                                                                     │
                                                                     ▼
                                       ┌──────────────────────────────────────┐
                                       │  External Managers API (AWS API GW)   │
                                       │  .../api/managers                     │
                                       └──────────────────────────────────────┘
```

**Flow**

1. The UI calls `GET /api/supervisors` to populate the dropdown.
2. The backend fetches the external managers list, then filters, normalizes, and sorts it.
3. The UI submits form data to `POST /api/submit`.
4. The backend validates the payload and returns success or field-level errors.
5. Successful submissions are logged to the backend console.

Inside Docker, the two services share a Compose network; the frontend reaches the backend at `http://backend:3001`, so the browser only ever talks to `http://localhost:5173`.

---

## Tech Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite                   |
| Backend          | Node.js 20, Express 5                         |
| Cross-origin     | `cors`                                        |
| Linting          | oxlint                                        |
| Containerization | Docker, Docker Compose                        |
| External data    | Managers REST API (AWS API Gateway)          |

---

## Installation

**Prerequisites:** [Docker](https://www.docker.com/) and Docker Compose installed and running.

Clone the repository and move into the project directory:

```bash
git clone <your-repo-url>
cd LightFeatherChallenge
```

Build and start everything with a single command:

```bash
docker compose up --build
```

This builds two images and starts two containers:

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:3001

Open **http://localhost:5173** in your browser.

To stop and remove the containers:

```bash
docker compose down
```

> This module is intended to run in Docker only — there is no separate local-node run path.

---

## Configuration

Configuration is handled through environment variables set in `docker-compose.yml`.

| Variable           | Service   | Default                     | Description                                          |
| ------------------ | --------- | --------------------------- | ---------------------------------------------------- |
| `VITE_BACKEND_URL` | frontend  | `http://backend:3001`       | Backend target the Vite dev-server proxies `/api` to |
| `PORT`             | backend   | `3001`                      | Port the Express server listens on                   |

The external supervisor source URL is defined in [`server/server.js`](server/server.js) as `EXTERNAL_SUPERVISORS_URL`.

---

## Usage

1. Open http://localhost:5173.
2. Enter a **First Name** and **Last Name** (letters only).
3. Optionally tick **Email** and/or **Phone Number** and fill in the enabled field(s).
4. Choose a **Supervisor** from the dropdown.
5. Click **SUBMIT**.
   - On success you'll see a confirmation message and the form clears.
   - On invalid input you'll see inline error messages describing what to fix.

Every successful submission is printed to the backend console — see it live with:

```bash
docker compose logs -f backend
```

Example log line:

```
New notification request: {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phoneNumber: undefined,
  supervisor: 'b - Cremin, Elijah'
}
```

---

## API Documentation

Base URL (through the frontend proxy): `http://localhost:5173/api`
Direct backend URL: `http://localhost:3001/api`

### `GET /api/supervisors`

Returns the normalized, filtered, and sorted supervisor list.

**Response `200 OK`**

```json
[
  {
    "id": "4",
    "label": "b - Cremin, Elijah",
    "value": "b - Cremin, Elijah",
    "firstName": "Elijah",
    "lastName": "Cremin",
    "jurisdiction": "b"
  }
]
```

**Response `502 Bad Gateway`** — external source unavailable.

```json
{ "message": "Unable to load supervisors at the moment." }
```

### `POST /api/submit`

Submits a notification request.

**Request body**

| Field         | Type   | Required | Rules                                |
| ------------- | ------ | -------- | ------------------------------------ |
| `firstName`   | string | yes      | letters only                         |
| `lastName`    | string | yes      | letters only                         |
| `supervisor`  | string | yes      | must be selected                     |
| `email`       | string | no       | valid email format when provided     |
| `phoneNumber` | string | no       | valid phone format when provided     |

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "supervisor": "b - Cremin, Elijah"
}
```

**Response `200 OK`**

```json
{ "message": "Request submitted successfully." }
```

**Response `400 Bad Request`** — validation failed.

```json
{
  "message": "Validation failed.",
  "errors": ["First name is required."]
}
```

---

## Testing

The endpoints can be exercised directly with `curl` while the stack is running.

**List supervisors**

```bash
curl http://localhost:3001/api/supervisors
```

**Valid submission** (expect `200`)

```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@example.com","supervisor":"b - Cremin, Elijah"}'
```

**Invalid submission** (expect `400` with errors)

```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"lastName":"Lovelace","supervisor":"b - Cremin, Elijah"}'
```

**Lint / type-check the frontend**

```bash
npm run lint        # oxlint
npx tsc -b          # TypeScript type-check
```

---

## Deployment

The application is packaged for Docker and deploys as a single Compose stack.

```bash
docker compose up --build -d   # start in the background
docker compose ps              # check status
docker compose logs -f         # follow logs
docker compose down            # stop and remove
```

Each service also has its own Dockerfile, so the frontend and backend images can be built and pushed independently to any container registry / orchestrator (e.g. a cloud container service or Kubernetes) if you outgrow single-host Compose.

---

## Folder Structure

```
LightFeatherChallenge/
├── docker-compose.yml        # Orchestrates frontend + backend
├── Dockerfile                # Frontend image (Vite dev server)
├── index.html                # Vite entry HTML
├── package.json              # Frontend dependencies & scripts
├── vite.config.ts            # Vite config + /api proxy
├── tsconfig*.json            # TypeScript configs
├── docs/
│   └── screenshot.png        # UI screenshot used in this README
├── public/                   # Static assets
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Notification form component + logic
│   ├── App.css               # Form styling
│   ├── index.css             # Global styles
│   └── assets/               # Images / icons
└── server/
    ├── Dockerfile            # Backend image
    ├── package.json          # Backend dependencies
    └── server.js             # Express API (supervisors + submit)
```

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/my-change`.
2. Make your changes and keep them lint-clean: `npm run lint`.
3. Verify the stack still runs: `docker compose up --build`.
4. Commit with a clear message and open a pull request describing the change.

---


