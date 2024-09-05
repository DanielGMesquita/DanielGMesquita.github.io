---
layout: post
title: Conectando bancos de dados locais - Parte IV
date: 2024-09-05 17:00 -0300
categories: [Programação, Banco de dados]
tags: [programação, mongodb, banco de dados, nosql]  
---

Hoje vou finalizar o conteúdo sobre MongoDB com Java rodando local. A parte grossa de instalação e configuração já foi. Agora é só configurar as entidades, criar os métodos necessários e botar pra rodar. Então sem enrolação demais, vamos para o código.

Como estou usando uma abordagem sem framework, o código acaba ficando um pouco mais chato mesmo de escrever, mas aqui o objetivo não é conteúdo de Spring, veremos coisas assim no futuro. Aqui vai a classe interage com o banco de dados.

Nela eu declaro o atributo MongoCollection que é a interface da API do mongo que orquestra coleções. É uma collection de Document, por isso o `<Document>`. Chamo o construtor da classe que faz a conexão com o banco em `DB.getConnection()` e depois defino a coleção que vamos usar de acordo com a variável `COLLECTION_NAME`.

Os métodos são bem semelhantes na abordagem, interagem com o banco criando, lendo, editando e deletando valores.

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

Por fim, podemos ver a aplicação com esses métodos em atividade.

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

Aqui ativamos os métodos principais de edição do banco em um modelo CRUD (create, read, update, delete). E fim. Entregamos uma aplicação que pode servir de base local pra você ir aprimorando para criar coisas mais refinadas.

Aqui estão os repositórios do Github com os códigos dessa série de postagem.
[Java com PostgreSQL](https://github.com/DanielGMesquita/delivery-manager)
[Java com MongoDB](https://github.com/DanielGMesquita/delivery-manager-nosql)

Eu pensei em encerrar esta série aqui. Mas acho que tem coisas importantes a explorar que vou tratar talvez em mais 1 ou 2 posts:
- MongoDB rodando no Docker ao invés de instalado, é bem mais simples (e o que é Docker);
- SQL e NoSQL com Java e Springboot, para mostrar a diferença de interação com um banco de dados.

Abraço!