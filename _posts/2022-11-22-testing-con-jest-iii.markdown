---
layout: post
title:  "Testing con Jest III"
date:   2022-11-22 04:00:49 +0100
categories: [node, testing]
tags: [testing, junior]
toc: true
---

Ya tenemos los primeros tests generados, vamos con algunos de los pasos adicionales que
comentamos en la parte final de capítulo anterior.

- Introducir [Faker][faker-js]{:target="_blank"} para generación de datos de pruebas dinámico.
- Introducir Data Providers para poder hacer pruebas sobre datos que sí o sí queremos comprobar.

## Introducir Data Providers

Una característica muy interesante que nos permiten los tests es la de ejecutar
de forma automática las pruebas sobre datos más precisos.

En nuestro caso, como tenemos pruebas sobre los emails, supongamos que hemos
recibido un requisito por parte de producto que nos piden que ciertos emails
tengan alguna forma especial:

- example@domingollanes.me
- example@gmail.com
- example+test@domingollanes.me

En concreto, el que más nos interesa es el tercero, que es algo más peculiar.

También vamos a realizar pruebas concretas sobre emails que queremos estar seguros
de que no están permitidos.

Para ello vamos a usar los Data Providers (o Data sets, dependiendo dónde
busquemos).

Modificaremos los tests del User model para añadir esta característica:

```javascript
const { v4: createUuid } = require('uuid')
const { User } = require('../../../src/models')
const { InvalidArgumentException } = require('../../../src/exceptions')

describe('User Model', function () {
    const validUserNames = [
        'example@domingollanes.me',
        'example@gmail.com',
        'example+test@domingollanes.me',
    ]

    const invalidUserNames = [
        { username: 'exampledomingollanes.me' },
        { username: 'example@gmailcom' },
        { username: 'example+test@domingollanes._me' },
    ]

    it.each(validUserNames)(
      'should return an instance of User with username %s',
        (username) => {
            const user = User.create(createUuid(), username, '123456')

            expect(user).toBeInstanceOf(User)
        })

    it.each(invalidUserNames)(
      'should throw an InvalidArgumentException error if username is $username',
        ({ username }) => {
            expect(
                () => { User.create(createUuid(), username, '123456') }).
                    toThrow(InvalidArgumentException)

            try {
                User.create(createUuid(), username, '123456')
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentException)
            }
        })
})
```

Como podemos ver, todo el peso de esta funcionalidad recae sobre la función
`it.each(variable)`, que se encarga de iterar sobre el array generado.

Por otro lado, he añadido dos variables distintas, una que itera sobre strings
directamente y otra que itera sobre objetos. Esto es porque, según cómo sea
el array de Data Providers, tendremos que cambiar la forma en la que mostramos
los datos en el nombre del test:

- Con strings o cualquier otro tipo de valores: En este caso, como son strings
se utilizaría `%s` dentro del texto del nombre del test.
- Con objetos: Se utiliza `$nombre_variable`, en este caso, `$username`.

Si vemos la ejecución de los tests, podemos observar que en el nombre del test
aparece el parámetro para el que se está ejecutando:

```shell
$ npm run test -- tests/models/user/user.spec.js

> 01_express_testing@1.0.0 test
> jest tests/models/user/user.spec.js

PASS  tests/models/user/user.spec.js
User Model
✓ should return an instance of User with username example@domingollanes.me (2 ms)
✓ should return an instance of User with username example@gmail.com (1 ms)
✓ should return an instance of User with username example+test@domingollanes.me (1 ms)
✓ should throw an InvalidArgumentException error if username is exampledomingollanes.me (8 ms)
✓ should throw an InvalidArgumentException error if username is example@gmailcom (1 ms)
✓ should throw an InvalidArgumentException error if username is example+test@domingollanes._me (1 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.442 s, estimated 1 s
Ran all test suites matching /tests\/models\/user\/user.spec.js/i.
```

## Introducir [Faker][faker-js]{:target="_blank"}

Otra mejora que podemos introducir es la generación de datos aleatorios. Esto
nos permite mejorar la forma en la que ejecutamos los tests, permitiendo así
acelerar el proceso de tests y ser agnósticos a los datos que nos llegan.

Para ello vamos a instalar la librería:

```shell
$ npm install --save-dev @faker-js/faker
```

Una vez instalado, vamos a añadirlo a uno de los tests de los controladores:

NOTA: voy a exponer únicamente el código que ha sido modificado, ya que las líneas
que cambian son pocas.

```javascript
const { faker } = require('@faker-js/faker')
...

describe('UserCreateController', function () {
    ...
    it('should return user if valid data', function () {
        const username = faker.internet.email(),
            password = faker.internet.password()
        ...
    })

    it('should return error 422 if not valid data', function () {
        const username = faker.random.word(),
            password = faker.internet.password()
        ...
    })

    it('should return error 500 if save fails', function () {
        const username = faker.internet.email(),
            password = faker.internet.password()
        ...
    })
})
```

Ahora el `username` y el `password` serán generados automáticamente a través
de la librería y no tenemos que preocuparnos de los valores.

En este caso:

- `faker.internet.email()`: genera un email válido aleatorio.
- `faker.internet.password()`: genera una contraseña válida.
- `faker.random.word()`: genera una palabra aleatoria. Lo que sabemos es que esa
palabra, no será un email válido, ya que no contiene `@`, por ejemplo.

Con estos cambios, podemos volver a ejecutar los tests y ver los resultados:

```shell
$ npm run test -- tests/controllers/users/create.controller.spec.js

> 01_express_testing@1.0.0 test
> jest tests/controllers/users/create.controller.spec.js

PASS  tests/controllers/users/create.controller.spec.js
UserCreateController
✓ should return user if valid data (9 ms)
✓ should return error 422 if not valid data (2 ms)
✓ should return error 500 if save fails (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.22 s
Ran all test suites matching /tests\/controllers\/users\/create.controller.spec.js/i.
```

## Conclusión

Añadiendo estas mejoras, podemos darle mucha más versatilidad a los tests que
hacemos a nuestro código y, además, ahorrarnos mucho tiempo en la creación de
los mismos.

Capítulos anteriores:
- [Testing con Jest I][testing-with-jest-i]
- [Testing con Jest II][testing-with-jest-ii]

El código completo se puede ver [aquí][example-testing-repository]{:target="_blank"}

[jest]: https://jestjs.io/es-ES/
[example-testing-repository]: https://github.com/DomingoLlanes/domingollanes.github.io-examples/tree/main/01_express_testing
[faker-js]: https://www.npmjs.com/package/@faker-js/faker

[testing-with-jest-i]: /posts/testing-con-jest-i.html
[testing-with-jest-ii]: /posts/testing-con-jest-ii.html
