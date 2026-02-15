---
layout: post
title: What I learned in 6 months working with legacy code
date: 2025-01-03 07:30 -0300
categories: [Programming]
tags: [programming, algorithms, legacy code]
lang: en
---
As some know, in August 2024 I started working for a European company. Besides the change of companies and cultures, another thing that changed a lot in my dynamics was the type of program I work with.

In my previous experiences, I always worked with more flexible and lean code bases, with few developers (sometimes just me) working, focused on innovation, creating new things or improvements in things that were already running. Of course there were always tasks related to bug resolution. But they were bugs more frequently found in development situations than in incidents.

Currently I work with a gigantic and well-established code base, which provides a robust and essential service for the European Commission. A code base that has already gone through another company, receives dependencies from libraries from other companies, several developers work and have already worked on it. An application in Java 11 (until last year it was Java 8), the famous big legacy.

Many tasks that pop up for us are checks of unexpected behaviors, bug resolutions or requests for small improvements. Sometimes I don't even touch code, I just provide assistance clarifying how some things in the program work considering the base code and business rules. Big implementations are rare, usually staying for senior developers. The implementations I worked on were smaller, creation of features, screens and APIs that provide some new resource referring to the service we already provide.

But what I really wanted to bring here were some learnings I had with this change in development dynamics, so to speak.

And nothing better for us to learn than with others' mistakes. The suffering is not ours, it's from whoever made the mistake. So enjoy here these tips taken from my suffering.

One of the things that's very important when working with this type of code base is consistency. I know that sometimes we're tempted to do the code our **little way**, apply some clean code here and there, refactor some things. But we need to contain our vanity of thinking we can do better. Imagine here with me, a change in something in an immense code base that follows a single pattern, everything done with consistency, following the same format, base go out implementing in everything and move on in peace. Now think about doing this in a case where each API is done differently, one user authorization different from another, different ways to deal with threads... Can you imagine the trouble already right? So after being called attention at the beginning for making changes that deviated from the pattern that was already established in the code, what I always do today is the following question: how is this done in other parts of the code? I always consult similar and repetitive implementations to follow this pattern.

Another point that I had to be very aware of was understanding the impact of small changes. In large code bases we can often be mistaken thinking that what we're doing has small impact, but as there are many parts talking to each other, you can't trust that. Important to do small implementations. You can't test the entire code base with all possible inputs and outputs, so always good to work on small rollouts and pick up small problems instead of having to deal with a bigger problem for the user.

Adding new dependencies is always something that has to have caution. An "immortal" code receiving new dependencies, is exposed to security vulnerabilities and update problems. You'll hardly be at the company or working on this same program when this happens, so, if possible, work with the resources that are already being widely used.

The same caution has to have when removing code. It's very satisfying to remove useless code, but in giant code bases, any removal has to be tested to the last hair, identify everything that calls that part of code you're removing, understand how far this hierarchy goes, make sure if it's really useless. One line of code you remove can generate a big problem.

So, if you're going to change something and deviate from the pattern, have a GOOD justification and be prepared to face any problem, monitor a lot, since you'll hardly be able to test all possible cases. And if you're going to create a new feature, read your code documentation, research a lot in the code base itself how similar things are done. And remove dead code whenever you can, but always be careful.

One last point, but this applies to any type of code base, write readable and easy to understand code. But in larger code bases, this is fundamental for other people to be able to deal with possible errors you may create.

Many people talk about working with legacy code in a very pejorative way, it's less developer than those who work with smaller services, codes focused on innovation etc. Well, bringing a counterpoint, there's a lot of legacy code generating a lot of money and a lot of jobs around the world. Being more or less software development, it's work, pays the bills and also generates value for the company that creates and for those who use it.

Big hug!
