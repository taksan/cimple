# Stage 1: Build the application
FROM python:3.11.3-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base libffi-dev

WORKDIR /app

# Copy the source code
COPY src src
COPY setup.py .

# Build and install the application
RUN pip install --user .

# Stage 2: Create a lightweight production image
FROM python:3.11.3-alpine

RUN apk add curl

# Create a non-root user
RUN adduser -D appuser

RUN chown -R appuser:appuser /opt

USER appuser

# Set the working directory
WORKDIR /home/appuser
RUN mkdir /home/appuser/log

# Copy the installed application from the builder stage
COPY --chown="appuser:appuser" --from=builder /root/.local/lib "/home/appuser/.local/lib"
COPY --chown="appuser:appuser" --from=builder /root/.local/bin "/home/appuser/.local/bin"
COPY config.json /opt/config.json

# Set the entrypoint command
CMD ["/home/appuser/.local/bin/cimple-collector"]
