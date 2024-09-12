# random-server

A simple REST API server that returns random JSON things.

## Usage

### Pull the image from the repo

    docker pull ghcr.io/mitchallen/random-server:latest

### To pull older versions:

    docker pull mitchallen/random-server:latest

### Run the image locally as a container

This will pull the image down from the repo if you didn't already.

This example runs the server locally on port 1220.

```sh
docker run -p 1220:3100 --name random-server ghcr.io/mitchallen/random-server:latest
```

If you are using something like an M1 Mac you can add the platform tag:

```sh
docker run --platform linux/amd64 -p 1220:3100 --name random-server ghcr.io/mitchallen/random-server:latest
```

From the doc:

* https://docs.docker.com/engine/reference/commandline/run/#parent-command

*The docker run command first creates a writeable container layer over the specified image, and then starts it using the specified command. That is, docker run is equivalent to the API /containers/create then /containers/(id)/start. A stopped container can be restarted with all its previous changes intact using docker start. See docker ps -a to view a list of all containers.*

* * *

### Rerun with the same or a new container

```
docker stop random-server
docker rm random-server
docker run -p 1220:3100 --name random-server ghcr.io/mitchallen/random-server:latest
```

* * *

### Confirm image is running

    docker ps
    
* * *

### Test with curl commands

Assumes container is running and set to port 1220.

__Note that if you are observing the console, the examples on the screen will show the docker containers internal port - you must use the one you mapped the container to.__

#### About the random values

The random values generated are seeded when the server first starts up.

This is to allow consitency when a record is returned.

You can generate new values by restarting the server.

#### Random People

```
curl http://localhost:1220
curl http://localhost:1220/v1 
curl http://localhost:1220/v1/people/count
curl http://localhost:1220/v1/people
curl http://localhost:1220/v1/people/1
```

#### Example

```
{
	"type": "people",
	"prefix": "Mr.",
	"first": "Augustus",
	"last": "Gomez",
	"age": 42,
	"birthday": "7/8/1959",
	"gender": "male",
	"zip": "74948-0928",
	"ssnFour": "0791",
	"phone": "(509) 504-8066",
	"email": "zeti@tipe.cv"
}
```
* * * 

#### Always Empty

Handy for testing what happens when an empty array is returned.

```
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/empty
curl http://localhost:1220/v1/empty/count
curl http://localhost:1220/v1/empty/1
```

* * *

### Randomy generated non-sense words

```
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/words
curl http://localhost:1220/v1/words/count
curl http://localhost:1220/v1/words/1
```

#### Example

```
{
	"type": "words",
	"value": "cezuwdi"
}
```

#### Randomly generated values with non-sense names

```
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/values
curl http://localhost:1220/v1/values/count
curl http://localhost:1220/v1/values/1
```

```
{
	"type": "values",
	"name": "dafe",
	"value": -415365907192.2176
}
```

### Random latitude and longitude

```
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/coords
curl http://localhost:1220/v1/coords/count
curl http://localhost:1220/v1/coords/1
```

```
{
	"type": "coords",
	"latitude": 88.43647,
	"longitude": -93.31203
}
```

* * *

### Running Multiple Containers

You can run multiple containers on multiple ports like this:

```
docker run -p 8101:3100 --name random1 ghcr.io/mitchallen/random-server:latest

docker run -p 8102:3100 --name random2 ghcr.io/mitchallen/random-server:latest
``` 

Each server should have a unique set of values.

* * *

### Start and stop a running container

    docker stop random-server
    docker stop random1
    docker stop random2

    docker start random-server
    docker start random1
    docker start random2
    
* * *

### Remove

#### Remove Container

    docker stop random-server
    docker rm random-server

### Remove Image

    docker stop random-server
    docker rm random-server
    docker rmi ghcr.io/mitchallen/random-server:latest

* * *

### Automated Docker Builds

#### Note that this section needs revision

New builds of the image were originally created automatically using Docker Cloud.

Current builds are built and hosted via GitHub. 

To trigger a new build via a github tag I do the following:

*NOTE: using annotated tags didn't trigger a new build. Use the simpler format.*

Tags must match this format to trigger a build: /v[0-9.]+$/ 

    git checkout main
    git tag v1.1.0
    git push origin --tags

This triggers two new builds of the Docker image: __v1.1.x__ and __latest__

Docker Cloud:

* https://cloud.docker.com

My Docker Hub page:

* https://hub.docker.com/u/mitchallen/

Docker Hub page for this image

* https://hub.docker.com/r/mitchallen/random-server/

Docker Hub page for this images tags

* https://hub.docker.com/r/mitchallen/random-server/tags/

