FROM python:3.12-slim

# Prevent Python from writing .pyc files & enable unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 1. Copy dependency manifest first to leverage Docker layer caching
COPY requirements.txt .

# 2. Install production dependencies without caching wheel files
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy backend application source
COPY . .

# Expose backend port
EXPOSE 8000

# Start Uvicorn ASGI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
