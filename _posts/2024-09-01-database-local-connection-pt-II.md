---
layout: post
title: Conectando bancos de dados locais - Parte II
date: 2024-09-02 06:10 -0300
categories: [Programação, Banco de dados]
tags: [programação, postgres, banco de dados, sql]  
---
Agora que já foi possível conectar o banco postegres usando o JDBC*, podemos seguir em frente e criar os métodos que vão interagir com o banco de dados. Caso não tenha visto a [primeira parte](https://danielmesquita.dev.br/posts/database-local-connection-pt-I/), é fundamental que veja.

Primeiro, precisamos alimentar as tabelas com algum dado. Isso não vai ser feito via mágica, vamos usar queries SQL mesmo. Na parte I, criamos a tabela product. Agora vamos criar uma tabela order e seu alter incluir dados nela. Indo pelo pgAdmin, utilizando o Queries Tool, podemos incluir algo do tipo:
```sql
INSERT INTO tb_product (name, price, image_Uri, description) VALUES 
('Smartphone Samsung Galaxy', 1200.0, 'https://teste.com/images/1.png', 'Smartphone samsung com SO Android e acesso a 5G'),
('Notebook Lenovo', 2500.0, 'https://teste.com/images/2.png', 'Notebook 16GB RAM, Intel i5'),
('Earbuds Xiaomi', 400.0, 'https://teste.com/images/3.png', 'Fone de ouvido intra auricular');
```
Feito isso, agora temos uma tabela com dados para podermos explorar.

Voltando agora para nossa aplicação, temos que criar a entidade que vai se relacionar com a tabela que criamos:

```java
package org.danielmesquita.entities;

public class Product {
  private long id;
  private String name;
  private Double price;
  private String description;
  private String imageUri;

  public Product() {}

  public Product(long id, String name, Double price, String description, String imageUri) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.imageUri = imageUri;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
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

  @Override
  public String toString() {
    return "Product{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", price=" + price +
            ", description='" + description + '\'' +
            ", imageUri='" + imageUri + '\'' +
            '}';
  }
}
```

Com a entidade criada e o banco populado e conectado, agora dá pra brincar com os dados. Você pode passar as queries SQL que vamos utilizar todas para uma classe a parte para critérios de organização:

```java
package org.danielmesquita.constants;

public class QueriesSQL {
  public static final String FIND_ALL_PRODUCTS = "SELECT * FROM products";
  public static final String INSERT_PRODUCTS =
      "INSERT INTO tb_product (name, price, image_uri, description) VALUES (?, ?, ?, ?)";
  public static final String DELETE_PRODUCT = "DELETE FROM tb_product WHERE id = ?";
  public static final String UPDATE_PRODUCT =
      "UPDATE tb_product SET name = ?, price = ?, image_uri = ?, description = ? WHERE id = ?";
}
```

E por fim, temos os métodos que irão interagir com o nosso banco de dados:
```java
  private static Product instantiateProduct(ResultSet resultSet) throws SQLException {
    Product product = new Product();
    product.setId(
        resultSet.getLong(
            "product_id")); // product_id instead of id to avoid conflict with Order id
    product.setName(resultSet.getString("name"));
    product.setPrice(resultSet.getDouble("price"));
    product.setDescription(resultSet.getString("description"));
    product.setImageUri(resultSet.getString("image_uri"));
    return product;
  }

    public void insertProduct(Product product) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement =
            connection.prepareStatement(QueriesSQL.INSERT_PRODUCTS, Statement.RETURN_GENERATED_KEYS)) {

      preparedStatement.setString(1, product.getName());
      preparedStatement.setDouble(2, product.getPrice());
      preparedStatement.setString(3, product.getDescription());
      preparedStatement.setString(4, product.getImageUri());

      int rowsAffected = preparedStatement.executeUpdate();

      if (rowsAffected > 0) {
        try (ResultSet resultSet = preparedStatement.getGeneratedKeys()) {
          if (resultSet.next()) {
            product.setId(resultSet.getLong(1)); // Set the generated ID back to the product object
          }
        }
      }
    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }

  public void deleteProductById(long id) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(QueriesSQL.DELETE_PRODUCT)) {

      preparedStatement.setLong(1, id);

      preparedStatement.executeUpdate();
    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }

  public void updateProduct(Product product) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(QueriesSQL.UPDATE_PRODUCT)) {

      preparedStatement.setString(1, product.getName());
      preparedStatement.setDouble(2, product.getPrice());
      preparedStatement.setString(3, product.getDescription());
      preparedStatement.setString(4, product.getImageUri());
      preparedStatement.setLong(5, product.getId());

      int rowsAffected = preparedStatement.executeUpdate();

      if (rowsAffected == 0) {
        throw new DbException("No product found with the given ID: " + product.getId());
      }

    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }
```

E agora no método main você pode testar o seu banco de dados postgres. Se quiser melhorar, pode separar os métodos nas suas responsabilidades em packages e classes específicas para aprimorar.
```java
package org.danielmesquita;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

import org.danielmesquita.constants.QueriesSQL;
import org.danielmesquita.dbconfig.DB;
import org.danielmesquita.dbconfig.DbException;
import org.danielmesquita.entities.Product;

public class Application {
  public static void main(String[] args) throws SQLException {
    Connection connection = DB.getConnection();

    Statement statement = connection.createStatement();

    ResultSet resultSet = statement.executeQuery(QueriesSQL.FIND_ALL_PRODUCTS);

    Map<Long, Product> productMap = new HashMap<>();

    while (resultSet.next()) {
      Long productId = resultSet.getLong("product_id");
      if (productMap.get(productId) == null) {
        Product product = instantiateProduct(resultSet);
        productMap.put(productId, product);
      }

      System.out.println("Product: " + productMap.get(productId));
    }

    Product productToUpdate = new Product();
    productToUpdate.setId(1L);  // Supondo que você quer atualizar o produto com ID 1
    productToUpdate.setName("Samsung Galaxy S21");
    productToUpdate.setPrice(2000.0);
    productToUpdate.setDescription("The best Android phone ever");
    productToUpdate.setImageUri("https://www.samsung.com/samsung-galaxy-s21.jpg");

    updateProduct(productToUpdate);

    System.out.println("Product updated: " + productToUpdate);

    Product newProduct = new Product();
    newProduct.setName("Iphone 13");
    newProduct.setPrice(3000.0);
    newProduct.setDescription("The best iPhone ever");
    newProduct.setImageUri("https://apple.com/iphone/4.png");

    insertProduct(newProduct);

    System.out.println("New product inserted: " + newProduct);

    deleteProductById(newProduct.getId());

    System.out.println("Product deleted: " + newProduct.getId());
  }

  private static Product instantiateProduct(ResultSet resultSet) throws SQLException {
    Product product = new Product();
    product.setId(
        resultSet.getLong(
            "product_id"));
    product.setName(resultSet.getString("name"));
    product.setPrice(resultSet.getDouble("price"));
    product.setDescription(resultSet.getString("description"));
    product.setImageUri(resultSet.getString("image_uri"));
    return product;
  }

  public static void insertProduct(Product product) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement =
            connection.prepareStatement(QueriesSQL.INSERT_PRODUCTS, Statement.RETURN_GENERATED_KEYS)) {

      preparedStatement.setString(1, product.getName());
      preparedStatement.setDouble(2, product.getPrice());
      preparedStatement.setString(3, product.getDescription());
      preparedStatement.setString(4, product.getImageUri());

      int rowsAffected = preparedStatement.executeUpdate();

      if (rowsAffected > 0) {
        try (ResultSet resultSet = preparedStatement.getGeneratedKeys()) {
          if (resultSet.next()) {
            product.setId(resultSet.getLong(1));
          }
        }
      }
    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }

  public static void deleteProductById(long id) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(QueriesSQL.DELETE_PRODUCT)) {

      preparedStatement.setLong(1, id);

      preparedStatement.executeUpdate();
    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }

  public static void updateProduct(Product product) {
    try (Connection connection = DB.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(QueriesSQL.UPDATE_PRODUCT)) {

      preparedStatement.setString(1, product.getName());
      preparedStatement.setDouble(2, product.getPrice());
      preparedStatement.setString(3, product.getDescription());
      preparedStatement.setString(4, product.getImageUri());
      preparedStatement.setLong(5, product.getId());

      int rowsAffected = preparedStatement.executeUpdate();

      if (rowsAffected == 0) {
        throw new DbException("No product found with the given ID: " + product.getId());
      }

    } catch (SQLException e) {
      throw new DbException(e.getMessage());
    }
  }
}
```

Esse é um exemplo de um CRUD simples utilizando um banco SQL configurado utilizando postgres e o pgAdmin para executar as queries necessárias e visualizar as tabelas. Utilizando o Spring seria muito mais simples devido as funcionalidades que o framework disponibiliza, mas não é o foco deste conteúdo. Aqui é mais pra mostrar como utilizar os bancos no ambiente local.

Em breve eu vou trazer aqui a configuração do MongoDB que é um banco NoSQL e como utilizar o Java para manipular os dados.

Abraços!

___

*JDBC (Java Database Connectivity) é uma API (Application Programming Interface) do Java que permite que aplicativos Java se conectem a bancos de dados, enviem consultas SQL e manipulem dados armazenados neles. Basicamente, o JDBC atua como uma ponte entre o código Java e o banco de dados, permitindo que você execute operações como inserir, atualizar, excluir e consultar dados.

Componentes Principais do JDBC

    Driver JDBC: Um driver JDBC é uma implementação específica da API JDBC para um banco de dados particular (como PostgreSQL, MySQL, Oracle, etc.). Ele traduz as chamadas JDBC em comandos específicos do banco de dados.

    Connection: Representa uma conexão com um banco de dados. Você usa o Connection para interagir com o banco, abrir transações e criar Statements ou PreparedStatements.

    Statement e PreparedStatement: Objetos usados para executar consultas SQL. Statement é usado para consultas simples, enquanto PreparedStatement permite consultas parametrizadas, o que é mais seguro contra injeções de SQL.

    ResultSet: Um conjunto de resultados de uma consulta SQL, retornando dados do banco de dados em forma de tabela. O ResultSet é iterado para acessar os dados linha por linha.

    SQLException: Exceções lançadas quando ocorrem erros durante a interação com o banco de dados.

Como o JDBC Funciona

    Carregar o Driver JDBC: Carregar a classe do driver para o banco de dados que você deseja usar.

    Estabelecer uma Conexão: Usar o DriverManager para estabelecer uma conexão com o banco de dados, fornecendo a URL do banco, nome de usuário e senha.

    Executar Consultas: Usar objetos Statement ou PreparedStatement para executar instruções SQL no banco de dados.

    Processar os Resultados: Se a consulta retornar dados, você processa os resultados usando o ResultSet.

    Fechar a Conexão: Após completar as operações, a conexão com o banco de dados deve ser fechada para liberar recursos.