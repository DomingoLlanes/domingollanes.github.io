---
title: "Qué es un LLM y cómo funciona por dentro (sin jerga)"
description: "Qué es un LLM y cómo funciona: tokens, parámetros, Transformer y por qué los chatbots olvidan. Explicado sin conocimientos previos."
pubDate: 2026-08-14
tags: [LLM, large language model, inteligencia artificial, cómo funciona la IA, ChatGPT]
---

# Qué es un LLM: cómo funciona un modelo de lenguaje grande por dentro

Si has usado ChatGPT, Claude o Gemini, ya has interactuado con un **LLM**. Has oído que son "grandes modelos de lenguaje", pero... ¿qué significa eso exactamente? En este artículo, el primero de una serie para entender la IA desde dentro, te explico **qué es un LLM** sin necesidad de conocimientos previos: solo curiosidad técnica.

## ¿Qué es un LLM?

Un **LLM (Large Language Model, modelo de lenguaje de gran tamaño)** es un modelo de IA —en concreto, una red neuronal— entrenado con una cantidad enorme de texto: libros, webs, código y conversaciones. Puede generar texto, resumir y traducir, y es la tecnología detrás de los chatbots modernos.

Las tres palabras de sus siglas lo resumen bien:

- **Large**: tiene miles de millones de parámetros, los "dialectos" internos que se ajustan durante el entrenamiento.
- **Language**: su materia prima es el texto (los modelos más recientes añaden imágenes y audio).
- **Model**: es una función matemática que convierte texto de entrada en texto de salida. **No es una base de datos** ni un buscador.

La idea que más sorprende: nadie le programó reglas de gramática ni hechos. Los aprendió solo, como efecto secundario de volverse muy bueno en una única tarea: **adivinar qué palabra viene después**.

## El truco único: predecir el siguiente token

Un LLM tiene exactamente un truco: dado un texto, predice qué viene después. Es el **autocompletar del móvil llevado al extremo**: tu teclado sugiere una palabra tras "¿quedamos?"; un LLM ha leído billones de palabras y, para cualquier fragmento, sabe qué token es el más probable.

La generación es un bucle que se repite token a token (generación *autorregresiva*):

1. El texto se divide en tokens.
2. La red neuronal calcula una **puntuación para cada token posible** del vocabulario (normalmente entre 50.000 y 250.000 candidatos).
3. Las puntuaciones se convierten en **probabilidades** que suman 1: "París: 92 %, Francia: 3 %, la: 1 %...".
4. El modelo elige un token, lo añade al texto y repite el bucle hasta llegar a un token de fin.

Por eso las respuestas **no son deterministas** y el modelo suena convincente incluso cuando se equivoca: optimiza lo más *probable*, no lo *verdadero*.

## Tokens: la moneda con la que piensa el modelo

Para predecir, el modelo trocea el texto en **tokens**: trozos de una palabra corta (`the`), fragmentos de una larga (`ization`) o signos de puntuación. El modelo nunca ve letras ni palabras completas; solo tokens.

La frase *"Tokenization isn't magic"* se divide en cinco tokens: `Token` + `ization` + `isn't` + `magic` + `.`. En inglés, **1 token equivale aproximadamente a ¾ de palabra**: 1.000 tokens son unas 750 palabras.

Este detalle explica fallos famosos: como el modelo no "ve" las letras dentro de un token, no puede contar las "r" de *strawberry* (llega como `st` + `raw` + `berry`). También explica por qué las APIs facturan por token.

## Parámetros: una mesa de mezclas gigante

Por debajo, un LLM es una **red neuronal**: capas de neuronas que multiplican números y pasan el resultado a la siguiente capa. Los **parámetros** (o pesos) son los miles de millones de números aprendidos durante el entrenamiento.

La mejor analogía: una **mesa de mezclas de estudio con miles de millones de mandos**. Cada mando solo no significa nada; ajustados todos, producen lenguaje y razonamiento. Cuando un modelo es "7B", tiene unos 7.000 millones de mandos; uno de 405B necesita un clúster de GPUs solo para cargarlo en memoria.

## El Transformer: la arquitectura que lo cambió todo

¿Cómo conecta el modelo *banco* con *río* en "el banco junto al río estaba embarrado"? Gracias al **Transformer**, la arquitectura que Google introdujo en 2017 con el paper *"Attention Is All You Need"* y sobre la que se basan todos los LLM modernos (la "T" de GPT es Transformer).

Antes, los modelos leían el texto **palabra a palabra, como una persona con una linterna**: las primeras palabras se desvanecían de la memoria y el entrenamiento no se podía paralelizar. El Transformer funciona como una **mesa de conferencias**: todas las palabras se sientan a la vez y cada una "mira" a las demás para decidir qué le importa. Ese mecanismo, la **atención**, conecta palabras lejanas directamente y procesa todo en paralelo. Fue la primera arquitectura donde **más datos y más potencia compraban, de forma fiable, más inteligencia**.

## Cómo se entrena: tres fases

Convertir ese "autocompletar gigante" en un asistente útil requiere tres fases (el mecanismo nunca cambia: siempre predice el siguiente token):

1. **Pre-entrenamiento**: aprende a predecir el siguiente token sobre prácticamente todo internet. Es la fase cara: meses en miles de GPUs y millones de dólares. Aquí se hornea casi todo el conocimiento.
2. **Ajuste por instrucciones**: se entrena con pares *pregunta → buena respuesta* para que responda en vez de continuar el texto.
3. **Ajuste por preferencias (RLHF)**: se refina con respuestas que los humanos prefieren para que sea útil, honesto y no tóxico.

Un modelo solo pre-entrenado es un "autocompletar desatado": pregúntale algo y quizá te responda con más preguntas, lo que suele seguir a las preguntas en internet.

## Por qué los chatbots "olvidan": la ventana de contexto

El modelo tiene una **ventana de contexto**: la cantidad máxima de texto que puede ver a la vez, medida en tokens. Piensa en un experto brillante sin memoria con una **pizarra gigante**: solo puede razonar con lo que está escrito en ella, y cuando se llena, se borran las notas más antiguas. Ese borrado explica por qué los chatbots parecen olvidar conversaciones largas, aunque las apps modernas lo mitigan resumiendo el historial y añadiendo memoria.

Además, el modelo es *stateless*: no recuerda nada entre peticiones; la app reenvía el historial en cada mensaje para simular memoria.

## Lo que debes recordar

Un **LLM** es un predictor estadístico de texto a escala gigante: trocea el texto en tokens, lo procesa con una red neuronal basada en atención y encadena predicciones del siguiente token. No es una base de datos ni navega por internet por sí mismo (los chatbots modernos añaden búsqueda web como herramienta externa); no "sabe" la verdad, produce el texto más *plausible*.

En el próximo artículo de la serie exploraremos los **tokens** a fondo: cómo se construyen, por qué cuestan dinero y qué fallos explican.
