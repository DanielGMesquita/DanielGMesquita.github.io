---
layout: post
title: Conectando bancos de dados locais - Extra
date: 2024-09-14 16:00 -0300
categories: [Programação, Banco de dados]
tags: [programação, mongodb, banco de dados, nosql]  
---

Eu pretendia encerrar esta série de postagens sobre conexão local de banco de dados com Java para desenvolvedores trabalharem em seus projetos de estudo. Mas algumas contribuições levantaram alguns assuntos que eu ainda achei interessante trazer: subir os bancos no Docker pra evitar instalação local e demonstrar como fazer a conexão utilizando Springboot.

A lógica de eu ter abordado primeiro sem Docker é para não incluir uma camada maior de complexidade no assunto abordado. Uma vez que fala-se de Docker, tem que explicar o que faz, o que é um container entre outras coisas.

A mesma coisa é sobre aplicação de framework. Apesar de ele diminuir a complexidade, incluir um framework na jogada deixa muita coisa "por baixo dos panos", o que acaba tirando a compreensão real do que está sendo feito.

Mas passando essas explicações, vamos lá.

Imagine o container de transporte de carga dentro de um navio. Se um deles é danificado, os demais se mantem intactos. A lógica é semelhante para o desenvolvimento. Um container é um ambiente isolado, com sua responsabilidade específica e caso um sofra um dano, o funcionamento do sistema não para e a função afetada pode ser redirecionada para outro container. Eles isolam um único aplicativo e suas dependências – todas as bibliotecas externas de software que o aplicativo precisa executar – tanto do sistema operacional subjacente quanto de outros containers.

Onde o Docker entra nessa história de container?

O Docker utiliza o kernel do Linux entre outras coisas para segregar processos, permitindo que eles sejam executados de maneira independente. Utilizando um modelo de implantação baseado em imagens, facilita o compartilharamento de uma aplicação, serviços e suas dependências, além de automatizar a implantação dentro desse ambiente de container.

Tudo isso proporciona um uso eficiente dos recursos do sistema, utilização de memória mais eficiente que máquinas virtuais, economia de recursos, facilidade de implantação de aplicações.

Tendo esta breve explicação, o Docker hoje tem duas maneiras de utilização. A primeira é pelo Docker Engine, que age como uma aplicação cliente-servidor, fornecendo um CLI que utiliza as APIs do Docker para realizar os comandos. Utilizar o Docker Engine puro só é possível no Linux e para deixar no ponto só fazer o seguinte (usando o Ubuntu como exemplo). Primeiro passo é desinstalar versões conflitantes dos packages ou distribuições não oficiais:
```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```
Depois você pode instalar a versão mais recente:
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
Pra verificar se tá tudo certo, roda o comando abaixo, que vai criar uma imagem de teste e rodar em um container. Quando o container rodar, ele printa uma mensagem de confirmação e finaliza.
```bash
sudo docker run hello-world
```

Já pra usar Docker Engine via versão aplicação desktop, é só você seguir a [documentação de instalação](https://docs.docker.com/desktop/) dependendo do seu sistema operacional.

Você pode rodar ambos os bancos de dados que falei aqui de duas maneiras: implantação da imagem via CLI (ou Docker Desktop) ou usando o Docker Compose para fazer gestão de multi-containeres, que permite que a aplicação suba o banco de acordo com o ambiente em execução. o Docker Compose já vem na instalação padrão, inclusive na aplicação desktop.

Vou começar explicando pelo Docker Compose, porque através dele, você pode configurar tanto o mongo quanto o postegres, uma vez que ele roda seus containeres de maneira isolada para a aplicação.

Primeiro passo é criar um arquivo `Dockerfile` para que o ambiente possa rodar em qualquer lugar. Um exemplo:
```Dockerfile
FROM adoptopenjdk/openjdk11:latest
ARG JAR_FILE=target/your-application.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```
Aqui neste arquivo estou definindo a versão da JDK que vai ser utilizada e os comandos para rodar a aplicação.

O segundo passo é definir os serviços que suportam a aplicação em um arquivo `yml` por exemplo `docker-compose.yml` para que esses serviços rodem junto a sua aplicação em um ambiente isolado. No exemplo abaixo, mostro uma ideia de como configurar os dois bancos em um arquivo `yml` para poder usar o Docker Compose:
```yml
version: "3.9"

volumes:
  postgres_data:
    driver: local
  mongo_data:
    driver: local

services:
  mongodb_application:
    container_name: mongodb_application
    build: ./Dockerfile
    restart: always
    ports:
      - "27017:27017"
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo -u admin -p pass --quiet) -eq 1
      interval: 10s
      start_period: 30s
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: pass
      MONGO_INITDB_DATABASE: test
    volumes:
      - ./docker-initdb/mongo-init.js:/docker-initdb/mongo-init.js:ro
      - mongo_data:/data/db
  postgres_application:
    container_name: postgres_application
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: application
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
```
Vale notar que no caso do mongo, na parte dos volumes, estou usando um exemplo de script para inicialização do banco:
```javascript
print('Start #################################################################');

db = db.getSiblingDB('application');
db.createUser(
    {
        user: 'user',
        pwd: 'pass',
        roles: [{ role: 'readWrite', db: 'application' }],
    },
);
```
Com isso tudo no ponto, estando bem configurado, é só rodar um `docker compose up` e o Compose vai iniciar sua aplicação inteira, com as dependências de bancos de dados rodando para sua necessidade.

Vale ressaltar que usar o compose permite que você separe ambientes específicos e que para rodar o seu banco específico tem outros passos que vai depender da sua aplicação. Coisa que vai ficar para o próximo post quando eu for falar sobre utilização do Springboot para configurar os bancos.

Antes de sair escrevendo código. Recomendo você estudar um pouco mais sobre containeres e Docker, recomendo ler a própria [documentação do Docker](https://docs.docker.com/get-started/) que é bem completinha. Vou deixar esse assunto ser digerido mais um pouco pra depois partir para uma abordagem prática na aplicação exemplo que estou utilizando.

Um ponto importante é que após finalizada esta série, eu vou disponibilizar no meu Github uma versão testada e funcional de uma aplicação simples que utiliza tudo o que falamos aqui. Então pode ser que no próximo (e último post desta série) eu já traga ela para vocês.

Abraços!