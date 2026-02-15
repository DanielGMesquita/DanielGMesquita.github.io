````---
layout: post
title: Connecting local databases - Part II
date: 2024-09-02 06:10 -0300
categories: [Programming, Database]
tags: [programming, postgres, database, sql]
lang: en
---
Now that it's been possible to connect the postgres database using JDBC*, we can move forward and create the methods that will interact with the database. If you haven't seen the [first part](https://danielmesquita.dev.br/posts/database-local-connection-pt-I/), it's essential that you do.

First, we need to populate the tables with some data. This won't be done by magic, we'll use SQL queries. In part I, we created the product table. Now let's create an order table and then include data in it. Going through pgAdmin, using the Queries Tool, we can include something like:
```sql
INSERT INTO tb_product (name, price, image_Uri, description) VALUES 
('Smartphone Samsung Galaxy', 1200.0, 'https://teste.com/images/1.png', 'Samsung smartphone with Android OS and 5G access'),
('Notebook Lenovo', 2500.0, 'https://teste.com/images/2.png', 'Notebook 16GB RAM, Intel i5'),
('Earbuds Xiaomi', 400.0, 'https://teste.com/images/3.png', 'In-ear headphone');
```
Done, now we have a table with data that we can explore.

Returning now to our application, we have to create the entity that will relate to the table we created:

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

With the entity created and the database populated and connected, now we can play with the data. You can pass all the SQL queries we'll use to a separate class for organization criteria:

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

And finally, we have the methods that will interact with our database:
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

And now in the main method you can test your postgres database. If you want to improve, you can separate the methods into their responsibilities in specific packages and classes to refine.
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
    productToUpdate.setId(1L);  // Assuming you want to update the product with ID 1
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

This is an example of a simple CRUD using a configured SQL database using postgres and pgAdmin to execute the necessary queries and view the tables. Using Spring would be much simpler due to the features the framework provides, but that's not the focus of this content. Here it's more to show how to use the databases in the local environment.

Soon I'll bring here the MongoDB configuration which is a NoSQL database and how to use Java to manipulate the data.

Cheers!

___

*JDBC (Java Database Connectivity) is a Java API (Application Programming Interface) that allows Java applications to connect to databases, send SQL queries and manipulate data stored in them. Basically, JDBC acts as a bridge between Java code and the database, allowing you to execute operations such as inserting, updating, deleting and querying data.

Main JDBC Components

    JDBC Driver: A JDBC driver is a specific implementation of the JDBC API for a particular database (such as PostgreSQL, MySQL, Oracle, etc.). It translates JDBC calls into specific database commands.

    Connection: Represents a connection to a database. You use the Connection to interact with the database, open transactions and create Statements or PreparedStatements.

    Statement and PreparedStatement: Objects used to execute SQL queries. Statement is used for simple queries, while PreparedStatement allows parameterized queries, which is safer against SQL injections.

    ResultSet: A result set from an SQL query, returning data from the database in table form. The ResultSet is iterated to access the data row by row.

    SQLException: Exceptions thrown when errors occur during interaction with the database.

How JDBC Works

    Load the JDBC Driver: Load the driver class for the database you want to use.

    Establish a Connection: Use DriverManager to establish a connection to the database, providing the database URL, username and password.

    Execute Queries: Use Statement or PreparedStatement objects to execute SQL statements on the database.

    Process Results: If the query returns data, you process the results using ResultSet.

    Close the Connection: After completing operations, the database connection must be closed to free resources.
````
