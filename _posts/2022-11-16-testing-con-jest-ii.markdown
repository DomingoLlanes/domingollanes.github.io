---
layout: post
title:  "Testing con Jest II"
date:   2022-11-16 19:00:49 +0100
categories: testing node jest
---

**Tabla de contenidos**
* TOC
{:toc}

En la [primera parte][testing-with-jest-i]{:target="_blank"} desarrollamos el primer test, para el modelo User, ahora 
vamos a por los controladores.

En este caso, el repositorio de usuarios es más complicado de testear debido a que, por simplicidad, está acoplado a los 
datos. Por otro lado, también por motivos de simplicidad, la respuesta de los mismos también está acoplada (en este caso 
a la interfaz de entrada, que es esa API que hemos creado).

Así que, ¡vamos a ello!

## Testing de controllers: UserCreateController

Lo primero que tenemos que hacer para crear estos tests es crear los **mocks** necesarios, es decir, vamos a simular los 
servicios de los que dependen los controllers para poder acotar el ámbito de pruebas.

Estos mocks nos van a permitir aislar aquellos puntos que no queremos verificar en nuestros tests, permitiendo crear 
tests "concentrados" que realicen las pruebas unitarias sin tener que depender de un tercero para poder realizarlas. 
Son muy utilizados en el testing y nos permiten, por ejemplo, realizar pruebas de un servicio que conecta con una API de 
terceros sin tener que realizar una petición real a esa API.

### Mock del repositorio

Para realizar un mock del repositorio tenemos que decirle a jest qué funciones tiene disponibles ese mock, para poder 
probar después que esas funciones se han ejecutado.

Esto se puede realizar automáticamente por [Jest][jest]{:target="_blank"}, pero lo vamos a hacer manualmente para 
ver de forma más sencilla y enteder mejor cómo funciona.

Lo primero es crear la carpeta `tests/__mocks__/user`. Dentro de esta carpeta, crearemos el archivo `user-repository.mock.js`:

{% highlight javascript %}
module.exports = {
    save: jest.fn((user) => user),
    findById: jest.fn(() => {
        return {
            'id': 'e1d8cb2c-fd15-4809-a261-14530dab7915',
            'username': 'test@domingollanes.me',
            'password': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        }
    }),
}
{% endhighlight %}

Según vemos en el código, lo que nos interesa del `UserRepository` son las funciones:

- save: el método que se encarga de guardar los datos.
- findById: el método que devuelve un dato a partir de un identificador.

### Mocks de Request y Response

Como hemos comentado, los controllers están acoplados al framework, ya que reciben el `Request` y la `Response` (req y res)
y no devuelven un valor, sino que lo que está haciendo es directamente ejecutar funciones de la `Response` para que
Express devuelva la respuesta de la API.

Por este motivo, necesitamos **mockear** estos dos parámetros que recibe el controller para evitar que se realice
este acoplamiento en los tests.

Vamos a crear dos archivos dentro de la carpeta `tests/__mocks__/shared`:

**api-request.mock.js**

{% highlight javascript %}
module.exports = (body) => ({ body })
{% endhighlight %}

NOTA: Aunque parezca que esto podemos hacerlo en cualquier sitio, al crearlo en un archivo separado nos permite que,
si más adelante necesitamos añadir cosas, podamos hacerlo en un archivo centralizado y no tener que ir modificando
cada aparición por todo el código.

**api-response.mock.js**

{% highlight javascript %}
module.exports = () => {
    const res = {}
    
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    
    return res
}
{% endhighlight %}

NOTA: Este mock es un poco particular debido a que, por cómo funciona Express, las distintas funciones se van ejecutando
de forma encadenada, por lo que necesitamos que cada función mockeada devuelva otra vez el `res`.

### El test de UserCreateController

Ahora que ya tenemos todo lo que necesitamos mockeado, vamos allá con el test.

En nuestro caso, vamos a verificar tres casos de uso:

- Debe devolver el usuario que se ha introducido cuando los datos son válidos.
- Debe devolver un error 422 si los datos no son válidos.
- Debe devolver un error 500 si el guardado falla (en este punto no nos importa por qué falla, sino simplemente que falla).

Para esto, vamos a crear el archivo `tests/controllers/users/create.controller.spec.js`:

{% highlight javascript %}
const { UserCreateController } = require('../../../src/controllers')
const { PasswordEncrypter } = require('../../../src/utils')

const userRepositoryMock = require(
'../../__mocks__/user/user-repository.mock')
const apiRequestMock = require(
'../../__mocks__/shared/api-request.mock')
const apiResponseMock = require(
'../../__mocks__/shared/api-response.mock')

describe('UserCreateController', function () {
    const passwordEncrypter = new PasswordEncrypter()
    
    beforeEach(() => {
        userRepositoryMock.save.mockClear()
    })
    
    it('should return user if valid data', function () {
        const username = 'info@domingollanes.me',
        password = '123456'
    
        const controller = new UserCreateController(userRepositoryMock,
          passwordEncrypter)
    
        const hashedPassword = passwordEncrypter.encrypt(password)
    
        const requestMock = apiRequestMock({ username, password })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(userRepositoryMock.save).toBeCalledTimes(1)
        expect(userRepositoryMock.save).
          toBeCalledWith(
            expect.objectContaining({ username, password: hashedPassword }))
        expect(userRepositoryMock.save).
          toReturnWith(
            expect.objectContaining({ username, password: hashedPassword }))
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(201)
        expect(responseMock.json).toBeCalledTimes(1)
        expect(responseMock.json).
          toBeCalledWith(
            expect.objectContaining({ username, password: hashedPassword }))
    })
    
    it('should return error 422 if not valid data', function () {
        const username = 'infodomingollanes.me',
        password = '123456'
    
        const controller = new UserCreateController(userRepositoryMock,
          passwordEncrypter)
    
        const requestMock = apiRequestMock({ username, password })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(userRepositoryMock.save).not.toBeCalled()
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(422)
        expect(responseMock.json).toBeCalledTimes(1)
        expect(responseMock.json).
          toBeCalledWith(
            expect.objectContaining({ error: expect.any(String) }))
    })
    
    it('should return error 500 if save fails', function () {
    const username = 'info@domingollanes.me',
    password = '123456'
    
        const errorUserRepositoryMock = userRepositoryMock
        errorUserRepositoryMock.save.mockImplementationOnce(
          () => {throw new Error()})
    
        const controller = new UserCreateController(errorUserRepositoryMock,
          passwordEncrypter)
    
        const requestMock = apiRequestMock({ username, password })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(500)
        expect(responseMock.json).toBeCalledTimes(1)
        expect(responseMock.json).
          toBeCalledWith({
            error: 'Unexpected exception',
          })
    })
})
{% endhighlight %}

Una vez lo tenemos, lanzamos los tests para verificar que todo está funcionando correctamente.

{% highlight bash %}
$ npm run test

> 01_express_testing@1.0.0 test
> jest

PASS  tests/controllers/users/create.controller.spec.js
PASS  tests/models/user/user.spec.js

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.26 s, estimated 1 s
Ran all test suites.
{% endhighlight %}

Y ahora vamos a ir desgranando un poco cada punto clave:

#### Mock Clear de mock de UserRepository

{% highlight javascript %}
describe('UserCreateController', function () {
    // ...
    beforeEach(() => {
        userRepositoryMock.save.mockClear()
    })
    // ...
})
{% endhighlight %}

Antes de cada uno de los tests (es decir, de cada `it`), debe limpiarse el mock, para evitar que las ejecuciones
anteriores alteren el resultado de los tests posteriores.

NOTA: Esto es posible hacerlo por configuración (en el archivo `jest.config.js`, poniendo `clearMocks: true`), pero
en este caso lo hemos realizado manualmente para poder remarcarlo después.

#### Los `expect`

Como se puede ver hay bastantes `expect` en cada uno de los tests, vamos a revisar algunos y por qué están ahí.

{% highlight javascript %}
describe('UserCreateController', function () {
    // ...
    it('should return user if valid data', function () {
        // ...
        expect(controller).toBeDefined()
        expect(userRepositoryMock.save).toBeCalledTimes(1)
        expect(userRepositoryMock.save).
          toBeCalledWith(
            expect.objectContaining({ username, password: hashedPassword }))
        expect(userRepositoryMock.save).
          toReturnWith(
            expect.objectContaining({ username, password: hashedPassword }))
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(201)
        // ...
    })
    
    it('should return error 422 if not valid data', function () {
        // ...
        expect(userRepositoryMock.save).not.toBeCalled()
        // ...
    })
    // ...
})
{% endhighlight %}

**expect(...).toBeDefined()**

Este es un expect genérico que se suele añadir para comprobar que realmente está definda alguna variable.

**expect(...).toBeCalledTimes(...)**

Expect que, _llamado sobre un mock_, permite comprobar el número de veces que se ha ejecutado esa función.

_Variación expect(...).not.toBeCalledTimes(...)_

Es una variación del anterior en el que negamos que haya ocurrido algo, en este caso, que no se haya llamado N veces.

**expect(...).toBeCalledWith(...)**

Expect que, _llamado sobre un mock_, permite comprobar que se ha ejecutado esa función con unos parámetros concretos.

Dentro de los parámetros que se añaden a la función `toBeCalledWith` hemos usado: `expect.objectContaining({ username, password: hashedPassword }))`
lo que nos permite decirle que sólo compruebe que, al menos, debe contener esos parámetros. En este caso es necesario
porque hay un parámetro del que desconocemos, el identificador, por lo que sólo podemos verificar parcialmente el
contenido.

**expect(...).toReturnWith(...)**

Mismo caso que el expect anterior, pero en este caso se comprueba que la función ha devuelto unos parámetros concretos.

#### La preparación de los datos y mocks necesarios para el test

{% highlight javascript %}
    const username = 'info@domingollanes.me',
    password = '123456' // el usuario y contraseña que vamos a usar

    const controller = new UserCreateController(userRepositoryMock,
      passwordEncrypter)                                        // instanciamos el controller que vamos a probar

    const hashedPassword = passwordEncrypter.encrypt(password)  // como las contraseñas están hasheadas,
                                                                // necesitamos pasarle ese encrypter
                                                                // a la que hemos creado 

    const requestMock = apiRequestMock({ username, password })  // instanciamos el mock de la Request
    const responseMock = apiResponseMock()                      // instanciamos el mock de la Response

    controller.execute(requestMock, responseMock)               // lanzamos la ejecución del controller
{% endhighlight %}

## Testing de controllers: UserGetController

En el paso anterior, ya hemos creado la mayoría de mocks y explicado las cosas necesarias, así que en este test
vamos a ir ¡mucho más rápido!

Para este controller, vamos a verificar tres casos de uso:

- Debe devolver el usuario con el identificador indicado.
- Debe devolver un error 404 si el usuario no existe.
- Debe devolver un error 500 si el findById falla (como antes, sólo importa si falla).

Creamos el archivo `tests/controllers/users/get.controller.spec.js`:

{% highlight javascript %}
const { UserGetController } = require(
'../../../src/controllers')

const userRepositoryMock = require(
'../../__mocks__/user/user-repository.mock')
const apiRequestMock = require(
'../../__mocks__/shared/api-request.mock')
const apiResponseMock = require(
'../../__mocks__/shared/api-response.mock')
const { UserNotFoundException } = require('../../../src/models/user/exceptions')

describe('UserGetController', function () {
    beforeEach(() => {
        userRepositoryMock.findById.mockClear()
    })
    
    it('should return user if id exists', function () {
        const id = 'e1d8cb2c-fd15-4809-a261-14530dab7915'
    
        const controller = new UserGetController(userRepositoryMock)
    
        const requestMock = apiRequestMock(null, { id })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(userRepositoryMock.findById).toBeCalledTimes(1)
        expect(userRepositoryMock.findById).
          toBeCalledWith(id)
        expect(userRepositoryMock.findById).
          toReturnWith(
            expect.objectContaining({ id }))
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(200)
        expect(responseMock.json).toBeCalledTimes(1)
        expect(responseMock.json).
          toBeCalledWith(
            expect.objectContaining({ id }))
    })
    
    it('should return error 404 if not valid data', function () {
        const id = 'e1d8cb2c-fd15-4809-a261-14530dab7915'
    
        const errorUserRepositoryMock = userRepositoryMock
        errorUserRepositoryMock.findById.mockImplementationOnce(
          () => {throw new UserNotFoundException()})
    
        const controller = new UserGetController(errorUserRepositoryMock)
    
        const requestMock = apiRequestMock(null, { id })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(404)
        expect(responseMock.send).toBeCalledTimes(1)
    })
    
    it('should return error 500 if findById fails', function () {
        const id = 'e1d8cb2c-fd15-4809-a261-14530dab7915'
    
        const errorUserRepositoryMock = userRepositoryMock
        errorUserRepositoryMock.findById.mockImplementationOnce(
          () => {throw new Error()})
    
        const controller = new UserGetController(errorUserRepositoryMock)
    
        const requestMock = apiRequestMock(null, { id })
        const responseMock = apiResponseMock()
    
        controller.execute(requestMock, responseMock)
    
        expect(controller).toBeDefined()
        expect(responseMock.status).toBeCalledTimes(1)
        expect(responseMock.status).toBeCalledWith(500)
        expect(responseMock.json).toBeCalledTimes(1)
        expect(responseMock.json).
          toBeCalledWith({
            error: 'Unexpected exception',
          })
    })
})
{% endhighlight %}

Lanzamos de nuevo los tests.

{% highlight bash %}
$ npm run test

> 01_express_testing@1.0.0 test
> jest

PASS  tests/controllers/users/get.controller.spec.js
PASS  tests/controllers/users/create.controller.spec.js
PASS  tests/models/user/user.spec.js

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.347 s, estimated 1 s
Ran all test suites.
{% endhighlight %}

### Modificaciones necesarias para generar estos tests: El mock de Request

En este caso, como necesitamos el atributo `params` del Request, lo tenemos que añadir al mock que ya teníamos:

{% highlight javascript %}
module.exports = (body, params) => ({ body, params })
{% endhighlight %}

## Conclusión

Como hemos podido ver, en unos sencillos pasos tenemos unos tests básicos que nos permiten comprobar rápidamente
si el funcionamiento de nuestro código es el esperado.

A partir de aquí, simplemente tenemos que iterar sobre este proceso para añadir algunas mejoras:

- Mejorar la reutilización del código.
- Introducir [Faker][faker-js]{:target="_blank"} para generación de datos de pruebas dinámico.
- Introducir Data Providers para poder hacer pruebas sobre datos que sí o sí queremos comprobar.

Si has llegado aquí directamente, puedes ver el capítulo anterior [Testing con Jest I][testing-with-jest-i]

[jest]: https://jestjs.io/es-ES/
[example-testing-repository]: https://github.com/DomingoLlanes/domingollanes.github.io-examples/tree/main/01_express_testing
[faker-js]: https://www.npmjs.com/package/@faker-js/faker

[testing-with-jest-i]: /testing/node/jest/2022/11/13/testing-con-jest-i.html
