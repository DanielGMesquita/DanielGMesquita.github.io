````---
layout: post
title: Connecting local databases - Part I
date: 2024-09-01 08:10 -0300
categories: [Programming, Database]
tags: [programming, postgres, database, sql]
lang: en
---
One thing that every programmer or back-end student needs to have to do anything useful is a running database. After all, everything is CRUD (controversial) and you can't make one without a database.

An important thing is that there are some steps to configure a local database on your machine to be able to run your application and manipulate data.

I'm not going to go into depth here about the differences between SQL and NoSQL, there's plenty of material out there, sit your butt down on the chair and go study. Here I'm going to talk about the differences in connections, how to implement them and what code you need to write. For this post I'm going to use Java in a Vanilla approach, that is, without a framework. And to deal with databases I'm going to use Postgres for SQL and MongoDB for NoSQL.

It will be a series of 4 posts, this first one I'll show the postgres configuration, in the second the creation of entities and tables and their relationships, in the third I configure MongoDB and in the fourth I focus on the interaction of entities, tables and their relationships in a NoSQL database.

First, to be able to use any database, you need to install it and get it running on your machine. On Windows it's quite intuitive because everything is installed via .exe file. On Linux we need to run some commands in the terminal to get everything working properly. This doesn't mean that the Windows environment is better for development, don't be fooled.

Assuming you already have a jdk installed, at least from 11 onwards, let's configure things. On windows, just go to the website and install and on Linux I'll show a basic step by step here.

First you update the package list and then install postgres:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
Then you need to start the service:
```bash
sudo systemctl start postgresql
```
If you want postgres to start automatically when the machine boots:
```bash
sudo systemctl enable postgresql
```
PostgreSQL creates a default user called `postgres`, so switch to that user:
```bash
sudo -i -u postgres
```
Access the PostgreSQL CLI:
```bash
psql
```
I recommend changing the password as you'll need it:
```bash
ALTER USER postgres PASSWORD 'new_password';
```
Exit the postgres prompt:
```bash
\q
```
Exit the postgres user:
```bash
exit
```

Done, you have postgres installed and ready to use. To manage the database, I use pgAdmin4, which you can use both the web application and the desktop version. I use the desktop one. Here's the script:

Add the pgAdmin repository:
```bash
curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo apt-key add
sudo sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/focal pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
```

Update the package list and install pgAdmin:
```bash
sudo apt update
sudo apt install pgadmin4
```
In your installation you may want to define whether you want the desktop version `pgadmin4-desktop` or the webapp `pgadmin4-web`. If you prefer to use the web app, I recommend the following step:
```bash
sudo /usr/pgadmin4/bin/setup-web.sh
```

Now let's get to what matters which is preparing your database to be used. Opening pgAdmin desktop, you right-click on Server and go to Register -> Server...

![First step pgAdmin](assets/img/posts/step_01_pgAdmin.png)

Then you'll face the General Tab, a menu that asks for the server name, here it's free, let's say "PostgreSQL Server" and then you go to Connection Tab, put in the host name `localhost`, since you'll run locally in this case, the default postgres port is `5432` and usually comes by default, the user `postgres` that we configured before and the password you chose. Go Save and your new Server will be there.

Then on the server you created, you can right-click to create a database with the name you think is best. Your database won't have any tables. So you go to `Schemas` -> `Tables` and right-click, there you can use the pgAdmin menu or create the tables via SQL query by selecting `Query Tool`. An example SQL query for you to create a table:
```sql
create table tb_order_product (
    order_id int8 not null, 
    product_id int8 not null, 
    primary key (order_id, product_id)
);
```
With postgres configured and running, we now need to create the connection with the application. Less words and more code. Here's the implementation I used in my case. First, to run locally, you need a db.properties file:
```text
dbuser=postgres
dbpassword=your_password
dburl=jdbc:postgresql://localhost:5432/your_database
useSSL=false
```
* SSL Deactivation: When you set useSSL=false, you're explicitly telling the JDBC driver that it should not use SSL for the database connection. This is useful in environments where SSL communication is not necessary, such as in local development environments, where communication security between the application and the database may not be as high a priority.

Then, it's necessary to create the class that activates the connection to the database. In this class I used 3 methods: one to create the connection to the database, one to close the connection and another that uses the `FileInputStream` class to access the `db.properties` file and collect the data.

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

Additionally, I created a `DbException` class that extends `RuntimeException` to handle and communicate errors that may happen in the connection:

```java
public class DbException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public DbException(String msg) {
    super(msg);
  }
}
```

That's it, the database is configured for use. In the next post I'll bring the implementation of entities and tables and how to perform CRUD properly.

Cheers!
````