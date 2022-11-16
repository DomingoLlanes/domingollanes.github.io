---
layout: post
title:  "Testing con Jest I"
date:   2022-11-13 08:05:49 +0100
categories: testing node jest
---

**Tabla de contenidos**
* TOC
{:toc}

Cuando estamos desarrollando aplicaciones, un punto importante es realizar las pruebas necesarias para determinar si lo que hemos desarrollado está funcionando de la forma en la que esperamos.

Para solucionar eso, tenemos varias técnicas:

- Realizar pruebas manuales.
- Programar pruebas automáticas.

En este post vamos a ver cómo realizar pruebas automáticas con [Jest][jest]{:target="_blank"}

## Proyecto inicial

Para poder hacer pruebas, vamos a utilizar un proyecto de pruebas muy básico que he montado, que podéis ver y descargar aquí: [domingollanes.github.io-examples/01_express_testing/][example-testing-repository]{:target="_blank"}

El proyecto es muy sencillo y tiene dos endpoints:

- `POST /users`: Crear un usuario.
- `GET /users/:id`: Obtener el usuario con id = `id`

Si navegamos un poco por el código de este backend, podemos ver que contiene:

**User model**:

{% highlight javascript %}
class User {
    id
    username
    password
    
    constructor (id, username, password) {
        this.id = id
        this.username = username
        this.password = password
        
        this.validateUsername()
    }
    
    static create (id, username, password) {
        return new User(id, username, password)
    }
    
    validateUsername () {
        const emailRegex = ...
        
        if (!emailRegex.test(this.username)) {
            throw new InvalidArgumentException()
        }
    }
}
{% endhighlight %}

**User repository**:

NOTA: la variable `data` representa un archivo JSON en este caso. En casos más complejos eso podría ser una conexión a base de datos o cualquier cosa desde donde recogeríamos los datos. Dejo un ejemplo de un archivo de este tipo:

{% highlight json %}
[
    {
        "id": "e1d8cb2c-fd15-4809-a261-14530dab7915",
        "username": "test@domingollanes.me",
        "password": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
    }
]
{% endhighlight %}

{% highlight javascript %}
class UserRepository {
    save (user) {
        const object = Object.assign({}, user)
        data.push(object)
        return user
    }
    
    findById (id) {
        const user = data.find((one) => (one.id === id))
    
        if (!user) {
          throw new UserNotFoundException()
        }
        
        return user
    }
}
{% endhighlight %}

**UserCreateController y UserGetController**:

NOTA: Aunque estén como métodos asíncronos, realmente los dos controladores son síncronos, ya que no tenemos una conexión asíncrona para recuperar los datos. 

{% highlight javascript %}
class UserCreateController {
    userRepository
    passwordEncrypter
    
    constructor (userRepository, passwordEncrypter) {
        this.userRepository = userRepository
        this.passwordEncrypter = passwordEncrypter
    }
    
    async execute (req, res) {
        const { username, password } = req.body

        try {
            const user = User.create(createUuid(), username,
            this.passwordEncrypter.encrypt(password))
            
            this.userRepository.save(user)
            
            return res.status(201).json(user)
        } catch (error) {
            if (error instanceof InvalidArgumentException) {
                return res.status(422).json({
                    error: error.message || error.name,
                })
            }
            
            return res.status(500).json({
                error: 'Unexpected exception',
            })
        }
    }
}
{% endhighlight %}

{% highlight javascript %}
class UserGetController {
    userRepository
    
    constructor (userRepository) {
        this.userRepository = userRepository
    }
    
    async execute (req, res) {
        const { id } = req.params
    
        try {
            const user = this.userRepository.findById(id)
            
            return res.status(200).json(user)
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                return res.status(404).send()
            }
            
            return res.status(500).json({
                error: 'Unexpected exception',
            })
        }
    }
}
{% endhighlight %}

## Iniciando con los tests: test unitario del modelo User

Vamos a comenzar con las pruebas del modelo User (cuyo código está justo en la sección anterior). Para ello, vamos a crear la carpeta de `tests` que ahora mismo no existe y estará en el mismo nivel que la carpeta `src`.

El objetivo es tener un equivalente a cada fichero de nuestro código en la carpeta de `tests`, permitiendo así encontrar rápidamente el test de cada fichero.

El siguiente paso será crear el test para el modelo User, así que vamos a crear el archivo `tests/models/user/user.spec.js`. Vamos a comenzar con el test más sencillo, comprobar que lo que devuelve es realmente un objeto de la clase `User`

{% highlight javascript %}
const { v4: createUuid } = require('uuid')
const { User } = require('../../../src/models')

describe('User Model', function () {
    it('should return instance of User on create', function () {
        const user = User.create(createUuid(), 'info@domingollanes.me', '123456')
        expect(user).toBeInstanceOf(User)
    })
})
{% endhighlight %}

Si lanzamos los tests:

{% highlight bash %}
$ npm run test

> 01_express_testing@1.0.0 test
> jest

PASS  tests/models/user/user.spec.js
User Model
✓ should return instance of User on create (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.227 s, estimated 1 s
Ran all test suites.
{% endhighlight %}

El siguiente test que vamos a añadir es que, cuando el email que se introduzca no sea válido, lance una excepción del tipo `InvalidArgumentException`.

Para hacer esto hay dos opciones, voy a añadir las dos en los tests, pero deberíais escoger una de las dos:

{% highlight javascript %}
const { v4: createUuid } = require('uuid')
const { User } = require('../../../src/models')
const { InvalidArgumentException } = require('../../../src/exceptions')

describe('User Model', function () {
    it('should return instance of User on create', function () {
        const user = User.create(createUuid(), 'info@domingollanes.me', '123456')
    
        expect(user).toBeInstanceOf(User)
    })
    
    it('should throw an InvalidArgumentException error if email is not valid', function () {
        expect(() => { User.create(createUuid(), 'any', '123456') }).
            toThrow(InvalidArgumentException)
    
        try {
            User.create(createUuid(), 'any', '123456')
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidArgumentException)
        }
    })
})
{% endhighlight %}

Volvemos a lanzar los tests para comprobar que todo está funcionando correctamente:

{% highlight bash %}
$ npm run test

> 01_express_testing@1.0.0 test
> jest

PASS  tests/models/user/user.spec.js
User Model
✓ should return instance of User on create (1 ms)
✓ should throw an InvalidArgumentException error if email is not valid (4 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.212 s, estimated 1 s
Ran all test suites.
{% endhighlight %}

Y con esto ya tendríamos los primeros tests unitarios sencillos para nuestro backend usando [Jest][jest]{:target="_blank"}.

En los próximos capítulos realizaremos los tests de los demás componentes y también añadiremos algunos elementos que nos ayudarán a generar datos automáticos (como [FakerJS][faker-js]{:target="_blank"}).

_Actualización_: [Segundo capítulo disponible][testing-with-jest-ii]

[jest]: https://jestjs.io/es-ES/
[example-testing-repository]: https://github.com/DomingoLlanes/domingollanes.github.io-examples/tree/main/01_express_testing
[faker-js]: https://www.npmjs.com/package/@faker-js/faker

[testing-with-jest-ii]: /testing/node/jest/2022/11/16/testing-con-jest-ii.html
