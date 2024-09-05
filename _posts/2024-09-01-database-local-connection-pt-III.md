---
layout: post
title: Conectando bancos de dados locais - Parte III
date: 2024-09-04 23:00 -0300
categories: [Programação, Banco de dados]
tags: [programação, mongodb, banco de dados, nosql]  
---
Já falamos sobre como configurar localmente o banco sql postgres e como conectar uma aplicação Java a ele. Caso não tenha visto: [primeira parte](https://danielmesquita.dev.br/posts/database-local-connection-pt-I/) e [segunda parte](https://danielmesquita.dev.br/posts/database-local-connection-pt-II/), se for do seu interesse.

Hoje vou falar de como configurar um banco NoSQL localmente, para isso vou utilizar o MongoDB Community Edition. Eu ia colocar no post como instalar, mas lendo a documentação, acho que ela está bem auto-explicativa. Inclusive enfrentei problemas pra instalar no Ubuntu e resolvi usando a própria documentação. Seguem abaixo os links:

[Link para baixar](https://www.mongodb.com/try/download/community)

[Instalaçao no Linux](https://www.mongodb.com/docs/manual/administration/install-on-linux/)
[Troubleshoot Ubuntu Installation](https://www.mongodb.com/docs/manual/reference/installation-ubuntu-community-troubleshooting/).

[Instalação no Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)

[Instalação no Mac](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)

Depois, é importante instalar o [Mongo Compass](https://www.mongodb.com/try/download/compass), que fornece uma GUI para manusear as coleções na sua máquina. Ele tem essa carinha aqui:
![Mongo Compass](assets/img/posts/mongo_compass.png)

O banco NoSQL é um pouco mais amigável que um SQL pra você lidar com ele. Se você acessar um postgres ou um dbeaver da vida, é bem mais complexo, porque tem uma série de relações e particularidades do SQL que o NoSQL não tem.

Ele vem por padrão na porta 27017. Só mude se fizer questão. Uma vez conectado, ele vem assim:
![Mongo Compass conectado](assets/img/posts/mongo_compass_connected.png)

Aqui você pode criar seus bancos de dados e coleções que pode necessitar na sua aplicação. Mas não vamos criar schemas ou objetos por aqui. Vamos fazer via aplicação Java.

Primeiro, no pom.xml você vai precisar das seguintes dependências:
```xml
    <dependencies>
        <dependency>
            <groupId>org.mongodb</groupId>
            <artifactId>mongodb-driver-sync</artifactId>
            <version>5.1.1</version>
        </dependency>
        <dependency>
            <groupId>javax.validation</groupId>
            <artifactId>validation-api</artifactId>
            <version>2.0.1.Final</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.9</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.9</version>
        </dependency>
    </dependencies>
```
Depois, assim como para o postgres, precisamos de um arquivo .properties para definir algumas propriedades do banco de dados:
```properties
mongodb.uri=mongodb://localhost:27017
mongodb.database=delivery-manager
```
Com isso no ponto importante mandar um `mvn clean install` pra instalar as dependências e podermos seguir.

Agora vamos montar a conexão com o banco. Vamos seguir um padrão semelhante da configuração do postgres, criando uma classe específica para gerenciar a conexão com o MongoDB.

No código abaixo eu utilizo o API do MongoDB para o Java (`mongo-java-driver`) carregando as configurações do banco a partir do arquivo db.properties.

Eu declaro um atributo estático MongoClient que é uma interface da API do MongoDB para conectar com o banco de dados.

Depois crio o método `getConnection()`, responsável por retornar uma conexão ativa com o Mongo. Primeiro ele carrega as definições do banco do arquivo db.properties chamando o método `loadProperties()`. Depois ele verifica se mongoClient é `null`, ou seja, se tem alguma conexão ativa com o banco de dados, se não tiver, ele abre uma nova conexão utilizando o uri do banco local. Por último, ele obtém o nome do banco a partir das properties e retorna a instância de `MongoDatabase` correspondente ao nosso banco.

Além disso crio o método `closeConnection()`, necessário para encerrar a conexão com o banco.

E também o método `loadProperties()`, que carrega as informações do arquivo `db.properties`.

```java
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class DB {
  private static MongoClient mongoClient;

  public static MongoDatabase getConnection() {
    Properties props = loadProperties();
    if (mongoClient == null) {
      String uri = props.getProperty("mongodb.uri");
      mongoClient = MongoClients.create(uri);
    }

    String databaseName = props.getProperty("mongodb.database");
    return mongoClient.getDatabase(databaseName);
  }

  public static void closeConnection() {
    if (mongoClient != null) {
      mongoClient.close();
    }
  }

  private static Properties loadProperties() {
    try (FileInputStream fs = new FileInputStream("src/main/resources/db.properties")) {
      Properties props = new Properties();
      props.load(fs);
      return props;
    } catch (IOException e) {
      throw new DbException(e.getMessage());
    }
  }
}
```
A parte de configuração do MongoDB é relativamente mais fácil que a do PostgreSQL.

Depois, vamos criar a nossa entidade `Product` com o schema que vai ser utilizado na collection.
```java
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class Product {
  private String id;

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

Eu incluí o método validateId caso precise verificar se aquele id daquele objeto é válido para inserir no banco só por precaução.

Bom, o tempo foi corrido, já finalizei o código todo, mas ainda não tive tempo de produzir uma explicação adequada. Vou encerrar essa postagem por aqui para que possa dar tempo de ver a instalação e caso tenha alguma dúvida, só me procurar.

Abraço!