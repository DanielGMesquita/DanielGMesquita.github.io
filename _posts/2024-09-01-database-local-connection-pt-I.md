---
layout: post
title: Conectando bancos de dados locais - Parte I
date: 2024-09-01 08:10 -0300
categories: [Programação, Banco de dados]
tags: [programação, postgres, banco de dados, sql]  
---
Uma coisa que todo programador ou estudante back-end precisa ter para fazer qualquer coisa útil, é um banco de dados rodando. Afinal de contas, tudo é CRUD (polêmico) e não se faz um sem um banco de dados.

Uma coisa importante é que existem alguns passos a se configurar um banco de dados local na sua máquina para poder rodar sua aplicação e manusear dados.

Eu não vou me aprofundar aqui sobre as diferenças de SQL e NoSQL, tem bastante material por aí, senta a bunda na cadeira e vai estudar. Aqui eu vou falar sobre as diferenças de conexões, como implementar e o que precisa escrever de código. Para este post eu vou usar Java numa abordagem Vanilla, ou seja, sem framework. E para lidar com bancos de dados eu vou usar o Postgres para SQL e MongoDB para NoSQL.

Vai ser uma série de 4 posts, este primeiro vou mostrar a configuração do postgres, no segundo a criação de entidades e tabelas e suas relações, no terceiro configuro o MongoDB e no quarto foco em interação de entidades, tabelas e suas relações em um banco NoSQL.

Primeiro, para poder utilizar qualquer banco de dados, você precisa instalar e botar pra rodar na sua máquina. No Windows é bem intuitivo porque tudo é instalado via aquivo .exe. No Linux precisamos rodar alguns comandos no terminal pra poder funcionar tudo direitinho. Isso não quer dizer que o ambiente do Windows é melhor pra desenvolver, não se iluda.

Presumindo que você já tem uma jdk instalada, pelo menos da 11 pra frente, vamos configurar as coisas. No windows, só ir no site e instalar e no Linux vou mostrar um passo a passo básico aqui. 

Primeiro você atualiza a lista de packages e então instala o postgres:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
Depois você precisa iniciar o serviço:
```bash
sudo systemctl start postgresql
```
Se quiser que o postgres já inicie quando a máquina ligar:
```bash
sudo systemctl enable postgresql
```
PostgreSQL cria um user por default chamado de `postgres`, então mude para esse usuário:
```bash
sudo -i -u postgres
```
Acesse o CLI do PostgreSQL:
```bash
psql
```
Recomendo mudar a senha pois você vai precisar dela:
```bash
ALTER USER postgres PASSWORD 'nova_senha';
```
Saia do prompt do postgres:
```bash
\q
```
Saia do usuário do postgres:
```bash
exit
```

Pronto, você está com o postgres instalado e pronto pra usar. Para administrar o banco de dados, eu utilizo o pgAdmin4, que você pode usar tanto a aplicação web quanto a versão desktop. Eu utilizo a desktop. Segue o roteiro:

Adicione o repositório do pgAdmin:
```bash
curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo apt-key add
sudo sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/focal pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
```

Atualize a list de packages e instale o pgAdmin:
```bash
sudo apt update
sudo apt install pgadmin4
```
Na sua instalação pode querer definir se quer a versão desktop `pgadmin4-desktop` ou o webapp `pgadmin4-web`. Se preferir usar o web app, recomendo o seguinte passo:
```bash
sudo /usr/pgadmin4/bin/setup-web.sh
```

Agora vamos ao que interessa que é preparar seu banco de dados para ser utilizado. Abrindo o pgAdmin desktop, você clica com o botão direito em Server e vai Register -> Server...

![Primeiro passo pgAdmin](assets/img/posts/databases/step_01_pgAdmin.png)

Aí você vai dar de cara com General Tab, um menu que pede o name do server, aqui é livre, vamos supor "PostgreSQL Server" e depois você vai em Connection Tabe, coloa no host name `localhost`, uma vez que você vai rodar local neste caso, a porta padrão do postgres é `5432` e geralmente já vem por default, o usuário `postgres` que configuramos antes e a senha que você escolheu. Vai de Save e seu novo Server vai estar lá.

Depois no server que você criou, pode clicar com o botão direito para criar um database com o nome que você achar melhor. Seu banco de dados não vai ter nenhuma tabela. Então você vai em `Schemas` -> `Tables` e clica com o botão direito, lá você pode usar o menu do pgAdmin ou criar as tabelas via query do SQL selecionando `Query Tool`. Um exemplo de query SQL para você criar uma tabela:
```sql
create table tb_order_product (
    order_id int8 not null, 
    product_id int8 not null, 
    primary key (order_id, product_id)
);
```
Com o postgres configurado e rodando, precisamos agora criar a conexão com a aplicação. Menos palavras e mais código. Segue a implementação que usei no meu caso. Primeiro, para rodar local, você precisa de um arquivo db.properties:
```text
dbuser=postgres
dbpassword=sua_senha
dburl=jdbc:postgresql://localhost:5432/seu_banco_de_dados
useSSL=false
```
* Desativação do SSL: Quando você define useSSL=false, está explicitamente informando ao driver JDBC que ele não deve usar SSL para a conexão com o banco de dados. Isso é útil em ambientes onde a comunicação SSL não é necessária, como em ambientes de desenvolvimento local, onde a segurança da comunicação entre o aplicativo e o banco de dados pode não ser uma prioridade tão alta.

Depois, é necessário criar a classe que ativa a conexão com o banco de dados. Nesta classe eu utilizei 3 métodos: um para criar a conexão com o banco, um para encerrar a conexão e outro que utiliza a classe `FileInputStream` para acessar o arquivo `db.properties` e coletar os dados.

```java
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DB {

  private static Connection conn = null;

  public static Connection getConnection() {
    if (conn == null) {
      try {
        Properties props = loadProperties();
        String url = props.getProperty("dburl");
        String user = props.getProperty("dbuser");
        String password = props.getProperty("dbpassword");
        conn = DriverManager.getConnection(url, user, password);
      } catch (SQLException e) {
        throw new DbException(e.getMessage());
      }
    }
    return conn;
  }

  public static void closeConnection() {
    if (conn != null) {
      try {
        conn.close();
      } catch (SQLException e) {
        throw new DbException(e.getMessage());
      }
    }
  }

  private static Properties loadProperties() {
    try (FileInputStream fs = new FileInputStream("db.properties")) {
      Properties props = new Properties();
      props.load(fs);
      return props;
    } catch (IOException e) {
      throw new DbException(e.getMessage());
    }
  }
}
```

Além disso, criei uma classe `DbException` que extende `RuntimeException` para lidar e comunicar os erros que possam acontecer na conexão:

```java
public class DbException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public DbException(String msg) {
    super(msg);
  }
}
```

É isso, o banco está configurado para uso. No próximo post trago a implementação das entidades e tabelas e como realizar o CRUD propriamente dito.

Abraços!