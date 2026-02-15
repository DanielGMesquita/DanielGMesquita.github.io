---
layout: post
title: Data structures - Stack
date: 2024-12-28 09:31 -0300
categories: [Programming, Data structures]
tags: [programming, algorithms, data structures, stack]
lang: en
---
After going through **[introduction to data structures](https://danielmesquita.dev.br/posts/data-structures-intro/)**, now I'll talk about stack.

If you're arriving here unaware, it has nothing to do with the battery you use in your remote control. The **stack** is a data structure that follows the LIFO principle (Last In, First Out), that is, when "moving" items in a stack, the last element inserted is the first to be removed.

Imagine a stack of bricks, to remove the brick that's at the bottom, you need to remove the ones that are on top of it, considering that you have common sense and won't try to pull the one at the bottom and expose yourself to the risk of having several bricks falling on you.

As I explained in the previous text (and I won't keep repeating, beyond this time), what matters to those who use a program that uses stack in its execution, is to see the thing working. But for the developer, we need to understand the implementation.

Besides implementation, it's worth noting that a data structure, whatever it is, is only responsible for its own operations. If you need to include some business rule, delegate this responsibility to another part of your program.

In this text, I'll approach only the static stack, which has a fixed size defined in its declaration. Memory is allocated at compile time. For knowledge purposes, it's sufficient to understand the logic of how this data structure works.

The operations that a stack needs to perform basically are:
- `push()`: inserts an element at the top of the stack;
- `pop()`: removes and returns the element from the top of the stack;
- `isEmpty()`: checks if the stack is empty;
- `isFull()`: checks if the stack is full.

And that's it! The stack's responsibility is this. Anything to be done with outputs and error handling, it's recommendable to delegate to other parts of the program.

So enough talk and let's get to the code. Just like the previous text, I'll bring the same example in C and in Java, structured and object-oriented, to demonstrate the application. For this stack case, a very classic example is the conversion of decimal numbers to binary.

The program will read a decimal number that the user passed as input and converts to binary by stacking the remainders of division by 2. Then it unstacks and prints the remainders to display the binary, remembering that it will take out the one at the top first always.


| Dividend | Result | Remainder |
|----------|--------|-----------|
| 100      | 50     | 0         |
| 50       | 25     | 0         |
| 25       | 12     | 1         |
| 12       | 6      | 0         |
| 6        | 3      | 0         |
| 3        | 1      | 1         |
| 1        | 0      | 1         |

The remainder of the first division will enter position 0 of the stack, and so on, where the top will be the remainder of the division of 1, which is 1 (we're dealing only with integers).

The output of this program then will be: `1100100`.

Note that the result follows what we talked about the Last In First Out logic, the last to enter is the first to exit when we're going to print the results. It will be clearer in the code.

Let's start in C, which I handle less, if I mess up, I'll recover ahead with Java code.

To apply this in C, first I create the stack structure definition in the `stack.h` file:

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

The `struct` defines the stack structure with an array with size 10 (`int values[10]`) and an integer `top` that represents the top of the stack.

After the structure definition, come the methods I already explained earlier. Additionally we have `void create(struct Stack *s)` that initializes the stack.

In the `stack.c` file, come the implementations of the functions declared in `stack.h`:

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

Note that `create` initializes with `top` with -1, indicating that the stack is empty. For those who don't know, in an array, position 0 is the first element, to have first element, you have to have something in the array.

And in the `converter.c` file which is the program that converts decimal to binary using the stack, comes the practical use:

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

Here besides including `stack.h`, I also use the standard input and output library `stdio.h` (Standard Input Output Library).

In Java the logic is similar. We create a `Stack` class for the stack implementation:

```java
public class Stack {
	private int values[];
	private int top;

	public Stack() {
		values = new int[10];
		top = -1; //empty stack, below 0 which is the first position of an item
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

In Java, the class referring to the stack already contains the definition and implementation of the functions that the stack uses. But note that it continues respecting what I said earlier, the stack only does `pop`, `push`, `isFull` and `isEmpty`. Any error handling and exception is recommendable to be done outside the data structure to isolate the responsibility of each thing.

To use `Stack` and a program, here's the little program to run the conversion:

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
            remainder = number % 2; // remainder of the number division by 2
            s.push(remainder);     // stores in the stack
            number = number / 2;   // generates new number result of division by 2
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

The conversion logic in both Java and C is the same. The program reads a decimal number that the user sent, keeps dividing this number by 2 while the division result is different from 0. In each division, the program stacks the remainders, and after finishing the loop, unstacks following the last in first out order and prints the remainders to display the binary number.

The stack can have several uses in programming due to its LIFO nature. Some of them are:
- Recursion: recursive calls use a stack to store the states of a function's calls, each call is stacked and unstacked as execution proceeds;
- Undo/Redo: very common in text editors to use undo and redo;
- Navigation history in web browsers: visited pages are stacked and can be unstacked to go back to the previous page.

These were just some less complex examples to illustrate how this data structure can be useful.

I hope it was clear. Any questions, just call me.

Cheers!
