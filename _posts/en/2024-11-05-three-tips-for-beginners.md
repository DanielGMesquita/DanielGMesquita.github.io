---
layout: post
title: Things that can help a beginner stand out
date: 2024-11-05 07:31 -0300
categories: [Career, Programming]
tags: [career, programming, junior]
lang: en
---
There are three things little discussed in courses aimed at programming beginners: tests, documentation and communication.

These things are usually neglected by those who are starting out, especially those without guidance.

Then when faced with the need to have this knowledge and skills in a professional context, they think it's something from another world.

I know because I've made this mistake. I would go out writing code, not documenting anything or testing anything and it would be chaos afterwards.

And there's no point in putting off what you'll never do.

Good documentation greatly facilitates knowledge sharing about an application, in addition to helping with implementation, debugging and maintenance, as it includes all the details necessary for code to function correctly. For documentation I use a lot of Javadoc and Swagger itself, there's not much mystery to use. Another also very useful for those who use Spring, is Spring Rest Docs.

- JavaDoc: Tool used to generate documentation from Java source code. It adds comments in the code that explain the functionality of methods, classes and packages, and can be exported to an HTML document. Usually in IDEs there are HTML generation tools for you to visualize. Usage example:

```java
/**
 * Implementation of the {@link AuthenticationService} interface that provides
 * methods for authenticating users and managing JWT tokens.
 */
@Service
public class AuthenticationServiceImpl implements AuthenticationService {

  @Autowired
  private UserRepository repository;

  /**
   * Loads a user by their username.
   *
   * @param login the username of the user to load
   * @return the details of the user
   * @throws UsernameNotFoundException if the user is not found
   */
  @Override
  public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
    return repository.findByUsername(login);
  }

  /**
   * Generates a JWT token for the given authentication request.
   *
   * @param authRequest the authentication request containing user credentials
   * @return a JWT token as a string
   */
  @Override
  public String getToken(AuthRequest authRequest) {
    User user = repository.findByUsername(authRequest.getUsername());
    return generateToken(user);
  }

  /**
   * Generates a JWT token for the specified user.
   *
   * @param user the user for whom the token is generated
   * @return a JWT token as a string
   * @throws RuntimeException if token creation fails
   */
  public String generateToken(User user) {
    try {
      Algorithm algorithm = Algorithm.HMAC256("my-secret");

      return JWT.create()
              .withIssuer("blog-api")
              .withSubject(user.getUsername())
              .withExpiresAt(getExpirationDate())
              .sign(algorithm);
    } catch (JWTCreationException exception) {
      throw new RuntimeException("Fail to generate token: " + exception.getMessage());
    }
  }

  /**
   * Validates a JWT token and returns the subject (username) if the token is valid.
   *
   * @param token the JWT token to validate
   * @return the subject (username) if the token is valid, or an empty string if not
   */
  @Override
  public String validateJwt(String token) {
    try {
      Algorithm algorithm = Algorithm.HMAC256("my-secret");

      return JWT.require(algorithm).withIssuer("blog-api").build().verify(token).getSubject();
    } catch (JWTVerificationException e) {
      return "";
    }
  }

  /**
   * Calculates the expiration date of the JWT token.
   *
   * @return the expiration date as an {@link Instant}
   */
  private Instant getExpirationDate() {
    return LocalDateTime.now().plusHours(8).toInstant(ZoneOffset.of("-03:00"));
  }
}
```

- Swagger (OpenAPI): A specification that documents RESTful APIs interactively. It allows detailed description of endpoints, parameters, responses and examples, facilitating API integration and testing. In Swagger it's recommendable to use @Operation, @ApiResponses, and @Parameter annotations in your controllers to improve documentation. In the case of Maven, you have to add the dependency in `pom.xml`. For example:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

```java
@RestController
@RequestMapping(path = "/address")
public class AddressController {
  @Autowired
  private AddressService service;

  @Operation(summary = "Save a new address", description = "Saves a new address to the database")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "Address saved successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid address details provided")
  })
  @PostMapping("/save")
  private @ResponseBody Address save(@RequestBody Address address) {
    return service.save(address);
  }

  @Operation(summary = "Get all addresses", description = "Retrieves a list of all addresses")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "Successfully retrieved the addresses")
  })
  @GetMapping(path = "/getAll")
  private @ResponseBody List<Address> getAllAddresses() {
    return service.getAll();
  }

  @Operation(summary = "Get an address", description = "Retrieves an address by its ID")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "Address retrieved successfully"),
          @ApiResponse(responseCode = "404", description = "Address not found")
  })
  @GetMapping(path = "/get")
  private @ResponseBody Optional<Address> getAddress(@RequestParam final Long id) {
    return service.get(id);
  }

  @Operation(summary = "Update an address", description = "Updates the details of an existing address")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "Address updated successfully"),
          @ApiResponse(responseCode = "404", description = "Address not found"),
          @ApiResponse(responseCode = "400", description = "Invalid address details provided")
  })
  @PutMapping(path = "/update")
  private @ResponseBody Address updateAddress(
          @RequestParam final Long id, @RequestBody Address address) {
    return service.update(id, address);
  }

  @Operation(summary = "Delete an address", description = "Deletes an address by its ID")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "204", description = "Address deleted successfully"),
          @ApiResponse(responseCode = "404", description = "Address not found")
  })
  @DeleteMapping(path = "/delete")
  private ResponseEntity<?> delete(@RequestParam final Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
```
As you can see in the image below, it's even possible to test the calls to endpoints, having access to examples of inputs and outputs of each one.
![Swagger example](assets/img/posts/swagger.png)

- Spring Rest Docs: Integrated into the Spring ecosystem, this tool generates readable and interactive documentation from written tests, exporting documentation to HTML or other formats.

The JavaDoc thing that might bother some people is the fact of leaving the code very populated with comments, but if you don't mind that, it's good. Now if you want something external to your code, Swagger can be a good way out.

For tests, you have to study the test tools of each language. But the important thing is to remember that the test doesn't just serve to validate what you believe, you have to really test the most absurd possible inputs and try to cover every kind of trouble. For starters, unit tests serve as a beautiful starting point.

Unit tests verify individual parts of code to find out if they work as expected. The goal is to ensure that each "unit" of code works correctly in isolation, without external dependencies, such as databases or APIs. The main important points in doing unit tests for me are:
- Early identification of errors, something that greatly reduces cost and correction time;
- Facilitates code refactoring, gives more confidence because with tests, we know that changes won't break the code and if they break, the test can identify this;
- Test is living and active documentation, showing how functions should behave;
- When you do tests, you end up worrying about producing more testable and modular code, which ends up helping to apply good code design practices.

In Java I usually use JUnit, which is the most popular unit test library. I also use Mockito, which is a mocking library that allows you to create simulated objects to test interactions between different parts of code. It facilitates testing parts that have external dependencies. Example of a class with unit tests:
```java
class CategoryServiceTest {

  @Mock private CategoryRepository categoryRepository;

  @InjectMocks private CategoryService categoryService;

  private List<Category> categories;

  private final Category foodCategory = TestMocks.foodCategory;

  private final Category healthCategory = TestMocks.healthCategory;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    this.categories = Arrays.asList(this.foodCategory, this.healthCategory);
  }

  @Test
  void testFindAll() {
    when(this.categoryRepository.findAll()).thenReturn(this.categories);
    List<Category> result = this.categoryService.findAll();
    assertEquals(this.categories, result);
    verify(this.categoryRepository, times(1)).findAll();
  }

  @Test
  void testFindById() {
    when(this.categoryRepository.findById(1))
        .thenReturn(java.util.Optional.ofNullable(this.foodCategory));
    Category result = this.categoryService.findById(1);
    assertEquals(this.foodCategory, result);
    verify(this.categoryRepository, times(1)).findById(1);
  }

  @Test
  void testSave() {
    when(this.categoryRepository.save(this.foodCategory)).thenReturn(this.foodCategory);
    Category result = this.categoryService.save(this.foodCategory);
    assertEquals(this.foodCategory, result);
    verify(this.categoryRepository, times(1)).save(this.foodCategory);
  }

  @Test
  void testUpdate() {
    when(this.categoryRepository.findById(1))
        .thenReturn(java.util.Optional.ofNullable(this.foodCategory));
    assert this.foodCategory != null;
    when(this.categoryRepository.save(this.foodCategory)).thenReturn(this.foodCategory);
    Category result = this.categoryService.update(1, this.foodCategory);
    assertEquals(this.foodCategory, result);
    verify(this.categoryRepository, times(1)).findById(1);
    verify(this.categoryRepository, times(1)).save(this.foodCategory);
  }

  @Test
  void testDeleteCategory() {
    when(this.categoryRepository.findById(1))
        .thenReturn(java.util.Optional.ofNullable(this.foodCategory));
    assert this.foodCategory != null;
    this.categoryService.deleteCategory(1);
    verify(this.categoryRepository, times(1)).delete(this.foodCategory);
  }
}
```

For the case of testing communication with external services, it would be integration tests. But that's for another chat, as it implies a bit more complexity. One day I intend to do a series on the blog about testing.

And to support me both in documentation and in tests I always use the help of a generative AI. In documentation it helps a lot to map the code to create the necessary comments without you having to do everything by hand. And for tests I use a lot for debugging and scenario creation, because sometimes I let pass some possibility of error or problems that may arise.

And as for communication, I feel that this for some developers, especially those who are starting out is a big barrier. That stereotype of the "IT guy" still lives on a lot, who stays closed in the dark without talking to anyone just on the computer. But this only delays anyone's development.

Our job as a developer is not just to write code, but to generate value through the solutions we develop. And for that, we need to talk to clients, peers, leaders and everyone who is part of the chain. Important to know how to pass information and ask the right questions, and also sell your work well. It's no use thinking that results will speak for themselves.

I believe that having this well-sharpened communication soft skill due to more than a decade I spent in sales helped me a lot to evolve faster because I was able to relate well with the right people, had resourcefulness to deal with clients and people from all hierarchical levels and know how to conquer my space beyond the technical part.

I hope this post is useful, I've been wanting to talk about these subjects here for a long time but I lacked time.

Cheers!
