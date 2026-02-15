---
layout: post
title: HTTP and its methods
date: 2024-08-16 21:04 -0300
categories: [Internet, HTTP]
tags: [internet, http, basics]
lang: en
---
Whether you're frontend or backend, you need to know how the web works.

In the image below, you can see that at the beginning of the back-end roadmap, it's one of the basic items.

![Roadmap back-end](assets/img/posts/roadmap_base.png)

A mistake that many beginner developers make is to start writing lines of code without knowing how everything works under the hood.

And one of the basics is HTTP. As I mentioned in the last post, the HTTP protocol is used for client-server communication to exchange information through requests.

The most commonly used methods to perform these exchanges are:
1 - GET: used to request data from the server,
2 - POST: used to submit the inclusion of an entity to a specific content on the server side;
3 - PUT: Used to replace existing data of a specific resource;
4 - DELETE: Removes a specific resource.

It's important to emphasize that these methods should be taken into account when building an API. Using a GET to make changes to a database on the server side, for example, is not appropriate because it's possible to view sensitive data via the request URL.

And for those who are curious about the roadmaps, you can check out the tool [here](https://roadmap.sh/).

Cheers!
