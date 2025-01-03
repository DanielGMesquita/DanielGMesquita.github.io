---
layout: post
title: O que eu aprendi em 6 meses trabalhando com código legado
date: 2025-01-03 07:30 -0300
categories: [Programação]
tags: [programação, algoritmos, código legado]  
---
Como alguns sabem, em Agosto de 2024 eu comecei a trabalhar para uma empresa da Europa. Além da mudança de empresas e culturas, uma outra coisa que mudou muito na minha dinâmica foi o tipo de programa que eu trabalho.

Nas minhas experiências anteriores, eu sempre trabalhei com bases de código mais flexíveis e enxutas, com poucos desenvolvedores (às vezes só eu) trabalhando, voltadas para inovação, criação de coisas novas ou melhorias em coisas que já estavam rodando. Claro que sempre tiveram tarefas ligadas a resolução de bugs. Mas eram bugs mais frequentemente encontrados em situações de desenvolvimento do que em incidentes.

Atualmente eu trabalho com uma base de código gigantesca e bem estabelecida, que fornece um serviço robusto e essencial para a Comissão Europeia. Uma base de código que já passou por outra empresa, recebe dependências de bibliotecas de outras empresas, vários desenvolvedores trabalham e já trabalharam nela. Uma aplicação em Java 11 (até ano passado era Java 8), o famoso legadão.

Muitas tarefas que pipocam pra gente são verificações de comportamentos inesperados, resoluções de bugs ou solicitações de pequenas melhorias. Algumas vezes nem em código eu mexo, só forneço assistência clarificando como algumas coisas no programa funcionam considerando o código base e as regras de negócio. São raras as grandes implementações, geralmente ficando para os desenvolvedores seniores. As implementações que eu trabalhei foram menores, criação de features, telas e APIs que fornecem algum recurso novo referente ao serviço que a gente já fornece.

Mas o que eu queria realmente trazer aqui foram alguns aprendizados que eu tive com essa mudança de dinâmica de desenvolvimento, digamos assim.

E nada melhor pra gente aprender do que com os erros dos outros. O sofrimento não é nosso, é de quem errou. Então aproveitem aqui essas dicas tiradas do meu sofrimento.

Uma das coisas que é muito importante quando se trabalha com esse tipo de base de código é a consistência. Sei que às vezes a gente fica tentado a fazer o código do nosso **jeitinho**, aplicar um clean code aqui e ali, refatorar umas coisas. Mas precisamos conter nossa vaidade de achar que pode fazer melhor. Imagina aqui com comigo, uma mudança em uma coisa em uma base de código imensa que segue um só padrão, tudo feito com consistência, seguindo o mesmo formato, base sair implementando em tudo e seguir em paz. Agora pensa fazer isso em um caso que cada API é feita de um jeito diferente, uma autentorização de usuários diferente da outra, maneiras diferentes de lidar com threads... Já consegue imaginar o sufoco né? Então depois de ter sido chamado atenção no começo por fazer mudanças que fugiam do padrão que já estava estabelecido no código, o que eu sempre faço hoje é a seguinte pergunta: como isso é feito nas outras partes do código? Sempre consulto implementações semelhantes e repetitivas para seguir esse padrão.

Outro ponto que eu tive que ficar muito ligado foi entender o impacto de pequenas mudanças. Em bases grandes de códigos muitas vezes a gente pode se equivocar achando que o que a gente está fazendo tem pequeno impacto, mas como são muitas partes se conversando, não dá pra confiar nisso. Importante fazer implementações pequenas. Você não consegue testar toda a base de código com todas as possíveis entradas e saídas, então sempre bom ir trabalhando em pequenos rollouts e ir pegando os problemas pequenos ao invés de ter que lidar com um problema maior para o usuário.

Adicionar novas dependências é sempre algo que tem que ter cautela. Um código "imortal" recebendo novas dependências, é exposto a vulnerabilidades de segurança e problemas de atualização. Dificilmente você vai estar na empresa ou mexendo nesse mesmo programa quando isso acontecer, então, se possível, trabalhe com os recursos que já estão sendo amplamente utilizados.

A mesma cautela tem que ter ao remover código. É muito satisfatório remover código sem utilidade, mas em bases de código gigantes, qualquer remoção tem que ser testada até o último fio de cabelo, identificar tudo que chama aquela parte de código que você tá removendo, entender até onde vai essa hierarquia, ter certeza se é realmente inútil. Uma linha de código que você tirar pode gerar um problemão.

Então, se for mudar algo e sair do padrão, tenha uma BOA justificativa e esteja preparado para encarar qualquer problema, monitore bastante, uma vez que você dificilmente vai conseguir testar todos os casos possíveis. E se for criar uma nova feature, leia a documentação do seu código, pesquisa bastante na própria base de código como coisas semelhantes são feitas. E remova dead code sempre que puder, mas sempre seja cuidadoso.

Um último ponto, mas esse vale pra qualquer tipo de base de código, escreva código legível e fácil de entender. Mas em bases de códigos maiores, isso é fundamental para que outras pessoas possam lidar com possíveis erros que você possa criar.

Muita gente fala sobre trabalhar com código legado de uma maneira bem pejorativa, é menos desenvolvedor do que quem trabalha com serviços menores, códigos voltados pra inovação etc. Bom, trazendo um contraponto, tem muito código legado gerando muita grana e muito emprego pelo mundo. Sendo mais ou menos desenvolvimento de software, é trabalho, paga as contas e também gera valor pra empresa que cria e pra quem usa.

Forte abraço!