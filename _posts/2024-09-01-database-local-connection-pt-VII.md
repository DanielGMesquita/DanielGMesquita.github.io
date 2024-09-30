---
layout: post
title: Conectando bancos de dados locais - Parte VII
date: 2024-09-29 23:00 -0300
categories: [Programação, Banco de dados, Docker]
tags: [programação, postegres, banco de dados, sql, docker, container]  
---

No post anterior, falamos do docker compose com o MongoDB e uma aplicação Spring Boot. Hoje vou finalizar esta série (amém!) com a configuração do PostgreSQL.

### Configurações necessárias
Vou pular a configuração do Dockerfile porque pouco muda, só o nome da aplicação no target.

Agora vou para o `docker-compose.yml`, o próprio `pom.xml` da aplicação e o `application.properties`.

`docker-compose.yml`:
```yml
version: '3.9'

services:
  postgres_application:
    container_name: postgres_application
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: orderdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"

  delivery_management_api:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - postgres_application
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres_application:5432/orderdb
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=admin

volumes:
  postgres_data:

networks:
  app-network:
```
- Versão: Especifica a versão da sintaxe do Docker Compose que você está utilizando. A versão 3.9 é uma das versões mais recentes, oferecendo suporte a muitos recursos, como redes e volumes.
- Services: Esta seção define os contêineres que serão executados. Cada contêiner é uma instância de um serviço.

Serviço postgres_application:
- image: Especifica a imagem do Docker a ser utilizada.

- ports: Mapeia as portas do contêiner para as portas da máquina host. "5432:5432" significa que a porta 5432 do contêiner (padrão do postgres) será acessível na porta 5432 do host. Isso permite que você acesse o postgres de fora do contêiner, por exemplo, utilizando um cliente postgres.

- volumes: Mapeia um volume do Docker, o que permite a persistência de dados. postgres_data:/var/lib/postgresql/data indica que o volume chamado postegres_data será utilizado para armazenar os dados do MongoDB no diretório /var/lib/postgresql/data dentro do container. Isso significa que, mesmo que o container seja destruído, os dados persistem no volume.

- environment: define as configurações de acesso ao banco de dados com usuário e senha e o nome do banco que será criado/utilizado

Serviço da Aplicação:
- delivery_management_api: Nome do serviço para a sua aplicação.

- build: Indica que o contêiner deve ser construído a partir do Dockerfile localizado no diretório atual (.). O Dockerfile deve estar no mesmo diretório onde o docker-compose.yml está localizado.

- ports: Similar ao serviço do postgres, "8080:8080" mapeia a porta 8080 do contêiner para a porta 8080 do host. Isso permite que você acesse sua aplicação pela URL http://localhost:8080.

- depends_on: Especifica que o serviço delivery_management_api depende do serviço postgres. Isso garante que o postgres seja iniciado antes da aplicação. No entanto, isso não garante que o postgres esteja totalmente pronto para aceitar conexões quando a aplicação iniciar.

- environment: Define variáveis de ambiente para o container. Essas variáveis são passadas para o ambiente da aplicação e podem ser utilizadas para configuração.

- SPRING_DATASOURCE_URL: é utilizada para configurar a conexão da aplicação Spring com um banco de dados PostgreSQL.

Vou explicar o item acima:
 - jdbc: Java Database Connectivity (JDBC)
 é uma API do Java que permite interações com diferentes bancos de dados;
 - postgresql: o tipo de banco de dados utilizado;
 - `//`: separador que indica o início da parte que contém as informações sobre o host e a porta;
 - o restante das informações contidas na string dessa URL são: a porta utilizada pelo postgres, o nome do serviço e o nome do banco de dados.

Volumes e redes:
- Volumes: Define os volumes utilizados pelos serviços. Aqui, postgres_data é um volume que será usado pelo serviço postgres para persistir dados. Ao criar um volume nomeado, você pode gerenciá-lo facilmente e ele persistirá mesmo se os contêineres forem removidos.

- Networks (opcional): Esta seção é opcional e permite que você defina redes personalizadas para conectar os serviços. Se você definir uma rede aqui, os serviços podem se comunicar entre si usando seus nomes. No seu exemplo, não há nenhuma rede definida.

O `pom.xml` da aplicação precisa estar adequado pra proporcionar estrutura pra rodar da maneira que definimos.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.danielmesquita</groupId>
    <artifactId>delivery-management-api</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.boot.version>3.3.3</spring.boot.version>
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
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>javax.validation</groupId>
            <artifactId>validation-api</artifactId>
            <version>2.0.1.Final</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
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
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <compilerArgs>
                        <arg>-parameters</arg>
                    </compilerArgs>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

Mantive basicamente a mesma estrutura do pom.xml anterior. Mas neste eu precisei mudar a dependência do banco de dados e também incluir a dependência `spring-boot-starter-data-jpa`, que inclui o Hibernate e outras utilitários da JPA (Java Persistence API), que são necessárias para persistência de dados das entidades Java no PostgreSQL. Com Hibernate e JPA, podemos interagir com o banco PostgreSQL sem precisar escrever consultas SQL manuais.

O Hibernate é um framework ORM (Object-Relational Mapping) que o Spring Boot usa para interagir com banco de dados. Com ele você pode trabalhar com objetos Java, enquanto ele mapeia os objetos para as tabelas do banco de dados, gerenciando as consultas SQL por trás dos panos.

Outra inclusão que fiz foi nos plugins do build, incluí o maven-compiler-plugin com a flag `-parameters` na configuração do compilador para poder usar alguns parâmetros nas urls das requests.

Por último na parte de configuração, o `application.properties`:
```properties
# Configuração do PostgreSQL
spring.datasource.url=jdbc:postgresql://postgres_application:5432/orderdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=admin

# Dialeto do PostgreSQL para o Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Inicialização do banco de dados
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

# Atualiza o esquema do banco de dados com base nas entidades sempre que a aplicação for iniciada
spring.jpa.hibernate.ddl-auto=update
```
Eu deixei comentado cada bloco pra ficar mais claro e facilitar o entendimento.

O arquivo `.properties` é necessário em algumas aplicações serve para configurar propriedades e comportamentos que podem ser acessados por toda a aplicação.

Feito isso, agora vamos ao código da aplicação e as interações com o banco.

Na aplicação do MongoDB eu criei só uma entidade pra critério de entendimento. Como se tratava de SQL, e no SQL temos alguns relacionamentos entre tabelas muito úteis de aprender, eu dei uma incrementada, tendo 3 entidades: `Product`, `Order`, `Category`.

É basicamente uma estrutura onde teremos produtos, que estão em determinada categoria e que podem ser incluídos em pedidos.

### Entidades e suas características
Agora vou compartilhar as entidades.

`Product`:
```java
@Entity
@Table(name = "products")
@Data
@Builder
@ToString(exclude = "orders")
@EqualsAndHashCode(exclude = "orders")
@NoArgsConstructor
@AllArgsConstructor
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "product_id")
  private Long id;

  @Column(name = "product_name")
  private String name;

  @Column(name = "product_price")
  private Double price;

  @ManyToOne
  @JoinColumn(name = "category_id", nullable = false)
  @JsonBackReference
  private Category category;

  @ManyToMany
  @JoinTable(
      name = "item_order",
      joinColumns = @JoinColumn(name = "product_id"),
      inverseJoinColumns = @JoinColumn(name = "order_id"))
  @JsonIgnore
  Set<Order> orders;
}
```

`Category`
```java
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "category")
@Data
@Builder
@ToString(exclude = "products")
@EqualsAndHashCode(exclude = "products")
@NoArgsConstructor
@AllArgsConstructor
public class Category {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "category_id")
  private Long id;

  @Column(name = "category_name", nullable = false)
  private String categoryName;

  @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
  @JsonManagedReference
  private List<Product> products;
}
```

`Order`
```java
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "orders")
@Data
@Builder
@ToString(exclude = "products")
@EqualsAndHashCode(exclude = "products")
@NoArgsConstructor
@AllArgsConstructor
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "order_id")
  private Long id;

  @Column(name = "order_date")
  private LocalDateTime orderDate;

  @ManyToMany List<Product> products;
}
```

Você viu que é cheio de annotations nessas entidades. Aqui temos algumas anotações referentes a JPA e também ao Lombok. Como nas últimas postagens, eu mostrei todos os métodos de manipulação e leitura para uma entidade, aqui vou usar a biblioteca Lombok para reduzir código repetitivo. Vou explicar cada anotação:

- `@Entity`: Indica que a classe é uma entidade JPA (Java Persistence API) que representa uma tabela no banco de dados.

- `@Table(name = "category")`: Especifica o nome da tabela no banco de dados que essa entidade representa.

- `@Data`: Uma anotação do Lombok que gera automaticamente métodos getter, setter, toString, equals, e hashCode para a classe.

- `@Builder`: Permite o uso do padrão de projeto Builder para criar instâncias da entidade de maneira mais legível.

- `@ToString(exclude = "products")`: Gera o método toString, mas exclui o atributo products para evitar um loop infinito devido ao relacionamento bidirecional.

- `@EqualsAndHashCode`(exclude = "products"): Gera os métodos equals e hashCode, mas exclui o atributo products para evitar problemas de comparação circular.

- `@NoArgsConstructor`: Gera um construtor sem argumentos. Necessário para o JPA criar instâncias da classe.

- `@AllArgsConstructor`: Gera um construtor que aceita todos os campos da classe como parâmetros.

- `@Id`: Indica que o campo id é a chave primária da entidade. Diferente do MongoDB, este compo não pode ser uma String.

- `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Especifica que o valor da chave primária será gerado pelo banco de dados (normalmente em uma coluna de auto-incremento).

- `@Column(name = "category_id")`: Mapeia o campo id para a coluna category_id na tabela. Vale também para as outras entidades.

- `@Column(name = "category_name", nullable = false)`: Mapeia o campo categoryName para a coluna category_name, indicando que não pode ser nulo.

- `@OneToMany(mappedBy = "category")`: Define um relacionamento um-para-muitos com a entidade Product. O atributo mappedBy indica que o lado "muitos" (ou seja, Product) possui a chave estrangeira.

- `@ManyToMany`: Define um relacionamento muitos-para-muitos com outra entidade. No caso desta aplicação, significa que um pedido pode conter muitos produtos e um produto pode estar em muitas ordens.

- `@ManyToOne`: Define um relacionamento muitos-para-um com outra entidade. Nosso caso, significa que muitos produtos podem pertencer a uma única categoria.

- `@JsonManagedReference`: Utilizada em relacionamentos bidirecionais, indica que este é o lado "gerenciado" da referência. No momento da serialização JSON, o lado "gerenciado" é incluído, enquanto o lado "back" (referido na outra entidade) será ignorado, neste caso, na entidade Product.

- `@JsonBackReference`: Usada em um relacionamento bidirecional, indica que este é o lado "back" da referência. Durante a serialização JSON, o lado "back" será ignorado, evitando loops infinitos.

- `@JoinColumn(name = "category_id", nullable = false)`: Especifica a coluna que armazena a chave estrangeira (no caso, category_id é a chave estrangeira referente a tabela de produtos).

- `@JoinTable(...)`: Especifica a tabela de junção que relaciona os produtos aos pedidos. O joinColumns define a chave estrangeira da entidade Product, enquanto inverseJoinColumns define a chave estrangeira da entidade Order.

- `@JsonIgnore`: Indica que este campo não deve ser incluído na serialização JSON. É útil para evitar a inclusão de dados que não são necessários ou podem causar loops infinitos na serialização.

#### Resumo dos Relacionamentos

ORM (Object Relational Mapper) é uma técnica de mapeamento objeto-relacional que aproxima o desenvolvimento de aplicações orientadas a objetos do paradigma de bancos de dados relacionais (SQL). Geralmente você pode ver esses relacionamentos representados por um diagrama utilizando UML como o item abaixo:

![alt text](assets/img/posts/uml.png)

- Category para Product: Relacionamento um-para-muitos. Uma categoria pode ter muitos produtos, mas um produto só pode pertencer a uma categoria.

- Order para Product: Relacionamento muitos-para-muitos. Uma ordem pode conter muitos produtos, e um produto pode ser parte de muitas ordens.

- Product para Category: Relacionamento muitos-para-um. Muitos produtos podem pertencer a uma única categoria.

- Product para Order: Relacionamento muitos-para-muitos. Muitos produtos podem estar associados a muitas ordens.

### Repository
Não temos muitas diferenças consideráveis nos repositories desta aplicação em relação a do Mongo. A principal diferenção é que ao invés de extender `MongoRepository`, vai extender `JpaRepository`, conforme exemplo abaixo:
```java
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
  Optional<Category> findByCategoryName(String categoryName);
}
```

No repository acima, referente a entidade Category, estou extendendo JpaRepository para Category e Long (referente a chave primária do item). Além disso, estou inserido um método personalizado para buscar a categoria pelo nome. Os demais repositories seguem a mesma estrutura.

### Service
O service também não tem muita mudança relevante em relação ao caso utilizado na aplicação usando NoSQL porque a regra de negócios não mudou.
```java
import java.util.List;
import java.util.Optional;
import org.danielmesquita.entities.Category;
import org.danielmesquita.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
  @Autowired CategoryRepository categoryRepository;

  public List<Category> findAllCategories() {
    return categoryRepository.findAll();
  }

  public Optional<Category> findCategoryById(Long id) {
    return categoryRepository.findById(id);
  }

  public Optional<Category> findCategoryByName(String categoryName) {
    return categoryRepository.findByCategoryName(categoryName);
  }

  public void insertCategory(Category category) {
    categoryRepository.save(category);
  }

  public void deleteCategoryById(Long id) {
    categoryRepository.deleteById(id);
  }
}
```
Um ponto que vale ressaltar é que utilizamos o Optional para evitar NullPointerException caso o item não conste no banco de dados.

### Controller
Nesta parte, temos algumas diferenças em relação a aplicação NoSQL apenas para podermos explorar melhor o relacionamento entre as entidades. Abaixo vou mostrar como ficou cada um.

`ProductController`
```java
import java.util.List;
import java.util.Optional;
import org.danielmesquita.dto.ProductDTO;
import org.danielmesquita.entities.Category;
import org.danielmesquita.entities.Product;
import org.danielmesquita.service.CategoryService;
import org.danielmesquita.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/products")
public class ProductController {

  @Autowired private ProductService productService;
  @Autowired private CategoryService categoryService;

  @PostMapping
  public ResponseEntity<Product> createProduct(@RequestBody ProductDTO productDTO) {
    Category category =
        categoryService
            .findCategoryByName(productDTO.getCategory())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

    Product product =
        Product.builder()
            .name(productDTO.getName())
            .price(productDTO.getPrice())
            .category(category)
            .build();

    productService.insertProduct(product);

    return new ResponseEntity<>(product, HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<Product>> getAllProducts() {
    List<Product> products = productService.findAllProducts();
    return new ResponseEntity<>(products, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    Optional<Product> product = productService.findProductById(id);
    return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}")
  public ResponseEntity<Product> updateProduct(
      @PathVariable Long id, @RequestBody Product product) {
    product.setId(id);
    productService.updateProduct(product);
    return new ResponseEntity<>(product, HttpStatus.OK);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
    productService.deleteProduct(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
```

`CategoryController`
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.danielmesquita.dto.CategoryDTO;
import org.danielmesquita.entities.Category;
import org.danielmesquita.entities.Product;
import org.danielmesquita.service.CategoryService;
import org.danielmesquita.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/categories")
public class CategoryController {

  @Autowired private CategoryService categoryService;
  @Autowired private ProductService productService;

  @PostMapping
  public ResponseEntity<Category> createCategory(@RequestBody CategoryDTO categoryDTO) {
    List<Product> products = populateProductList(categoryDTO);

    Category category =
        Category.builder()
            .categoryName(categoryDTO.getName())
            .products(setProductsListToBuild(products))
            .build();

    categoryService.insertCategory(category);

    return new ResponseEntity<>(category, HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<Category>> getAllCategories() {
    List<Category> categories = categoryService.findAllCategories();
    return new ResponseEntity<>(categories, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
    Optional<Category> category = categoryService.findCategoryById(id);
    return category.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}")
  public ResponseEntity<Category> updateCategory(
      @PathVariable Long id, @RequestBody Category categoryDetails) {
    Optional<Category> category = categoryService.findCategoryById(id);
    if (category.isPresent()) {
      Category existingCategory = category.get();
      existingCategory.setCategoryName(categoryDetails.getCategoryName());
      categoryService.insertCategory(existingCategory);
      return new ResponseEntity<>(existingCategory, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
    categoryService.deleteCategoryById(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }

  public List<Product> populateProductList(CategoryDTO categoryDTO) {
    List<Product> products = new ArrayList<>();

    if (categoryDTO.getProductIdList() != null && !categoryDTO.getProductIdList().isEmpty()) {
      for (Long productId : categoryDTO.getProductIdList()) {
        Product product =
            productService
                .findProductById(productId)
                .orElseThrow(
                    () ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product with ID " + productId + " not found"));
        products.add(product);
      }
    }

    return products;
  }

  public List<Product> setProductsListToBuild(List<Product> products) {
    if (products.isEmpty()) {
      return null;
    }

    return products;
  }
}
```

`OrderController`
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.danielmesquita.dto.OrderDTO;
import org.danielmesquita.entities.Order;
import org.danielmesquita.entities.Product;
import org.danielmesquita.service.OrderService;
import org.danielmesquita.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/orders")
public class OrderController {

  @Autowired private OrderService orderService;
  @Autowired private ProductService productService;

  @PostMapping
  public ResponseEntity<Order> createNewOrder(@RequestBody OrderDTO orderDTO) {
    if (orderDTO.getProductIdList() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product list cannot be empty");
    }

    List<Product> products = populateProductList(orderDTO);

    Order order = Order.builder().orderDate(orderDTO.getDate()).products(products).build();

    orderService.insertOrder(order);

    return new ResponseEntity<>(order, HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<Order>> getAllOrders() {
    List<Order> orders = orderService.findAllOrders();
    return new ResponseEntity<>(orders, HttpStatus.OK);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Order> updateOrder(
      @PathVariable Long id, @RequestBody OrderDTO orderDetails) {
    Optional<Order> order = orderService.findOrderById(id);
    if (order.isPresent()) {
      Order existingOrder = order.get();
      existingOrder.setOrderDate(orderDetails.getDate());

      List<Product> products = populateProductList(orderDetails);
      existingOrder.setProducts(products);

      orderService.insertOrder(existingOrder);
      return new ResponseEntity<>(existingOrder, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
    orderService.deleteOrderById(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }

  public List<Product> populateProductList(OrderDTO orderDTO) {
    List<Product> products = new ArrayList<>();

    if (!orderDTO.getProductIdList().isEmpty()) {
      for (Long productId : orderDTO.getProductIdList()) {
        Product product =
            productService
                .findProductById(productId)
                .orElseThrow(
                    () ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product with ID " + productId + " not found"));
        products.add(product);
      }
    }

    return products;
  }
}
```
As anotações referentes ao Spring Boot para o controlador se mantém, se tiver dúvidas, consulte na [postagem anterior](https://danielmesquita.dev.br/posts/database-local-connection-pt-VI/). O principal ponto é que aqui eu incluí DTOs (data transfer objects) para otimizar as requisições, evitando que seja necessário incluir todas as informações de todos os objetos que as entidades formam. Além disso, esses DTOs facilitam construir o relacionamento entre as entidades utilizando apenas os dados necessários.

Uma boa prática de programação neste caso seria remover as manipulações de dados, principalmente a de outras entidades, dos controllers e mandar para os services. As classes de service que devem conter as regras de negócio, então se uma categoria vai incluir produtos ou não, como as interações entre os dados de uma entidade e outra serão feitas, devem ir pra lá. Deixei aqui mais pra mostrar a ideia de como funciona.

No repositório do GitHub desta aplicação, já vou deixar como eu refatoraria esse código que mostrei aqui.

Depois disso é só mandar um `docker-compose down -v` pra derrubar o container e apagar todos os dados persistidos no banco de dados pra começar do zero (caso não queira apagar os dados, só remover o `-v` do comando), depois `mvn clean install` pra instalar tudo que precisa e manda um `docker-compose up --build` e pode brincar com sua aplicação fazendo requisições HTTP via linha de comando ou usando alguma ferramenta feito o postman.

É isso, essa aqui foi uma postagem mais densa porque tem alguns conceitos importantes de JPA e SQL que precisavam ser refinados e eu não ia fazer uma nova pra quebrar a linha de raciocínio. Vou deixar aqui embaixo os links dos repositórios no GitHub das aplicações que construí nessa série pra quem tiver interesse em olhar o código, se quiser clonar, melhorar, abrir issue...

[Aplicação Java com MongoDB rodando local](https://github.com/DanielGMesquita/delivery-manager-nosql)
[Aplicação Java com PostgreSQL rodando local](https://github.com/DanielGMesquita/delivery-manager)
[Aplicação Spring Boot com MongoDB rodando via docker compose](https://github.com/DanielGMesquita/delivery-manager-nosql-docker)
[Aplicação Spring Boot com PostgreSQL rodando via docker compose](https://github.com/DanielGMesquita/delivery_manager_sql_docker)

Espero que quem leia essas postagens (se alguém ler) faça um bom proveito. Pra mim foi muito bom para aprender, testar e praticar algumas coisas.

Abraço!