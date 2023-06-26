# Stage 1: Build Angular app
FROM node:18 AS build-stage
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . ./
RUN yarn build

# Stage 2: Serve Angular app with Nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist/cimple-front /usr/share/nginx/html
COPY 30-update-base-url.sh /docker-entrypoint.d/
RUN chmod u+x /docker-entrypoint.d/30-update-base-url.sh
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /usr/share/nginx/html/health
RUN echo "OK" > /usr/share/nginx/html/health/index.html
