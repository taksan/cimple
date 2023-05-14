# CImple front

The front for our great CI

## Build

docker build -t <image> .

## Running

docker run -e BACKEND_URL=<yourbackend url> -p <port>:80 <image>

If BACKEND\_URL is omitted, http://localhost:<port> will be used
