---
layout: post
title: Connecting local databases - Part VI
date: 2024-09-25 09:00 -0300
categories: [Programming, Database, Docker]
tags: [programming, mongodb, database, nosql, docker, container]
lang: en
---

After giving a brief introduction to using Docker and docker compose to bring up the application in a container, now let's go to the details of the test application using MongoDB.

First, to be precise for the specific application, I needed to make some modifications for the build, I'll show below how the Dockerfile, docker-compose.yml and the pom.xml of the application turned out.

Dockerfile:
```Dockerfile
# Use uma imagem base adequada
FROM openjdk:17-jdk-slim

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o arquivo JAR gerado pelo Maven/Gradle
COPY target/delivery-management-api-mongo-1.0-SNAPSHOT.jar app.jar

# Defina o comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]
```
This openjdk:17 image is a "slim" version, which is lighter and suitable for most applications.

The `ENTRYPOINT` must be adjusted to reflect the correct path inside the container, pay attention to this.

`docker-compose.yml`:
```yml
version: '3.9'

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db  # Persistir dados do MongoDB

  delivery_management_api:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/spring-test
      - SPRING_DATA_MONGODB_DATABASE=spring-test

volumes:
  mongo_data:

networks:
  app-network:
```
- Version: Specifies the version of the Docker Compose syntax you're using. Version 3.9 is one of the most recent versions, offering support for many features, such as networks and volumes.
- Services: This section defines the containers that will be run. Each container is an instance of a service.

MongoDB Service:
- mongo: The service name. This is the name you'll use to reference this container.

- image: Specifies the Docker image to be used.

- mongo:latest indicates that the latest version of the official MongoDB image will be downloaded and used. If you already have a MongoDB image locally, that image will be used.

- ports: Maps the container ports to the host machine ports. "27017:27017" means that port 27017 of the container (MongoDB default) will be accessible on port 27017 of the host. This allows you to access MongoDB from outside the container, for example, using a MongoDB client.

- volumes: Maps a Docker volume, which allows data persistence. mongo_data:/data/db indicates that the volume called mongo_data will be used to store MongoDB data in the /data/db directory inside the container. This means that even if the container is destroyed, the data persists in the volume.

Application Service:
- delivery_management_api: Service name for your application.

- build: Indicates that the container should be built from the Dockerfile located in the current directory (.). The Dockerfile must be in the same directory where docker-compose.yml is located.

- ports: Similar to the MongoDB service, "8080:8080" maps port 8080 of the container to port 8080 of the host. This allows you to access your application through the URL http://localhost:8080.

- depends_on: Specifies that the delivery_management_api service depends on the mongo service. This ensures that MongoDB is started before the application. However, this doesn't guarantee that MongoDB is fully ready to accept connections when the application starts.

- environment: Defines environment variables for the container. These variables are passed to the application environment and can be used for configuration.

- SPRING_DATA_MONGODB_URI: MongoDB connection URL. Here, mongodb://mongo:27017/spring-test indicates that the application should connect to the MongoDB service named mongo on port 27017 and use the spring-test database.

- SPRING_DATA_MONGODB_DATABASE: Database name to be used by the application.

Volumes and networks:
- Volumes: Defines the volumes used by the services. Here, mongo_data is a volume that will be used by the mongo service to persist data. By creating a named volume, you can easily manage it and it will persist even if the containers are removed.

- Networks (optional): This section is optional and allows you to define custom networks to connect the services. If you define a network here, the services can communicate with each other using their names. In your example, there is no network defined.

Bringing up the application using docker-compose makes the developer's life much easier in numerous aspects. One of them is not worrying about local development environment, since everything will run in the defined container.

With the Docker and docker compose configuration working (I tested the application and calls to the database) now let's go to the application adjustments to use Springboot, something that will greatly reduce code complexity and facilitate the application structure.

First, we can say goodbye to the database configuration class, since using the framework and Docker, we don't need to build the relationships manually.

The application's `pom.xml` needs to be adequate to provide structure to run the way we defined.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.danielmesquita</groupId>
    <artifactId>delivery-management-api-mongo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.boot.version>3.1.4</spring.boot.version> <!-- Defina a versão do Spring Boot -->
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Spring Boot Starter for MongoDB -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>

        <!-- Spring Boot Starter for Web (caso queira construir APIs RESTful) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <!-- Validação (javax) -->
        <dependency>
            <groupId>javax.validation</groupId>
            <artifactId>validation-api</artifactId>
            <version>2.0.1.Final</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Plugin do Spring Boot -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                        <!-- O elemento <goal> especifica qual tarefa o plugin deve realizar. No seu exemplo, você está utilizando o goal repackage. -->
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.4.2</version> <!-- Certifique-se de usar uma versão compatível -->
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>org.danielmesquita.Application</mainClass> <!-- Defina a sua classe principal -->
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

The repackage goal of `spring-boot-maven-plugin` has an important relationship with Docker and Docker Compose, especially when it comes to packaging and running your Spring Boot application in a container:
- creates an executable .jar file that contains the entire application, allowing you to run the Spring application in any environment with Java installed;
- with the executable .jar, you can easily run your Spring Boot application in the container with a single command, like `java -jar app.jar`. This simplifies the application startup process in the Docker environment;
- when you run docker-compose up, Compose will build the application image using the Dockerfile, where the JAR has already been created by Maven with the `repackage` goal. This means you don't need to worry about building and managing the JAR separately, as Docker does it for you;
- using repackage and Docker together ensures that you have a consistent and portable execution environment, you can move the container to any machine that has Docker, and your Spring Boot application will work exactly the same way, with all its dependencies already included in the JAR.

You can run without using repackage, but some disadvantages I see are increased complexity to manage dependencies, larger images and higher probability of error due to wrong image management.

With the application structure ready to use Spring and run in Docker, we can go to the code.

First, we need to adjust the main class (which runs the application) to configure Spring Boot. In previous versions, I did some code in them to show the changes in the database, here I won't do that. I'll use the layered architecture, separating responsibilities between Repository, Service and Controller appropriately.

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```
The "Product" entity undergoes some changes to include so we can use Spring Boot and Mongo, since the framework provides resources for interaction with the database requiring less boilerplate code.

The getters, setters, constructors etc remain, what changes is the @Document annotation from mongo that defines that this entity represents the `Product` collection in my database. Additionally, the `id` attribute receives the `@Id` annotation, responsible for automatic generation of the unique id within the collection.
```java
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Product")
public class Product {
  @Id private String id;

  @NotNull(message = "Product name is required")
  private String name;

  @NotNull(message = "Product price is required")
  private Double price;

  @NotNull(message = "Product description is required")
  @Size(min = 10, message = "Product description requires 10 characters at least")
  private String description;

  private String imageUri;

  public Product() {}

  public Product(String id, String name, Double price, String description, String imageUri) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.imageUri = imageUri;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Double getPrice() {
    return price;
  }

  public void setPrice(Double price) {
    this.price = price;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getImageUri() {
    return imageUri;
  }

  public void setImageUri(String imageUri) {
    this.imageUri = imageUri;
  }

  public boolean validateId(String id) {
    return id != null && !id.isEmpty();
  }
}
```
The `ProductRepository` class also undergoes changes and becomes much more simplified, considering the purpose of this application. Here I'm transforming it into an interface that extends the MongoRepository interface, which already contains the necessary methods for interaction with the database. But it's possible to insert some custom methods like the examples below.

```java
import java.util.List;
import org.danielmesquita.entities.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

  List<Product> findByName(String name);

  List<Product> findByPrice(Double price);

  List<Product> findByDescriptionContaining(String description);
}
```

Now the `Service` class, where the business rules of the application are and which orchestrates the interaction between repository and Controller:
```java
import java.util.List;
import org.danielmesquita.entities.Product;
import org.danielmesquita.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
  @Autowired private ProductRepository productRepository;

  @Autowired private MongoTemplate mongoTemplate;

  public void insertProduct(Product product) {
    productRepository.save(product);
  }

  public Product findProductById(String id) {
    return productRepository.findById(id).orElse(null);
  }

  public List<Product> findAllProducts() {
    return productRepository.findAll();
  }

  public void updateProduct(Product product) {
    productRepository.save(product);
  }

  public void deleteProduct(String id) {
    productRepository.deleteById(id);
  }
}
```
And lastly, the Controller that receives HTTP requests (GET, POST, PUT, DELETE), processes and returns responses.
```java
import java.util.List;
import org.danielmesquita.entities.Product;
import org.danielmesquita.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  @Autowired private ProductService productService;

  @PostMapping
  public ResponseEntity<Product> createProduct(@RequestBody Product product) {
    productService.insertProduct(product);
    return new ResponseEntity<>(product, HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<Product>> getAllProducts() {
    List<Product> products = productService.findAllProducts();
    return new ResponseEntity<>(products, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Product> getProductById(@PathVariable String id) {
    Product product = productService.findProductById(id);
    return product != null
        ? new ResponseEntity<>(product, HttpStatus.OK)
        : new ResponseEntity<>(HttpStatus.NOT_FOUND);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Product> updateProduct(
      @PathVariable String id, @RequestBody Product product) {
    product.setId(id);
    productService.updateProduct(product);
    return new ResponseEntity<>(product, HttpStatus.OK);
  }
  
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
    productService.deleteProduct(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
```
Here I used the `@RestController` annotation from Spring, which is a specialization of `@Controller`.

The `@Controller` annotation is more suitable for an MVC controller (Model-View-Control), which returns views, usually HTML. For those who use JSP, this should be familiar.

The difference is that what I chose to use is more suitable for RESTful APIs. It combines `@Controller` and `@ResponseBody`, allowing you to return data directly in the response body, usually in JSON, but it can be XML too.

Another point was that I used the `@Autowired` annotation for dependency injection. It will automatically provide an instance of the class I need, in this case it's `ProductService`.

The main advantages of using this annotation are reduction of coupling, since you can make changes in the service without touching the controller, and ease of testing and creating mocks.

And that's it, folks. The intention was to make just one more post showing both use cases (Mongo and PostgreSQL), but to not make it too long. I'll end here. Later I'll bring the use case with postgres. It will be shorter, since we've already gone through the concept and use of Docker and docker compose.

Cheers!
