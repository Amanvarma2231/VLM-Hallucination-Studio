# Multi-stage Docker build for VLM Hallucination Studio
FROM python:3.10-slim AS builder

WORKDIR /app

# Install Node.js & NPM
RUN apt-get update && apt-get install -y curl nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install Python packages
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy frontend & build production bundle
COPY frontend /app/frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy backend application code
COPY backend /app/backend
WORKDIR /app/backend

# Expose port for FastAPI
EXPOSE 8000

# Start Uvicorn production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
