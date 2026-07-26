# Production Dockerfile for VLM Hallucination Studio
FROM python:3.10-slim

WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy pre-built frontend static assets and backend application
COPY frontend/dist ./frontend/dist
COPY backend ./backend

WORKDIR /app/backend

# Configure port for Render / Cloud deployment
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn server bound to $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
