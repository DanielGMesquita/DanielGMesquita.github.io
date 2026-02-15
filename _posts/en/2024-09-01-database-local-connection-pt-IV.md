---
layout: post
title: Connecting local databases - Part IV
date: 2024-09-05 17:00 -0300
categories: [Programming, Database]
tags: [programming, mongodb, database, nosql]
lang: en
---

Today I'm going to finish the content about MongoDB with Java running locally. The heavy part of installation and configuration is done. Now it's just configuring the entities, creating the necessary methods and getting it running. So without too much stalling, let's get to the code.

Since I'm using an approach without a framework, the code ends up being a bit more tedious to write, but here the objective isn't Spring content, we'll see things like that in the future. Here's the class that interacts with the database.

In it, I declare the MongoCollection attribute which is the interface of the mongo API that orchestrates collections. It's a collection of Documents, that's why `<Document>`. I call the class constructor which makes the connection to the database in `DB.getConnection()` and then define the collection we'll use according to the `COLLECTION_NAME` variable.

The methods are very similar in approach, they interact with the database creating, reading, editing and deleting values.

```java
import static com.mongodb.client.model.Filters.eq;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.util.ArrayList;
import java.util.List;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.danielmesquita.dbconfig.DB;
import org.danielmesquita.entities.Product;

public class ProductRepository {
  private final MongoCollection<Document> collection;
  private static final String COLLECTION_NAME = "products";
  public static final String NAME_FIELD = "name";
  public static final String PRICE_FIELD = "price";
  public static final String DESCRIPTION_FIELD = "description";
  public static final String IMAGE_URI_FIELD = "imageUri";
  public static final String ID_FIELD = "_id";

  public ProductRepository() {
    MongoDatabase database = DB.getConnection();
    this.collection = database.getCollection(COLLECTION_NAME);
  }

  public void insertProduct(Product product) {
    Document document =
        new Document(NAME_FIELD, product.getName())
            .append(PRICE_FIELD, product.getPrice())
            .append(DESCRIPTION_FIELD, product.getDescription())
            .append(IMAGE_URI_FIELD, product.getImageUri());
    collection.insertOne(document);
  }

  public Product findProductById(String id) {
    ObjectId objectId = new ObjectId(id);
    Document document = collection.find(eq(ID_FIELD, objectId)).first();
    if (document != null) {
      return new Product(
          document.getObjectId(ID_FIELD).toString(),
          document.getString(NAME_FIELD),
          document.getDouble(PRICE_FIELD),
          document.getString(DESCRIPTION_FIELD),
          document.getString(IMAGE_URI_FIELD));
    }
    return null;
  }

  public List<Product> findAllProducts() {
    List<Product> products = new ArrayList<>();
    for (Document doc : collection.find()) {
      products.add(
          new Product(
              doc.getObjectId(ID_FIELD).toString(),
              doc.getString(NAME_FIELD),
              doc.getDouble(PRICE_FIELD),
              doc.getString(DESCRIPTION_FIELD),
              doc.getString(IMAGE_URI_FIELD)));
    }
    return products;
  }

  public void updateProduct(Product product) {
    Document updatedDoc =
        new Document(NAME_FIELD, product.getName())
            .append(PRICE_FIELD, product.getPrice())
            .append(DESCRIPTION_FIELD, product.getDescription())
            .append(IMAGE_URI_FIELD, product.getImageUri());

    collection.updateOne(eq(ID_FIELD, product.getId()), new Document("$set", updatedDoc));
  }

  public void deleteProduct(String id) {
    collection.deleteOne(eq(ID_FIELD, id));
  }
}
```

Finally, we can see the application with these methods in action.

```java
import org.danielmesquita.dbconfig.DB;
import org.danielmesquita.entities.Product;
import org.danielmesquita.repository.ProductRepository;

public class Application {
  public static void main(String[] args) {
    ProductRepository repository = new ProductRepository();

    Product product = new Product(null, "Celular", 3000.00, "Iphone 13", "iphone.jpg");
    repository.insertProduct(product);
    System.out.println("Product inserted successfully");

    Product foundProduct = repository.findProductById("66d902926170417768c84cfd");
    System.out.println("Product found: " + foundProduct.getName());

    foundProduct.setPrice(2300.00);
    repository.updateProduct(foundProduct);
    System.out.println("Product price updated to: " + foundProduct.getPrice());

    repository.deleteProduct(foundProduct.getId());
    System.out.println("Product deleted");

    DB.closeConnection();
  }
}
```

Here we activate the main database editing methods in a CRUD model (create, read, update, delete). And that's it. We delivered an application that can serve as a local base for you to keep improving to create more refined things.

Here are the GitHub repositories with the code from this post series.
[Java with PostgreSQL](https://github.com/DanielGMesquita/delivery-manager)
[Java with MongoDB](https://github.com/DanielGMesquita/delivery-manager-nosql)

I thought about ending this series here. But I think there are important things to explore that I'll address maybe in 1 or 2 more posts:
- MongoDB running in Docker instead of installed, it's much simpler (and what Docker is);
- SQL and NoSQL with Java and Springboot, to show the difference in interaction with a database.

Cheers!
