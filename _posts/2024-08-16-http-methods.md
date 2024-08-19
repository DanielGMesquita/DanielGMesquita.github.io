---
layout: post
title: HTTP e seus métodos
date: 2024-08-16 21:04 -0300
categories: [Internet, HTTP]
tags: [internet, http, basics]  
---
Seja você frontend ou backend, precisa saber como funciona a web.

Nas imagem abaixo, você pode ver que no início do roadmap de back-end, é um dos itens básicos.

![Roadmap back-end](assets/img/posts/roadmap_base.png)

Um erro que muito dev iniciante comete é já sair escrevendo linhas códigos sem saber como tudo funciona por baixo dos panos.

E uma das bases é o HTTP. Como eu falei no último post, o protocolo HTTP é utilizado para comunicação cliente-servidor para troca de informação através de requisições.

Os métodos mais utilizados para realizar essas trocas são:
1 - GET: utilizado pra solicitar dados do servidor,
2 - POST: utilizado para submeter uma inclusão de uma entidade a um conteúdo específico do lado do servidor;
3 - PUT: Utilizado para substituir os dados existentes de um recurso específico;
4 - DELETE: Remove um recurso específico.

Importante ressaltar que esses métodos devem ser levado em conta na construção de uma API. Utilizar um GET pra fazer uma alteração numa base de dados do lado do servidor, por exemplo, não é adequado por ser possível visualizar dados sensíveis via URL da requisição.

E pra quem ficou curioso sobre os roadmaps, você pode conferir a ferramenta [aqui](https://roadmap.sh/).

Abraços!
