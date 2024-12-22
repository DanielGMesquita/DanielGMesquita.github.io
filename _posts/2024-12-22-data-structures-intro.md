---
layout: post
title: Estrutura de dados - introdução e tipos abstratos
date: 2024-12-22 02:31 -0300
categories: [Programação, Estrutura de dados]
tags: [programação, algoritmos, estrutura de dados, tipos abstratos de dados]  
---
Decidi dar um passo atrás (enquanto continuo andando para frente; parece até uma dança) nos meus estudos e incluir alguns fundamentos básicos de computação para suprir lacunas técnicas que identifiquei. As três principais frentes desse plano de fundamentos são: sistemas operacionais, redes e estrutura de dados.

Normalmente, trago códigos em Java para ilustrar o que estou explicando, mas, considerando que estamos falando de conceitos básicos, pode ser necessário explorar outras linguagens que não domino, como C.

Quem quiser acompanhar, é só seguir por aqui. Vou usar as postagens para fixar o conteúdo e documentar meus estudos. Como imagino que ninguém muito experiente vá consultar isso, tentarei ser o mais didático possível.

Vale ressaltar que, embora eu escreva em português, todos os códigos estarão em inglês, pois é o padrão na programação.

Agora, com o contexto explicado, vamos ao que interessa. Hoje vou introduzir o tema "estrutura de dados" e falar sobre tipos abstratos de dados, com exemplos em Java e C.

#### Conceitos base

Existem 3 terminologias básicas que todo programador lida mesmo se não souber a fundo seus conceitos:

##### Algoritmo

Um algoritmo é uma sequência de ações em uma linguagem de programação que busca solucionar um problema. Ele define um padrão de comportamento associado aos elementos funcionais ativos de um processamento e deve ter um conjunto finito de ações. Recebe valores como entrada e produz um conjunto de valores como saída.

##### Estrutura de dados

As estruturas de dados dão suporte à descrição dos elementos funcionais passivos, complementando os algoritmos. Juntas, elas formam o programa que será executado pelo computador.

Escolher uma estrutura de dados adequada depende frequentemente do algoritmo a ser utilizado e vice-versa.

Estruturas de dados são amplamente aplicadas em contextos como:

- Kernels (vou explicar isso futuramente) de sistemas operacionais;
- Compiladores e interpretadores;
- Editores de texto;
- Bancos de dados.

##### Programa

Basicamente, um programa é a união de algoritmos e estruturas de dados.

Ele é a formulação concreta (em uma linguagem de programação) de um procedimento abstrato que atua sobre um modelo de dados também abstrato.

#### Tipos abstratos de dados

A abstração no nosso campo de estudos consiste em focar nos aspectos essenciais de um contexto, simplificando problemas complexos. Usamos interfaces para lidar com a complexidade "nos bastidores".

Na programação, a abstração "esconde" a implementação de algo, fornecendo apenas o que interessa para o usuário.

Um exemplo clássico é o carro. O motorista não precisa entender detalhes técnicos do motor ou do sistema elétrico, ele apenas interage com o volante, o acelerador, ignição, freio e etc.

Alguns exemplos de abstração em programação:
- Métodos estáticos: se você quiser calcular a área de um retângulo, recebendo como parâmetros da função a largura e a altura, ela precisa só das dimensões e devolve a área, você não precisa toda vez refletir sobre a fórmula `largura * altura` pra isso, a função "esconde" esse detalhe.
```java
public class Main {
    // Método estático que abstrai o calculo da área do retângulo
    public static int calculateRectangleArea(int width, int height) {
        return width * height;
    }

    public static void main(String[] args) {
        // Usando o método
        int area = calculateRectangleArea(5, 10);
        System.out.println("The area of the rectangle is: " + area); // Output: 50
    }
}
```
- Classes e objetos: a programação orientada a objetos usa muitas abstrações nos programas, por exemplo, o nosso carro. Em ve de se preocupar com os detalhes técnicos do veículo, você pode criar uma classe com as informações que importam, como `ligar()`, `desligar()` e `acelerar()`. Quem for usar, não precisa saber como o motor é iniciado, apenas chama `carro.ligar()`.
```java
class Car {
    private String model;
    private boolean isOn;

    // Construtor para inicializar a classe
    public Car(String model) {
        this.model = model;
        this.isOn = false;
    }

    // Liga o carro
    public void turnOn() {
        this.isOn = true;
        System.out.println("The " + model + " is now on.");
    }

    // Acelera
    public void accelerate() {
        if (isOn) {
            System.out.println("The " + model + " is accelerating!");
        } else {
            System.out.println("You need to turn on the car first!");
        }
    }
}
```
```java
public class Main {
    public static void main(String[] args) {
        // Cria o objeto "Car" e interage com ele
        Car myCar = new Car("Fusca");
        myCar.turnOn();
        myCar.accelerate();
    }
}
```
- Bibliotecas e APIs externas: quando você utiliza estes no seu programa, você só lida com funções prontas, não se preocupando como essas funções foram escritas e o seu processamento, a abstração oculta toda sua complexidade.
```java
public class Main {
    public static void main(String[] args) {
        // Using the sqrt method from the Math class to calculate the square root
        double squareRoot = Math.sqrt(25);
        System.out.println("The square root of 25 is: " + squareRoot); // Output: 5.0
    }
}
```
Com isso bem claro, podemos concluir que quando lidamos com um tipo abstrato de dados, nos concentramos em aspectos essenciais do tipo de dado (suas operações) e nos abstraímos da sua implementação. O usuário só enxerga a interface, quem se preocupa com a implementação é o programador.

##### Implementação de tipos abstratos de dados
Em liguagens orientadas a objetos, como Java, costumamos utilizara para isso classes e interfaces. Já nas estruturadas, como C, definimos os tipos juntamente com a implementação das funções.

Uma boa prática de programação neste caso é não acessar o dado diretamente, sempre fazendo isso através das funções.

Uma boa técnica é implementar os tipos abstratos de dados em arquivos separados do programa principal.

Em Java, como mostrei anteriormente, criamos a classe que abstrai o objeto e a classe que utiliza como se estivessem no mesmo arquivo, mas no mundo real, isso não ocorre.

Em C, é a mesma ideia. Um arquivo para as declarações e outro com a implementação das declarações. Basicamente, utilizamos assim:
- nome_tad.h: as declarações;
- nome_tad.c: as implementações.

E aí o programa que for utilizar vai ter usar no cabeçalho:
```c
#include <stdio.h>
#include "nome_tad.h"
```
No exemplo abaixo eu criei um programa simples em C para calcular média de gols e assitências por jogos de um jogador de futebol qualquer.
- player.h (as declarações relacionadas ao "Player"):
```c
struct Player {
    int games;
    int goals;
    int assists;
};

void create(struct Player *p);
void setPlayerStats(struct Player *p, int goals, int assists, int games);
```
- player.c (as implementações relacionadas ao "Player"):
```c
#include "player.h"

void create(struct Player *p){
    p->games = 0;
    p->goals = 0;
    p->assists = 0;
}

void setPlayerStats(struct Player *p, int goals, int assists, int games){
    p->games = games;
    p->goals = goals;
    p->assists = assists;
}
```
- player_evaluator.c (programa que vai fazer os cálculos utilizar as funções relacionadas ao "Player"):
```c
#include <stdio.h>
#include "player.h"

int main(int argc, char *argv[]) {
    int games, goals, assists;
    struct Player p;
    create(&p);

    printf("Type number of goals...");
    scanf("%d", &goals);

    printf("Type number of assists...");
    scanf("%d", &assists);

    printf("Type number of games...");
    scanf("%d", &games);

    setPlayerStats(&p, goals, assists, games);

    printf("Assists per game: %.2f\n", (double)p.assists/p.games);
    printf("Goals per game: %.2f\n", (double)p.goals/p.games);

    printf("\n\nEnd of application\n\n");
    return 0;
}
```
Em C, uma estrutura (struct) é uma coleção de campos que podem ser referenciados pelo mesmo nome, perimitindo que as informações relacionadas mantenham-se juntas.

A declaração de uma estrutura define um tipo de dado, informando ao computador quantos bytes a serem reservados serão necessários para uma variável que venha a ser declarada desse tipo. Organiza dados complexos de maneira legível e ajuda a modelar objetos ou entidades no programa.

E o `*p` é o ponteiro. Uma variável que armazena o endereço de memória de outra variável. Em vez de guardar o valor diretamente, ele guarda a localização onde o valor está armazenado, assim você pode acessar e modificar variáveis por referência, fazer alocação dinâmica de memória e evita duplicação de dados quando passados para funções.

E o operador `->` utilizamos para acessar campos de uma struct via ponteiro.

##### Motivações para uso de tipos abstratos de dados

- Reutilização: com detalhes da implementação abstraídas, pode-se utilizar uma funcionalidade em vários casos;
- Manutenção: mudanças na implementação não afetam o código fonte;
- Correção e testes: o código pode ser testado em diferentes contextos, diminuindo possibilidade de erros.

Acho que esses conceitos foram um bom pontapé de reforço dos estudos de estruturas de dados. Agora com o conceito de abstração mais afinado, dá pra abordar as estruturas mais comuns. No próximo post sobre o assunto talvez eu aborde pilha e fila, se não ficar muito extenso para trazer os dois.

Abraço!