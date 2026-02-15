---
layout: post
title: Connecting local databases - Part V
date: 2024-09-14 16:00 -0300
categories: [Programming, Database, Docker]
tags: [programming, mongodb, postgres, database, nosql, sql docker, container]
lang: en
---

I intended to end this series of posts about local database connection with Java for developers to work on their study projects. But some contributions raised some subjects that I still found interesting to bring: setting up the databases in Docker to avoid local installation and demonstrating how to make the connection using Springboot.

The logic of me having approached it first without Docker is to not include a larger layer of complexity in the subject addressed. Once you talk about Docker, you have to explain what it does, what a container is, among other things.

The same thing is about framework application. Although it reduces complexity, including a framework in the mix leaves a lot "under the hood", which ends up removing the real understanding of what's being done.

But after these explanations, let's go.

Imagine the cargo transport container inside a ship. If one of them is damaged, the others remain intact. The logic is similar for development. A container is an isolated environment, with its specific responsibility and if one suffers damage, the system operation doesn't stop and the affected function can be redirected to another container. They isolate a single application and its dependencies – all external software libraries that the application needs to run – both from the underlying operating system and from other containers.

Where does Docker come into this container story?

Docker uses the Linux kernel among other things to segregate processes, allowing them to run independently. Using an image-based deployment model, it facilitates sharing an application, services and their dependencies, in addition to automating deployment within this container environment.

All this provides efficient use of system resources, more efficient memory usage than virtual machines, resource savings, and ease of application deployment.

Having this brief explanation, Docker today has two ways of use. The first is through Docker Engine, which acts as a client-server application, providing a CLI that uses Docker APIs to execute commands. Using pure Docker Engine is only possible on Linux and to get it set up just do the following (using Ubuntu as an example). First step is to uninstall conflicting versions of packages or unofficial distributions:
```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```
Then you can install the latest version:
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
To verify if everything is ok, run the command below, which will create a test image and run it in a container. When the container runs, it prints a confirmation message and finishes.
```bash
sudo docker run hello-world
```

Now to use Docker Engine via desktop application version, just follow the [installation documentation](https://docs.docker.com/desktop/) depending on your operating system.

You can run both databases I talked about here in two ways: image deployment via CLI (or Docker Desktop) or using Docker Compose to manage multi-containers, which allows the application to bring up the database according to the running environment. Docker Compose already comes in the standard installation, including in the desktop application.

I'll start explaining with Docker Compose, because through it, you can configure both mongo and postgres, since it runs its containers in isolation for the application.

First step is to create a `Dockerfile` so the environment can run anywhere. An example:
```Dockerfile
FROM adoptopenjdk/openjdk11:latest
ARG JAR_FILE=target/your-application.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```
Here in this file I'm defining the JDK version that will be used and the commands to run the application.

The second step is to define the services that support the application in a `yml` file for example `docker-compose.yml` so these services run together with your application in an isolated environment. In the example below, I show an idea of how to configure both databases in a `yml` file to be able to use Docker Compose:
```yml
version: "3.9"

volumes:
  postgres_data:
    driver: local
  mongo_data:
    driver: local

services:
  mongodb_application:
    container_name: mongodb_application
    build: ./Dockerfile
    restart: always
    ports:
      - "27017:27017"
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo -u admin -p pass --quiet) -eq 1
      interval: 10s
      start_period: 30s
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: pass
      MONGO_INITDB_DATABASE: test
    volumes:
      - ./docker-initdb/mongo-init.js:/docker-initdb/mongo-init.js:ro
      - mongo_data:/data/db
  postgres_application:
    container_name: postgres_application
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: application
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
```
It's worth noting that in the case of mongo, in the volumes part, I'm using an example script for database initialization:
```javascript
print('Start #################################################################');

db = db.getSiblingDB('application');
db.createUser(
    {
        user: 'user',
        pwd: 'pass',
        roles: [{ role: 'readWrite', db: 'application' }],
    },
);
```
With everything in place, being well configured, just run a `docker compose up` and Compose will start your entire application, with the database dependencies running for your need.

It's worth mentioning that using compose allows you to separate specific environments and that to run your specific database has other steps that will depend on your application. Something that will be left for the next post when I'm going to talk about using Springboot to configure the databases.

Now if you don't want to use Compose for some reason, we can do the database deployment via Docker CLI. For PostgreSQL it's as follows. First you must download and execute the PostgreSQL image, execute the command below to download the image and run the container:
```bash
docker run --name meu-postgres -e POSTGRES_PASSWORD=minha_senha -d -p 5432:5432 postgres
```
- `--name meu-postgres` gives a name to the container.
- `-e POSTGRES_PASSWORD=minha_senha` sets the postgres user password.
- `-d` makes the container run in the background.
- `-p 5432:5432` maps the container port to the local machine (5432 is the default PostgreSQL port).
- postgres is the name of the official PostgreSQL image.

To access after running the container, you can use `psql` or access directly inside the container.
Via `psql` and then you use the password you defined when bringing up the container:
```bash
psql -h localhost -U postgres
```
Inside the container and use `psql` directly there:
```bash
docker exec -it meu-postgres bash
psql -U postgres
```
If you want to persist data between container restarts, you can mount a volume like this:
```bash
docker run --name meu-postgres -e POSTGRES_PASSWORD=minha_senha -d -p 5432:5432 -v /meu/caminho/para/volume:/var/lib/postgresql/data postgres
```
This ensures that PostgreSQL data is stored locally at `/meu/caminho/para/volume`.

Now let's go to the Mongo case. First you need to extract the MongoDB Docker image:
```bash
docker pull mongodb/mongodb-community-server:latest
```
Now you can execute the image in a container:
```bash
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```
The `-p 27017:27017` in this command maps the container port to the host port. This allows you to connect MongoDB with a connection string from `localhost:27017`.

Check if the container is running:
```bash
docker container ls
```
The output should be something like this:
```bash
CONTAINER ID   IMAGE                                       COMMAND                  CREATED         STATUS         PORTS       NAMES
c29db5687290   mongodb/mongodb-community-server:5.0-ubi8   "docker-entrypoint.s…"   4 seconds ago   Up 3 seconds   27017/tcp   mongo
```
Connect to MongoDB Deployment with `mongosh`:
```bash
mongosh --port 27017
```
Validate your implementation with:
```bash
db.runCommand(
   {
      hello: 1
   }
)
```
The result should be a doc like this:
```mongodb
{
   isWritablePrimary: true,
   topologyVersion: {
      processId: ObjectId("63c00e27195285e827d48908"),
      counter: Long("0")
},
   maxBsonObjectSize: 16777216,
   maxMessageSizeBytes: 48000000,
   maxWriteBatchSize: 100000,
   localTime: ISODate("2023-01-12T16:51:10.132Z"),
   logicalSessionTimeoutMinutes: 30,
   connectionId: 18,
   minWireVersion: 0,
   maxWireVersion: 20,
   readOnly: false,
   ok: 1
}
```
Before going out writing code. I recommend you study a little more about containers and Docker, I recommend reading the [Docker documentation](https://docs.docker.com/get-started/) itself which is quite complete. I'll let this subject be digested a little more before moving on to a practical approach in the example application I'm using. Also, search on your own about the installations if you have any questions. If you're too lazy to search, you're a terrible developer.

An important point is that after this series is finished, I'm going to make available on my GitHub a tested and functional version of a simple application that uses everything we talked about here. So it might be that in the next (and last post of this series) I'll bring it to you.

Cheers!
