# Persons Management Application

This application is fully containerized and deploy-ready using Docker.

## Deployment with Docker Compose

The easiest way to run the application in a production-like environment is using Docker Compose.

1. Install [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
2. Clone this repository.
3. To start the application in the background, run:
   ```bash
   docker-compose up -d --build
   ```
4. The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

## Manual Deployment

### Backend (Django)
The backend is configured to use `gunicorn` for WSGI serving and `whitenoise` for static files.

1. Navigate to the `backend` directory.
2. Set environment variables (see `.env.example`).
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`
5. Collect static files: `python manage.py collectstatic --noinput`
6. Start the server: `gunicorn backend.wsgi --bind 0.0.0.0:8000`

### Frontend (Next.js)
The frontend is configured for Next.js standalone output.

1. Navigate to the `frontend` directory.
2. Set environment variables (e.g. `NEXT_PUBLIC_API_URL`).
3. Install dependencies: `npm ci`
4. Build the application: `npm run build`
5. Start the standalone server:
   ```bash
   cd .next/standalone
   node server.js
   ```
