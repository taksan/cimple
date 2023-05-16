# Stage 1: Front and Backend and combine
FROM node:20.1-alpine3.17 AS build-stage
WORKDIR /build
COPY front front
COPY back back
RUN cd front && \
    yarn --frozen-lockfile && \
    yarn build
RUN cd back && \
    yarn --frozen-lockfile && \
    yarn build && \
    yarn --frozen-lockfile --production=true

# Stage 2: Serve Angular app with Nginx
FROM node:20.1-alpine3.17
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=build-stage /build/back/ /app

ENTRYPOINT ["/sbin/tini", "node", "dist/server.js"]
