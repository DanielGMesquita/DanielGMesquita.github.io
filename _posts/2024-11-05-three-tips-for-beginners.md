---
layout: post
title: Coisas que podem ajudar um iniciante a se destacar
date: 2024-11-05 07:31 -0300
categories: [Carreira, Programação]
tags: [carreira, programação, juninho]
---
Tem três coisas pouco discutidas nos cursos voltados a iniciantes na programação: testes, documentação e comunicação.

Essas coisas geralmente são negligenciadas por quem tá começando, principalmente quem tá sem orientação.

Aí quando se depara com a necessidade de se ter esses conhecimentos e habilidades em um contexto profissional, acha que é coisa de outro mundo.

Eu sei porque já cometi esse erro. Saía escrevendo código, não documentava nada nem testava nada e ficava um caos depois.

E não tem pra que deixar pra depois o que você não vai fazer nunca.

Uma boa documentação facilita muito o compartilhamento de conhecimento sobre uma aplicação, além de ajudar na implementação, depuração e manutenção, pois inclui todos os detalhes necessários para o correto funcionamento do código. Pra documentação eu uso bastante Javadoc e o próprio Swagger, não tem muito mistério pra usar. Outra também muito útil pra quem usar o Spring, é o Spring Rest Docs.

- JavaDoc: Ferramenta utilizada para gerar documentação a partir do código fonte Java. Ele adiciona comentários no código que explicam a funcionalidade de métodos, classes e pacotes, e pode ser exportado para um documento HTML. Geralmente nas IDEs tem as ferramentas de geração desse HTML pra você visualizar. Exemplo de uso:

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

- Swagger (OpenAPI): Uma especificação que documenta APIs RESTful de forma interativa. Ele permite a descrição detalhada de endpoints, parâmetros, respostas e exemplos, facilitando a integração e testes de APIs. No Swagger é recomendável utilizar as anotações @Operation, @ApiResponses, e @Parameter nos seus controladores para melhorar a documentação. No caso do Maven, você tem que adicionar a dependência no `pom.xml`. Por exemplo:

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
Como você pode ver na imagem abaixo, é possível testar inclusive as chamadas aos endpoints, tendo acesso aos exemplos de entradas e saídas de cada um.
![Swagger example](assets/img/posts/swagger.png)

- Spring Rest Docs: Integrado ao ecossistema Spring, esta ferramenta gera documentação legível e interativa a partir de testes escritos, exportando a documentação para HTML ou outros formatos.

O negócio do JavaDoc que pode incomodar algumas pessoas é o fato de deixar o código muito populado por comentários, mas se você não se importar com isso, é uma boa. Agora se você quiser algo externo ao seu código, o Swagger pode ser uma boa saída.

Pra testes, você tem que estudar as ferramentas de teste de cada linguagem. Mas o importante é lembrar que o teste não serve só pra validar o que você acredita, tem que testar de fato as entradas mais absurdas possíveis e tentar cobrir todo tipo de treta. Para começo, os testes unitários servem como um belo ponto de partida.

Testes unitários verificam partes individuais do código para descobrir se funcionam como esperadas. O objetivo é garantir que cada "unidade" do código funcione corretamente isoladamente, sem dependências externas, como bancos de dados ou APIs. Os principais pontos importantes em fazer testes unitários para mim são:
- Identificação precoce de erros, algo que reduz muito custo e tempo de correção;
- Facilita a refatoração do código, dá mais confiança porque com os testes, sabemos que as mudanças não vão quebrar o código e se quebrar, o teste pode identificar isso;
- Teste é documentação viva e ativa, mostrando como as funções devem se comportar;
- Quando você faz testes, você acaba se preocupando em produzir um código mais testável e modular, o que acaba ajudando a aplicar boas práticas de design de código.

No Java eu costumo utilizar o JUnit, que é a biblioteca de testes unitários mais popular. Também utilizo o Mockito, que é uma biblioteca de mocking que permite criar objetos simulados para testar as interações entre diferentes partes do código. Facilita os testes de partes que têm dependências externas. Exemplo de uma classe com testes unitários:
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

Para caso de testar a comunicação com serviços externos, seriam os testes de integração. Mas isso é para outro papo, pois implica um pouco mais de complexidade. Um dia pretendo fazer uma série no blog sobre testes.

E para me dar suporte tanto na parte de documentação quanto em testes eu sempre uso a ajuda de uma IA generativa. Na documentação ajuda muito a mapear o código para criar os comentários necessários sem que você tenha que fazer tudo na mão. E para testes eu utilizo muito para debug e criação de cenários, pois às vezes eu deixo passar alguma possibilidade de erro ou problemas que possam surgir.

E quanto a comunicação, eu sinto que isso para alguns desenvolvedores, principalmente quem tá começando é uma grande barreira. Ainda se vive muito aquele estereótipo do "cara de TI", que fica fechado no escuro sem falar com ninguém só no computador. Mas isso só atrasa o desenvolvimento de qualquer um.

Nosso trabalho como desenvolvedor não é só escrever o código, mas gerar valor através das soluções que desenvolvemos. E para isso, precisamos conversar com clientes, pares, líderes e todo mundo que faz parte da cadeia. Importante saber passar informação e fazer as perguntas certas, e também vender o seu trabalho bem. Não adianta achar que os resultados vão falar por si só.

Acredito que o fato de ter essa softskill de comunicação bem afiada devido a mais de uma década que passei no comercial me ajudou muito a evoluir mais rápido pois consegui me relacionar bem com as pessoas certas, tive desenvoltura a lidar com clientes e pessoas de todos os níveis hierárquicos e saber conquistar meu espaço além da parte técnica.

Espero que este post seja útil, fazia tempo que eu queria falar desses assuntos aqui mas me faltava tempo.

Abraço!