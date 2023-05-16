# Stage 1: Build the application
FROM python:3.11.3-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base libffi-dev
RUN apk --no-cache add curl

WORKDIR /app

# Copy the source code
COPY src src
COPY setup.py .

# Build and install the application
RUN pip install --user .

WORKDIR /tmp
RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x ./kubectl

# Stage 2: Create a lightweight production image
FROM python:3.11.3-alpine
RUN apk add --no-cache bash curl

# Create a non-root user
RUN adduser -D appuser

# Set the working directory
WORKDIR /app
COPY executor.sh .
RUN chown -R appuser:appuser /app

USER appuser

# Copy the installed application from the builder stage
COPY --chown="appuser:appuser" --from=builder /root/.local/lib "/home/appuser/.local/lib"
COPY --chown="appuser:appuser" --from=builder /root/.local/bin "/home/appuser/.local/bin"
COPY --chown="appuser:appuser" --from=builder /tmp/kubectl /usr/local/bin/kubectl



# Set the entrypoint command
CMD ["/home/appuser/.local/bin/cimple-back"]
