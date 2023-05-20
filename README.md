# CImple

CImple is a very simple CI server, but split in multiple pieces in a way
that is interesting to deploy it in a Kubernetes cluster, because it
requires an understanding of several kubernetes concepts to be deployed
successfully.

Here's the software architecture:

![](architecture.svg)

## Running with docker compose

It is possible to run CImple quickly by running the following command:

```sh
docker-compose up
```

Notice that this docker compose requires mounting `/var/run/docker.dock` and 
that the backend run as root. Usually, this is not recommended, but this is
required for Traefik to set up the domains and for the backend to launch
docker containers to run the tasks.

Once the application is up, the following URLs will become available:

- front.cimple.localhost : the application main frontend
- back.cimple.localhost : the application backend
- eviewer.cimple.localhost : the "event viewer" is a simple "auditing" tool 
 
## Limits of the docker compose version

This version is not capable of running scheduled tasks.
