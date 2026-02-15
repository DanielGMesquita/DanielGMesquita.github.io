---
layout: post
title: Data structures - introduction and abstract data types
date: 2024-12-22 02:31 -0300
categories: [Programming, Data structures]
tags: [programming, algorithms, data structures, abstract data types]
lang: en
---
![Data structures](assets/img/posts/data_structures.jpeg)
I decided to take a step back (while continuing to move forward; it even looks like a dance) in my studies and include some basic computer fundamentals to fill technical gaps I identified. The three main fronts of this fundamentals plan are: operating systems, networks and data structures.

Normally, I bring Java codes to illustrate what I'm explaining, but, considering that we're talking about basic concepts, it may be necessary to explore other languages I don't master, like C.

Whoever wants to follow along, just keep reading here. I'll use the posts to fix content and document my studies. As I imagine that no one very experienced will consult this, I'll try to be as didactic as possible.

It's worth noting that, although I write in Portuguese, all codes will be in English, as it's the standard in programming.

Now, with the context explained, let's get to what matters. Today I'll introduce the theme "data structures" and talk about abstract data types, with examples in Java and C.

#### Base concepts

There are 3 basic terminologies that every programmer deals with even if they don't know their concepts in depth:

##### Algorithm

An algorithm is a sequence of actions in a programming language that seeks to solve a problem. It defines a behavior pattern associated with active functional elements of processing and must have a finite set of actions. It receives values as input and produces a set of values as output.

##### Data structure

Data structures support the description of passive functional elements, complementing algorithms. Together, they form the program that will be executed by the computer.

Choosing an appropriate data structure often depends on the algorithm to be used and vice versa.

Data structures are widely applied in contexts such as:

- Kernels (I'll explain this in the future) of operating systems;
- Compilers and interpreters;
- Text editors;
- Databases.

##### Program

Basically, a program is the union of algorithms and data structures.

It's the concrete formulation (in a programming language) of an abstract procedure that acts on an also abstract data model.

#### Abstract data types

Abstraction in our field of study consists of focusing on essential aspects of a context, simplifying complex problems. We use interfaces to deal with the complexity "behind the scenes".

In programming, abstraction "hides" the implementation of something, providing only what matters to the user.

A classic example is the car. The driver doesn't need to understand technical details of the engine or electrical system, they just interact with the steering wheel, accelerator, ignition, brake and etc.

Some examples of abstraction in programming:
- Static methods: if you want to calculate the area of a rectangle, receiving as function parameters the width and height, it only needs the dimensions and returns the area, you don't need to reflect on the formula `width * height` for this every time, the function "hides" this detail.
```java
public class Main {
    // Static method that abstracts the rectangle area calculation
    public static int calculateRectangleArea(int width, int height) {
        return width * height;
    }

    public static void main(String[] args) {
        // Using the method
        int area = calculateRectangleArea(5, 10);
        System.out.println("The area of the rectangle is: " + area); // Output: 50
    }
}
```
- Classes and objects: object-oriented programming uses many abstractions in programs, for example, our car. Instead of worrying about the vehicle's technical details, you can create a class with the information that matters, like `turnOn()`, `turnOff()` and `accelerate()`. Whoever is going to use it, doesn't need to know how the engine is started, just calls `car.turnOn()`.
```java
class Car {
    private String model;
    private boolean isOn;

    // Constructor to initialize the class
    public Car(String model) {
        this.model = model;
        this.isOn = false;
    }

    // Turns on the car
    public void turnOn() {
        this.isOn = true;
        System.out.println("The " + model + " is now on.");
    }

    // Accelerates
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
        // Creates the "Car" object and interacts with it
        Car myCar = new Car("Fusca");
        myCar.turnOn();
        myCar.accelerate();
    }
}
```
- External libraries and APIs: when you use these in your program, you only deal with ready-made functions, not worrying about how these functions were written and their processing, abstraction hides all its complexity.
```java
public class Main {
    public static void main(String[] args) {
        // Using the sqrt method from the Math class to calculate the square root
        double squareRoot = Math.sqrt(25);
        System.out.println("The square root of 25 is: " + squareRoot); // Output: 5.0
    }
}
```
With this very clear, we can conclude that when dealing with an abstract data type, we focus on essential aspects of the data type (its operations) and abstract ourselves from its implementation. The user only sees the interface, who worries about implementation is the programmer.

##### Implementation of abstract data types
In object-oriented languages, like Java, we usually use classes and interfaces for this. In structured ones, like C, we define types together with the implementation of functions.

A good programming practice in this case is not to access data directly, always doing so through functions.

A good technique is to implement abstract data types in files separate from the main program.

In Java, as I showed earlier, we create the class that abstracts the object and the class that uses it as if they were in the same file, but in the real world, this doesn't happen.

In C, it's the same idea. One file for declarations and another with the implementation of declarations. Basically, we use it like this:
- name_adt.h: the declarations;
- name_adt.c: the implementations.

And then the program that's going to use it will have to use in the header:
```c
#include <stdio.h>
#include "name_adt.h"
```
In the example below I created a simple program in C to calculate goals and assists per games average of any football player.
- player.h (the declarations related to "Player"):

```c
struct Player {
    int games;
    int goals;
    int assists;
};

void create(struct Player *p);
void setPlayerStats(struct Player *p, int goals, int assists, int games);
```

- player.c (the implementations related to "Player"):

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

- player_evaluator.c (program that will do the calculations use the functions related to "Player"):

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

In C, a structure (struct) is a collection of fields that can be referenced by the same name, allowing related information to stay together.

The declaration of a structure defines a data type, informing the computer how many bytes to be reserved will be necessary for a variable that might be declared of this type. Organizes complex data in a readable way and helps model objects or entities in the program.

And the `*p` is the pointer. A variable that stores the memory address of another variable. Instead of keeping the value directly, it keeps the location where the value is stored, so you can access and modify variables by reference, do dynamic memory allocation and avoid data duplication when passed to functions.

And the `->` operator we use to access struct fields via pointer.

##### Motivations for use of abstract data types

- Reuse: with implementation details abstracted, you can use functionality in several cases;
- Maintenance: changes in implementation don't affect the source code;
- Correction and tests: code can be tested in different contexts, reducing possibility of errors.

I think these concepts were a good kickoff to reinforce data structures studies. Now with the abstraction concept more refined, we can approach the most common structures. In the next post about the subject maybe I'll approach stack and queue, if it doesn't get too extensive to bring both.

Cheers!
