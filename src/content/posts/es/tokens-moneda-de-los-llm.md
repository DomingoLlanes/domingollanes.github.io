---
title: "Tokens: la moneda de los LLM (qué son y por qué importan)"
description: "Qué es un token, cómo se construye el vocabulario de un LLM con BPE y por qué se factura por token. Explicado sin jerga."
pubDate: 2026-08-21
categories: [Conceptos]
tags: [LLM, tokenización, contexto, cómo funciona la IA]
draft: true
toc: true
layout: PostLayout
translationKey: es
---

Siguiendo la serie para entender los LLM por dentro, hoy toca profundizar en los **tokens**. En el post anterior ([Qué es un LLM y cómo funciona por dentro (sin jerga)](que-es-un-llm)) los presenté de pasada como "trozos de una palabra corta". En este artículo te explico qué son exactamente, cómo decide el modelo por dónde cortar el texto y por qué este detalle explica muchos fallos famosos —y por qué te cobran por usarlos.

## ¿Por qué un LLM no puede contar las "r" de "strawberry"?

Una de las pruebas más conocidas de los LLM es la pregunta trampa: *¿cuántas "r" tiene la palabra strawberry?*. Muchos modelos contestan "dos" con total convicción. Otros contestan "tres" con la misma convicción. No es que el modelo sea tonto: **nunca ha visto las letras de la palabra**.

Cuando escribes *strawberry*, el modelo no recibe `s`, `t`, `r`, `a`, `w`, `b`, `e`, `r`, `r`, `y`. Recibe tres piezas opacas —algo así como `st` + `raw` + `berry`— y opera con esas piezas. Contar letras dentro de ellas es, literalmente, imposible por diseño.

Esa es la pista para entender los tokens: el modelo no trabaja con caracteres ni con palabras completas, sino con **trozos** que alguien —no el modelo— decidió por él.

## Qué es un token

Un **token** es una unidad de texto que el modelo trata como indivisible. Suele ser una palabra corta y frecuente (`the`, `magic`), un fragmento de palabra larga (`ization`, `raw`) o un signo de puntuación (`.`, `,`). El **vocabulario** del modelo —la lista completa de tokens que conoce— se fija antes del entrenamiento y no cambia después.

Cuando le pasas un texto al modelo, lo primero que hace es **trocearlo** en tokens y asignarle a cada uno un **número entero (un ID)**. A partir de ahí, el modelo solo ve IDs.

## La analogía: fichas de Scrabble

Imagina una bolsa gigante de **fichas de Scrabble**, pero en vez de letras sueltas, las fichas son trozos de texto frecuentes que se han ido consolidando con el uso. Hay una ficha `the`, una ficha `ing`, una ficha `ización`, una ficha `.`. El modelo no lee letras: coge fichas de la bolsa, las encadena y trabaja solo con eso.

Si la palabra `strawberry` está partida en tres fichas (`st`, `raw`, `berry`), el modelo sabe identificar esas tres fichas por su ID, pero no tiene manera de mirar dentro de cada una. Por eso no puede contar letras, deshacer palabras ni hacer trucos parecidos. La ficha es opaca para él.

## Cómo se construye el vocabulario: Byte-Pair Encoding (BPE)

La pregunta obvia es: ¿quién decide qué fichas hay en la bolsa? La respuesta es un algoritmo llamado **Byte-Pair Encoding (BPE)**, que se ejecuta una sola vez, antes de entrenar el modelo.

La idea es muy simple:

1. Se empieza con todos los caracteres sueltos (o bytes individuales).
2. Se busca el **par de fichas adyacentes más frecuente** en un corpus enorme de texto.
3. Se **fusiona** ese par en una nueva ficha.
4. Se repite hasta alcanzar el tamaño de vocabulario deseado.

Por ejemplo, si el par `t` + `h` aparece muchísimo en inglés, se funde en `th`. Más tarde, `th` + `e` puede fundirse en `the` si el trío es suficientemente frecuente. Así, las palabras y fragmentos muy comunes (`the`, `ing`, `http`, `mente`) acaban teniendo ficha propia; las raras se montan combinando varias fichas.

El vocabulario final suele tener entre **50.000 y 250.000 tokens**. GPT-2, por ejemplo, se quedó en 50.257. Los modelos actuales usan vocabularios más grandes para abarcar más idiomas y representar mejor el código.

Una vez fijado, el vocabulario **no cambia nunca**: el modelo no puede aprender tokens nuevos después del entrenamiento.

## Ejemplo real: "Tokenization isn't magic"

Veamos cómo se trocea una frase real con el tokenizador de OpenAI:

> *"Tokenization isn't magic."*

Se divide en cinco tokens:

- `Token` — palabra frecuente, ficha propia.
- `ization` — sufijo técnico, ficha propia (aparece en *tokenization*, *organization*, *realization*...).
- `isn't` — contracción, ficha propia.
- `magic` — palabra frecuente, ficha propia.
- `.` — punto, ficha propia.

Tres palabras, cinco tokens. Fíjate en el detalle clave: la palabra "Tokenization" se parte en `Token` + `ization`. El modelo **no sabe** que esos dos tokens forman juntos una palabra con sentido; son dos IDs opacos consecutivos.

Con "strawberry" pasa algo parecido: `st` + `raw` + `berry`. Y con "impuesto", en español: `imp` + `uesto` (depende del tokenizador, pero la idea es la misma).

**Regla práctica en inglés**: 1 token equivale aproximadamente a 4 caracteres, o a ¾ de palabra. 1.000 tokens ≈ 750 palabras ≈ página y media. Una novela típica ronda los 100.000–130.000 tokens (≈ 75.000–100.000 palabras).

## Por qué los tokens importan en la práctica

Que el modelo trabaje con tokens en vez de letras no es un detalle técnico menor: tiene consecuencias reales y cotidianas.

### Se factura por token

Las APIs de pago (OpenAI, Anthropic, Google) **cobran por token de entrada y de salida**. 1 millón de tokens equivale aproximadamente a 750.000 palabras en inglés. Si envías una novela entera a GPT-4, pagas por unos 100.000 tokens solo de entrada — antes de que el modelo escriba una palabra.

### La ventana de contexto se mide en tokens

La **ventana de contexto** —la cantidad de texto que el modelo puede "ver" a la vez— se mide en tokens, no en palabras ni en páginas. Cuando escuchas "Claude tiene 200k de contexto", son 200.000 tokens, unas 150.000 palabras. Si llenas esa ventana con un documento enorme, apenas queda hueco para la respuesta, porque la salida también consume tokens.

### La aritmética falla con números largos

Como los números se tokenizan de formas arbitrarias —`12345` puede partirse en `123` + `45`, o en `1234` + `5`, según el caso—, el modelo no ve dígitos individuales. Eso explica por qué falla con operaciones como sumar números de muchos dígitos: opera con IDs que no le dicen qué cifras hay dentro.

### El "impuesto del token" en otros idiomas

El vocabulario se entrena mayoritariamente con inglés, así que el inglés se tokeniza muy eficientemente (1 token ≈ ¾ palabra). Otros idiomas —español, japonés, árabe, chino— necesitan más tokens para decir lo mismo, porque sus palabras y morfologías están peor representadas. Es un sesgo estructural del tokenizador, no del modelo en sí.

### Trampas curiosas

Un espacio delante cambia el token por completo (` hola` y `hola` son fichas distintas). Los emojis se tokenizan de forma rara, a veces en varios tokens. El código con símbolos (`{}`, `=>`, `==`) se tokeniza peor que el texto natural. Todas estas son huellas del algoritmo BPE, no fallos del modelo.

Ninguno de estos problemas es un "bug" que se pueda parchear: son **consecuencias estructurales** de trocear el texto así.

## Lo que debes recordar

- Un **token** es un trozo de texto (palabra corta, fragmento o signo) que el modelo trata como unidad indivisible.
- El modelo nunca ve letras dentro de un token: ve **IDs numéricos opacos**.
- El vocabulario se construye con **Byte-Pair Encoding (BPE)**: se empieza con caracteres sueltos y se fusionan los pares más frecuentes hasta llegar al tamaño deseado (50.000–250.000 tokens).
- Regla práctica en inglés: **1 token ≈ ¾ de palabra**. Una novela ≈ 100.000 tokens.
- Esto explica por qué los LLM **no pueden contar letras**, **fallan con aritmética larga** y por qué **todo se factura y se limita en tokens**.
- En el próximo post de la serie veremos qué hace el modelo con esos tokens: cómo genera texto nuevo, palabra a palabra, y por qué el resultado no siempre es determinista.

---

## Fuentes

- AI/TLDR. *What Is a Token in an LLM?*. https://ai-tldr.dev/learn/llm-fundamentals/tokens-and-tokenization/what-is-a-token/
- Wikipedia. *Large language model*. https://en.wikipedia.org/wiki/Large_language_model

---

*Este contenido se generó con asistencia de IA.*
