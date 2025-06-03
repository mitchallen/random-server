# random-server

A simple REST API server that returns random JSON things.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/mitchallen)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/mitchallen)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/virtualmitch)

* * *

## Usage

### Pull the image from the repo

    docker pull ghcr.io/mitchallen/random-server:latest

### To pull older docker hub versions:

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

## Using a GitHub Personal Access Token

* Generate a token for reading packages here: https://github.com/settings/tokens/new

* Here's how to allow docker to access the GitHub Container Registry:

First, create a Personal Access Token (PAT) in GitHub with the appropriate permissions:

* Go to GitHub Settings → Developer Settings → Personal Access Tokens
* Select "Fine-grained tokens" or "Classic tokens"
* Ensure it has read:packages and write:packages permissions


Log in to ghcr.io using Docker:

```sh
docker login ghcr.io -u YOUR_GITHUB_USERNAME
```

When prompted for password, enter your PAT (not your GitHub password).

You could also store the token in (SECURE!) env var and pipe it in.

If you are familiar with **gh** that can also help with login.

* * *

## Docker network example

The sleep statement is only needed if you paste this all in at once:

```sh
docker network create tempnet

docker run --pull=always -itd \
  --name rando --hostname rando \
  --network tempnet \
  ghcr.io/mitchallen/random-server
  
sleep 5

docker ps

docker inspect tempnet

docker run --rm --network tempnet \
  curlimages/curl:latest \
  -s -H "Accept: application/json" \
  http://rando:3100 | jq
  
docker run --rm --network tempnet \
  curlimages/curl:latest \
  -s -H "Accept: application/json" \
  http://rando:3100/v1/people/1 | jq
  
docker run --rm --network tempnet \
  curlimages/curl:latest \
  -s -H "Accept: application/json" \
  http://rando:3100/v1/people | jq

docker stop rando

docker rm rando

docker network rm tempnet
```

* * *

### Rerun with the same or a new container

```sh
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

```sh
curl http://localhost:1220
curl http://localhost:1220/v1 
curl http://localhost:1220/v1/people/count
curl http://localhost:1220/v1/people
curl http://localhost:1220/v1/people/1
```

If you have `jq` installed:

```sh
curl -s http://localhost:1220/ | jq 
```

```sh
curl -s http://localhost:1220/v1/people/1 | jq
```

```sh
curl -s http://localhost:1220/v1/people | jq
```

```sh
curl -s http://localhost:1220/v1 | jq
```


#### Example

```js
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

```sh
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/empty
curl http://localhost:1220/v1/empty/count
curl http://localhost:1220/v1/empty/1
```

* * *

### Randomly generated non-sense words

```sh
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/words
curl http://localhost:1220/v1/words/count
curl http://localhost:1220/v1/words/1
```

#### Example

```js
{
	"type": "words",
	"value": "cezuwdi"
}
```

#### Randomly generated values with non-sense names

```sh
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/values
curl http://localhost:1220/v1/values/count
curl http://localhost:1220/v1/values/1
```

```js
{
	"type": "values",
	"name": "dafe",
	"value": -415365907192.2176
}
```

### Random latitude and longitude

```sh
curl http://localhost:1220/
curl http://localhost:1220/v1
curl http://localhost:1220/v1/coords
curl http://localhost:1220/v1/coords/count
curl http://localhost:1220/v1/coords/1
```

```js
{
	"type": "coords",
	"latitude": 88.43647,
	"longitude": -93.31203
}
```

* * *

### Running Multiple Containers

You can run multiple containers on multiple ports like this:

```sh
docker run -p 8101:3100 --name random1 ghcr.io/mitchallen/random-server:latest

docker run -p 8102:3100 --name random2 ghcr.io/mitchallen/random-server:latest
``` 

Each server should have a unique set of values.

* * *

### Start and stop a running container

```sh
docker stop random-server
docker stop random1
docker stop random2

docker start random-server
docker start random1
docker start random2
```
    
* * *

### Remove

#### Remove Container

```sh
docker stop random-server
docker rm random-server
```

### Remove Image

```sh
docker stop random-server
docker rm random-server
docker rmi ghcr.io/mitchallen/random-server:latest
```

* * *

## Publish

### Publish using make

```sh
make publish
```

* * *

### Automated Docker Builds

#### Note that this section needs revision

New builds of the image were originally created automatically using Docker Cloud.

Current builds are built and hosted via GitHub. 

To trigger a new build via a github tag I do the following:

*NOTE: using annotated tags didn't trigger a new build. Use the simpler format.*

Tags must match this format to trigger a build: /v[0-9.]+$/ 

```sh
git checkout main
git tag v1.1.0
git push origin --tags
```

This triggers two new builds of the Docker image: __v1.1.x__ and __latest__

Docker Cloud:

* https://cloud.docker.com

My Docker Hub page for older projects:

* https://hub.docker.com/u/mitchallen/

Docker Hub page for the older image:

* https://hub.docker.com/r/mitchallen/random-server/

Docker Hub page for older image tags (before porting to github):

* https://hub.docker.com/r/mitchallen/random-server/tags/

