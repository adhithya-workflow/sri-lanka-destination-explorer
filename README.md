# Sri Lanka Destination Explorer

A full-stack web application for exploring destinations across Sri Lanka, viewing destination details, checking current weather conditions, and managing destination information through an administrator dashboard.

## Features

- Browse Sri Lankan travel destinations.
- View individual destination details.
- Retrieve current weather information using the Open-Meteo API.
- Refresh weather information and periodically update it.
- Authenticate administrators using a login system.
- Manage destinations through an admin dashboard.
- Perform protected destination management operations.

## Technology Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- NestJS
- Node.js
- TypeScript
- Mongoose

**Database and APIs**
- MongoDB
- Open-Meteo Weather API
- REST API
- JWT authentication

## Project Structure

```text
sri-lanka-destination-explorer/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally, or an accessible MongoDB database
- Git and GitHub Desktop

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sri-lanka-destination-explorer
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository URL.

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a local `.env` file using the configuration template in `.env.example`. Replace placeholder values with your own local configuration and secure credentials.

Start the backend:

```bash
npm run start:dev
```

### 3. Configure the frontend

Open a second terminal in the project root and run:

```bash
cd frontend
npm install
```

Create `.env.local` using `.env.example` as a guide. Configure the frontend API URL to point to the running backend.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

The backend is configured to use port `3001` by default.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/destinations` | Retrieve destinations |
| GET | `/destinations/:id` | Retrieve a destination |
| POST | `/destinations` | Create a destination |
| PATCH | `/destinations/:id` | Update a destination |
| DELETE | `/destinations/:id` | Delete a destination |
| POST | `/auth/login` | Authenticate an administrator |

Destination creation, updates, and deletion require the appropriate authentication. Confirm the exact authentication requirements in the implementation before integrating other clients.

## Security Notes

- Environment files containing secrets are excluded from github.
- Configure JWT secrets and administrator credentials securely.
- Never commit passwords, password hashes, database credentials, or production environment variables.
- Use environment variables to configure deployment environments.

## Project Status

The application has been built and tested locally using postman. Production deployment and deployment-specific configuration should be verified separately.

## Author

Developed as a full-stack web development project.

## Test Credentials

Username : admin
Password : AAdhithya2916
