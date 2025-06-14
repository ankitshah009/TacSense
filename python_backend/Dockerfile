FROM python:3.9-slim-buster AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    swig \
    pkg-config \
    libpulse-dev \
    libasound2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy the requirements file
COPY python_backend/requirements.txt .

# Install Python dependencies
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

# Final stage
FROM python:3.9-slim-buster

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy Python wheels from builder
COPY --from=builder /usr/src/app/wheels /wheels

# Install Python packages from wheels
RUN pip install --no-cache-dir /wheels/*

# Copy application code
COPY python_backend/ ./python_backend
COPY frontend/ ./frontend

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run main.py when the container launches
# The --host 0.0.0.0 is important to make the service accessible from outside the container
# Using --reload for development to automatically apply code changes
CMD ["uvicorn", "python_backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
