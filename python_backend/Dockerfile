FROM python:3.9-slim-buster

# Set environment variables to prevent Python from writing .pyc files and to buffer output
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies, including ffmpeg for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the requirements file and install Python dependencies
# This is done first to leverage Docker layer caching
COPY python_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY python_backend/ ./python_backend
COPY frontend/ ./frontend

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run main.py when the container launches
# The --host 0.0.0.0 is important to make the service accessible from outside the container
# Using --reload for development to automatically apply code changes
CMD ["uvicorn", "python_backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
