---
layout: post
title: Conectando bancos de dados locais - Parte VI
date: 2024-09-25 09:00 -0300
categories: [Programação, Banco de dados, Docker]
tags: [programação, mongodb, banco de dados, nosql, docker, container]  
---

Depois de dar uma breve introdução da utilização do Docker e docker compose para subir a aplicação em um container, agora vamos ao detalhamento da aplicação de teste usando o MongoDB.

Primeiro, para ficar preciso para a aplicação específica, precisei fazer algumas modificações para o build, vou mostrar abaixo como ficou o Dockerfile, o docker-compose.yml e o próprio pom.xml da aplicação.

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
Essa imagem do openjdk:17 é uma versão "slim", que é mais leve e adequada para a maioria das aplicações.

O `ENTRYPOINT` deve ser ajustado para refletir o caminho correto dentro do container, atenção nisso.

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
- Versão: Especifica a versão da sintaxe do Docker Compose que você está utilizando. A versão 3.9 é uma das versões mais recentes, oferecendo suporte a muitos recursos, como redes e volumes.
- Services: Esta seção define os contêineres que serão executados. Cada contêiner é uma instância de um serviço.

Serviço MongoDB:
- mongo: O nome do serviço. Este é o nome que você usará para referenciar este contêiner.

- image: Especifica a imagem do Docker a ser utilizada.

- mongo:latest indica que a última versão da imagem oficial do MongoDB será baixada e utilizada. Caso você já tenha uma imagem do MongoDB localmente, essa imagem será usada.

- ports: Mapeia as portas do contêiner para as portas da máquina host. "27017:27017" significa que a porta 27017 do contêiner (padrão do MongoDB) será acessível na porta 27017 do host. Isso permite que você acesse o MongoDB de fora do contêiner, por exemplo, utilizando um cliente MongoDB.

- volumes: Mapeia um volume do Docker, o que permite a persistência de dados. mongo_data:/data/db indica que o volume chamado mongo_data será utilizado para armazenar os dados do MongoDB no diretório /data/db dentro do contêiner. Isso significa que, mesmo que o contêiner seja destruído, os dados persistem no volume.

Serviço da Aplicação:
- delivery_management_api: Nome do serviço para a sua aplicação.

- build: Indica que o contêiner deve ser construído a partir do Dockerfile localizado no diretório atual (.). O Dockerfile deve estar no mesmo diretório onde o docker-compose.yml está localizado.

- ports: Similar ao serviço MongoDB, "8080:8080" mapeia a porta 8080 do contêiner para a porta 8080 do host. Isso permite que você acesse sua aplicação pela URL http://localhost:8080.

- depends_on: Especifica que o serviço delivery_management_api depende do serviço mongo. Isso garante que o MongoDB seja iniciado antes da aplicação. No entanto, isso não garante que o MongoDB esteja totalmente pronto para aceitar conexões quando a aplicação iniciar.

- environment: Define variáveis de ambiente para o contêiner. Essas variáveis são passadas para o ambiente da aplicação e podem ser utilizadas para configuração.

- SPRING_DATA_MONGODB_URI: URL de conexão ao MongoDB. Aqui, mongodb://mongo:27017/spring-test indica que a aplicação deve se conectar ao serviço MongoDB nomeado mongo na porta 27017 e usar o banco de dados spring-test.

- SPRING_DATA_MONGODB_DATABASE: Nome do banco de dados a ser utilizado pela aplicação.

Volumes e redes:
- Volumes: Define os volumes utilizados pelos serviços. Aqui, mongo_data é um volume que será usado pelo serviço mongo para persistir dados. Ao criar um volume nomeado, você pode gerenciá-lo facilmente e ele persistirá mesmo se os contêineres forem removidos.

- Networks (opcional): Esta seção é opcional e permite que você defina redes personalizadas para conectar os serviços. Se você definir uma rede aqui, os serviços podem se comunicar entre si usando seus nomes. No seu exemplo, não há nenhuma rede definida.

Subir a aplicação usando o docker-compose facilita muito a vida da pessoa desenvolvedora em inúmeros aspectos. Um deles é não se preocupar com ambiente local de desenvolvimento, uma vez que vai rodar tudo no container definido.

Com a configuração do Docker e docker compose funcionando (testei a aplicação e chamadas no banco) agora vamos aos ajustes da aplicação para utilização do Springboot, algo que vai diminuir muito a complexidade de código e facilitar a estrutura da aplicação.

Primeiro, podemos dar adeus a classe de configuração do banco de dados, uma vez que usando o framework e o Docker, não precisamos construir os relacionamentos manualmente.

O `pom.xml` da aplicação precisa estar adequado pra proporcionar estrutura pra rodar da maneira que definimos.

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

O goal repackage do `spring-boot-maven-plugin` tem uma relação importante com o Docker e o Docker Compose, especialmente quando se trata de empacotar e executar sua aplicação Spring Boot em um container:
- cria um arquivo .jar executável que contém toda a aplicação, permitindo que execute a aplicação Spring em qualquer ambiente com o Java instalado;
- com o .jar executável, você pode facilmente executar sua aplicação Spring Boot no container com um único comando, como `java -jar app.jar`. Isso simplifica o processo de inicialização da aplicação no ambiente Docker;
- quando você executa docker-compose up, o Compose irá construir a imagem da aplicação usando o Dockerfile, onde o JAR já foi criado pelo Maven com o goal `repackage`. Isso significa que você não precisa se preocupar em construir e gerenciar o JAR separadamente, pois o Docker faz isso por você;
- usar o repackage e Docker em conjunto garante que você tenha um ambiente de execução consistente e portátil, você pode mover o container para qualquer máquina que tenha o Docker, e sua aplicação Spring Boot funcionará exatamente da mesma forma, com todas as suas dependências já incluídas no JAR.

Você pode rodar sem usar o repackage, mas algumas desvantagens que vejo é aumento da complexidade pra gerenciar dependências, imagens maiores e probabilidade maior de erro devido a gerenciamento errado das imagens.

Com a estrutura da aplicação pronta pra usar o Spring e rodar no Docker, podemos ir ao código.

Primeiro, precisamos ajustar a classe principal (que roda a aplicação) para configurar o Spring Boot. Nas versões anteriores, eu fiz alguns códigos nelas pra mostrar as alterações no banco, aqui não vou fazer isso. Vou usar a arquitetura em camadas, separando as responsabilidades entre Repository, Service e Controller adequadamente.

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
A entidade "Product" sofre algumas alterações para incluir para podermos utilizar o Spring Boot e o Mongo, uma vez que o framework proporciona recursos para interação com o banco exigindo menos código boilerplate.

Os getters, setters, construtores etc se mantém, o que muda é a anotação @Document do mongo que define que aquela entidade representa a coleção `Product` no meu banco de dados. Além disso, o atributo `id` recebe a anotação `@Id`, responsável pela geração automática do id único dentro da coleção.
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
A classe `ProductRepository` também sofre alteração e fica bem mais simplificada, considerando o propósito desta aplicação. Aqui estou transformando em uma interface que extende a interface MongoRepository, que já contém os métodos necessários para interação com o banco. Mas é possível inserir alguns métodos personalizados como os exemplos abaixo. 

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

Agora a classe de `Service`, onde estão as regras de negócio da aplicação e que orquestra a interação entre repository e Controller:
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
E por último, o Controller que recebe as requisições HTTP (GET, POST, PUT, DELETE), processa e devolve as respostas.
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
Aqui usei a anotação `@RestController` do Spring, que é uma especialização de `@Controller`. 

A anotação `@Controller` é mais adequada para para um controlador MVC (Model-View-Control), que retorna views, geralmente HTML. Pra quem usa JSP, deve ser familiar isso.

A diferença é que o que optei utilizar é mais adequado para APIs RESTful. Combina o `@Controller` e `@ResponseBody`, permitindo retornar dados diretamente no corpo da resposta, geralmente em JSON, mas pode ser em XML também.

Outro ponto foi que utilizei a anotação `@Autowired` para injeção de dependências. Ela vai fornecer automaticamente uma instância da classe que preciso, neste caso é `ProductService`.

As principais vantagens de usar essa anotação é a redução de acoplamento, uma vez que você pode fazer alteração no service sem mexer no controller, e facilidade para testar e criar mocks.

E é isso, galera. A intenção era fazer só mais uma postagem mostrando os dois casos de uso (Mongo e PostgreSQL), mas pra não ficar muito extenso. Vou encerrar por aqui. Depois trago o caso de uso com o postgres. Vai ser mais curto, uma vez que já passamos pelo conceito e uso do Docker e docker compose.

Abraço!