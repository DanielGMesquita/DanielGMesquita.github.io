---
layout: post
title: Estrutura de dados - introdução e tipos abstratos
date: 2024-12-22 02:31 -0300
categories: [Programação, Estrutura de dados]
tags: [programação, algoritmos, estrutura de dados, tipos abstratos de dados]  
---
Eu decidi dar um passo atrás (enquanto continuo andando pra frente, parece até uma dança) nos meus estudos e colocar alguns itens básicos de computação nos meus estudos pra poder suprir algumas lacunas técnicas que tenho. As 3 principais frentes para este plano de fundamentos são: sistemas operacionais, redes e estrutura de dados.

Normalmente trago códigos em Java pra ilustrar as coisas que estou explicando, mas considerando que estou falando de bases, pode ser necessário trazer outras linguagens que eu não tenho familiariade e vou ter que saber lidar, por exemplo C.

Então, quem quiser acompanhar, só seguir aqui. Eu vou fazer postagens para me ajudar a fixar os conhecimentos e documentar meus estudos. Como eu sei que ninguém muito experiente vai consultar isto aqui, vou tentar ser o mais didático possível.

Vale ressaltar, que apesar de eu escrever em PT-BR, todos os códigos são em inglês porque é o padrão que encontramos por aí.

Então, contexto dado. Vamos ao que interessa. Hoje vou introduzir sobre estrutura de dados e falar de tipos abstratos de dados com alguns exemplos em Java e C.

#### Conceitos base

Existem 3 terminologias básicas que todo programador lida mesmo se não souber a fundo seus conceitos:

##### Algoritmo

Um algoritmo é uma sequência de ações em uma linguagem de programação buscando solucionar um problema. É o padrão de comportamento associado aos elementos funcionais ativos de um processamento e deve ter um conjunto finito de ações. Recebe um conjunto de valores como entrada e produz um conjunto de valores como saída.

##### Estrutura de dados

Dão suporte à descrição dos elementos funcionais passivos, complementando o algoritmo. Juntos eles compõem o programa a ser executado pelo computador. 

Uma estrutura de dados precisa considerar os algoritmos a ela associados. Assim como, escolher o algoritmo depende muitas vezes da estrutura de dados a ser utilizada.

As estruturas de dados são comumente aplicadas a (não somente a) kernel (vou explicar sobre isso futuramente) de sistemas operacionais, compiladores e interpretadores, editores de texto e estruturas de bancos de dados.

##### Programa

Junta um com o outro, de maneira básica: estruturar dados e construir algoritmo. Essa é a base de um programa.

É a formulação concreta (utilizando uma linguagem de programação) de um procedimento abstrato que atua sobre um modelo de dados também abstrato.

#### Tipos abstratos de dados

Abstração no nosso campo de estudos é focar em aspectos essenciais de um contexto, simplificando problemas complexos. Quando usamos interfaces para algo mais complicado que acontece nos bastidores.

Na programação, a abstração serve pra "esconder" a implementação de algo, fornecendo apenas o que interessa para quem está usando. 

Aqui um exemplo clássico é o carro. Você não precisa saber como funciona o motor a nível detalhado, como é a combustão da gasolina, como funciona o sistema elétrico, para o motorista dirigir só é necessário saber como funcionam as partes que ele interage.

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
// Classe que abstrai as funcionalidades do carro
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
Como isso bem claro, podemos concluir que quando lidamos com um tipo abstrato de dados, nos concentramos em aspectos essenciais do tipo de dado (suas operações) e nos abstraímos da sua implementação. O usuário só enxerga a interface, quem se preocupa com a implementação é o programador.

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