---
layout: post
title: Estrutura de dados - Pilha
date: 2024-12-28 09:31 -0300
categories: [Programação, Estrutura de dados]
tags: [programação, algoritmos, estrutura de dados, pilha]  
---
Depois de passar sobre **[introdução a estrutura de dados](https://danielmesquita.dev.br/posts/data-structures-intro/)**, agora vou falar sobre pilha.

Se você tá chegando aqui desavisado, não tem nada a ver com a pilha que você usa no seu controle remoto. A **pilha** uma estrutura de dados que segue o princípio do LIFO (Last In, Last Out), ou seja, ao "movimentar" os itens de uma pilha, o último elemento inserido é o primeiro a ser removido.

Imagine uma pilha de tijolos, pra retirar o tijolo que está embaixo, você precisa tirar os que estão em cima dele, considerando que você tenha bom senso e não vai tentar puxar o que está embaixo e se expor ao risco de ter vários tijolos caindo em cima de você.

Como eu expliquei no texto anterior (e não vou ficar mais repetindo, além desta vez), o que interessa pra quem usa um programa que utiliza pilha na sua execução, é ver o negócio funcionando. Mas para o desenvolvedor, precisamos entender a implementação.

Além da implementação, vale ressaltar que uma estrutura de dados, seja qual for, é responsável apenas pelas suas próprias operações. Se você precisa incluir alguma regra de negócio, delegue essa responsabilidade para outra parte do seu programa.

Neste texto, vou abordar apenas a pilha estática, que tem um tamanho fixo e definido na sua declaração. A memória é alocada em tempo de compilação. Para quesitos de conhecimento, ela é suficiente para entender a lógica de como esta estrutura de dados funciona.

As operações que uma pilha precisa executar basicamente são:
- `push()`: insere um elemento no topo da pilha;
- `pop()`: remove e retorna o elemento do topo da pilha;
- `isEmpty()`: verifica se a pilha está vazia;
- `isFull()`: verifica se a pilha está cheia.

E pronto! Responsabilidade da pilha é isso. Qualquer coisa a ser feita com as saídas e tratamento de erros, é recomendável delegar para outras partes do programa.

Então chega de papo e vamos ao código. Assim como o texto anterior, vou trazer o mesmo exemplo em C e em Java, estruturada e orientada a objetos, pra demonstrar a aplicação. Para este caso da pilha, um exemplo bem clássico é a conversão de números decimais para binários.

O programa vai ler um número decimal que o usuário passou como input e converte para binário empilhando os restos da divisão por 2. Depois ele desempilha e imprime os restos para exibir o binário, lembrando que ele vai tirando o do topo primeiro sempre.


| Dividendo | Resultado | Resto |
|-----------|-----------|-------|
| 100       | 50        | 0     |
| 50        | 25        | 0     |
| 25        | 12        | 1     |
| 12        | 6         | 0     |
| 6         | 3         | 0     |
| 3         | 1         | 1     |
| 1         | 0         | 1     |

O resto da primeira divisão vai entrar na posição 0 da pilha, e assim por diante, onde o topo vai ser o resto da divisão de 1, que é 1 (estamos tratando apenas números inteiros).

A saída desse programa então vai ser: `1100100`.

Note que o resultado acompanha o que falamos sobre a lógica de Last In First Out, o último a entrar é o primeiro a sair quando vamos imprimir os resultados. Vai ficar mais claro no código.

Vamos começar em C, que eu manjo menos, se eu fizer bobagem, me recupero na frente com o código em Java.

Para aplicar isso em C, primeiro crio a definição da estrutura da pilha no arquivo `stack.h`:

```c
struct Stack{
    int top;
    int values[10];
};

void create(struct Stack *s);
void push(struct Stack *s, int element);
int pop(struct Stack *s);
int isEmpty(struct Stack s);
int isFull(struct Stack s);
```

O `struct` define a estrutura da pilha com um array com tamanho 10 (`int values[10]`) e um inteiro `top` que representa o topo da pilha.

Após a definição da estrutura, vem os métodos que já expliquei anteriormente. Adicionalmente temos o `void create(struct Stack *s)` que inicializa a pilha.

No arquivo `stack.c`, vem as implementações das funções declaradas em `stach.h`:

```c
#include "stack.h"

void create(struct Stack *s)
{
    s->top = -1;
}

void push(struct Stack *s, int element) {
    s->top++;
    s->values[s->top] = element;
}

int pop(struct Stack *s) {
    int element = s->values[s->top];
    s->top--;
    return element;
}

int isEmpty(struct Stack s) {
    return (s.top == -1);
}

int isFull(struct Stack s) {
    return (s.top == 9);
}
```

Note que o `create` inicializa com `top` com -1, indicando que a pilha está vazia. Pra quem não sabe, em um array, a posição 0 é o primeiro elemento, pra ter primeiro elemento, tem que ter algo no array.

E no arquivo `converter.c` que é o programa que converte o decimal para binário usando a pilha, vem a utilização prática:

```c
#include <stdio.h>
#include "stack.h"

int main(int argc, char *argv[]) {
    int value, remainder;
    struct Stack s;
    create(&s);

    printf("Type a value...");
    scanf("%d", &value);

    while (value != 0) {
        remainder = value % 2;
        push(&s, remainder);
        value = value/2;
    }

    while (!isEmpty(s)) {
        remainder = pop(&s);
        printf("%d", remainder);
    }

    printf("\n\nEnd of application\n\n");
    return 0;
}
```

Aqui além de incluir o `stack.h`, também uso a biblioteca padrão de entrada e saída `stdio.h` (Standard Input Output Library).

Em java a lógica é semelhante. Criamos uma classe `Stack` para a implementação da pilha:

```java
public class Stack {
	private int values[];
	private int top;

	public Stack() {
		values = new int[10];
		top = -1; ////pilha vazia, abaixo de 0 que é a primeira posição de um item
	}

	public void push(int element) {
		top++;
		values[top] = element;
	}

	public boolean isEmpty() {
		return (top == -1);
	}

	public boolean isFull() {
		return (top == 9);
	}

	public int pop() {
		int element = values[top];
		top--;
		return element;
	}
}
```

Em Java, a classe referente a pilha já contém a definição e a implementação das funções que a pilha utiliza. Mas note que segue respeitando o que falei anteriormente, a pilha só faz `pop`, `push`, `isFull` e `isEmpty`. Qualquer tratamento de erro e exceção é recomendável ser feito fora da estrutura de dados para isolar a responsabilidade de cada coisa.

Para utilizar `Stack` e um programa, segue o programinha pra rodar a conversão:

```java
import java.util.Scanner;

public class Converter {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
		Stack s = new Stack();

        System.out.print("Type a number: ");
        int number = scanner.nextInt();

        int remainder;

        while (number != 0) {
            remainder = number % 2; // resto da divisão do número por 2
            s.push(remainder);     // armazena na pilha
            number = number / 2;   // gera novo número resultado da divisão por 2
        }

        System.out.print("Binary number: ");
        while (!s.isEmpty()) {
            remainder = s.pop();
            System.out.print(remainder);
        }

        System.out.println("\nEnd of program");
        scanner.close();
    }
}
```

A lógica da conversão tanto em Java quanto em C é a mesma. O programa lê um número decima que o usuário enviou, vai dividindo esse número por 2 enquanto o resultado da divisão for diferente de 0. Em cada divisão, o programa empilha os restos, e após finalizar o loop, desempilha seguindo a ordem último que entra é o primeiro que sai e imprime os restos para exibir o número binário.

A pilha pode ter diversos usos na programação devido a sua natureza LIFO. Alguns deles são:
- Recursão: as chamadas recursivas usam uma pilha para armazenar os estados das chamadas de uma função, cada chamada é empilhada e desempilhada conforme a execução segue;
- Desfazer/Refazer: muito comum em editores de texto para utilizar o undo e o redo;
- Histórico de navegação em navegadores web: as páginas visitadas são empilhadas e podem ser desempilhadas para voltar para a página anterior.

Esses foram só alguns exemplos menos complexos para ilustrar como essa estrutura de dados pode ser útil.

Espero que tenha ficado claro. Qualquer dúvida, só me chamar.

Abraço!