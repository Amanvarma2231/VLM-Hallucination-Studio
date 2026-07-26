# Multi-stage Docker build for VLM Hallucination Studio
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.10-slim
WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy built frontend dist assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend application files
COPY backend ./backend
WORKDIR /app/backend

# Set port & start server
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
