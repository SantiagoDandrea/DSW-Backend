# Arquitectura General
```
Cliente (React)

↓

API REST (Express)

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma ORM

↓

MySQL
```

No cambiaría eso.

Es simple.

Escalable.

Muy utilizada.

Muy fácil de defender frente a la cátedra.

---

# Organización del código

Elegiría **Feature Based**.

No por capas.

O sea...

No esto:

```
controllers/

services/

repositories/

models/
```

Sino esto:

```
modules/

    categorias/

    productos/

    pedidos/

    usuarios/
```

¿Por qué?

Porque cuando el proyecto tenga 20 entidades, todo lo relacionado con Productos estará junto.

---

# Arquitectura interna de un módulo

Todos los módulos tendrán exactamente la misma estructura.

Ejemplo:

```
categorias/

    categoria.routes.js

    categoria.controller.js

    categoria.service.js

    categoria.repository.js

    categoria.validation.js

    categoria.mapper.js

    index.js
```

Todos.

Sin excepción.

---

# Responsabilidad de cada capa

## Route

Única responsabilidad.

```
Recibir la URL.

↓

Llamar al Controller.
```

Nada más.

---

## Controller

Responsabilidad.

```
Recibir Request

↓

Invocar Service

↓

Construir Response
```

No tiene lógica de negocio.

No consulta Prisma.

No calcula.

No valida reglas.

---

Ejemplo.

```
POST /productos
```

Controller

```
request

↓

service.crearProducto()

↓

response
```

Nada más.

---

# Service

Acá vive el negocio.

Ejemplo.

```
POST /pedidos
```

Service

```
validar stock

↓

calcular total

↓

crear pedido

↓

descontar stock

↓

crear envío

↓

devolver resultado
```

Todo eso pertenece al Service.

---

# Repository

Única responsabilidad.

Hablar con Prisma.

Nada más.

Ejemplo.

```
repository.obtenerProducto()

↓

prisma.product.findUnique()
```

---

# Prisma

Prisma nunca será utilizado fuera del Repository.

Nunca.

Ni desde Controller.

Ni desde Service.

Eso permite cambiar Prisma por otro ORM sin modificar la lógica del negocio.

---

# Validaciones

No validaría dentro del Controller.

Crearía validadores independientes.

```
POST /usuarios

↓

validator

↓

controller

↓

service
```

El Controller recibe datos ya validados.

---

# Middleware

Los middlewares tendrán solamente responsabilidades transversales.

Por ejemplo.

```
JWT

Logger

Manejo de errores

CORS

Not Found

Roles
```

Nunca lógica de negocio.

---

# Manejo de errores

Centralizado.

Nunca esto.

```
try {

} catch {

}
```

en todos los Controllers.

Haría un middleware global.

```
Controller

↓

throw Error

↓

Error Middleware

↓

Response
```

Muchísimo más limpio.

---

# DTO

No usaría DTO por ahora.

¿Por qué?

Proyecto chico.

API sencilla.

Más adelante podrían agregarse.

Pero hoy agregan complejidad innecesaria.

---

# Mapper

Sí.

Muy pequeño.

Ejemplo.

```
Producto Prisma

↓

ProductoResponse
```

Así nunca exponemos directamente el objeto que devuelve Prisma.

---

# Configuración

Toda la configuración en un solo lugar.

```
config/

    env.js

    database.js
```

---

# Base de datos

```
prisma/

    schema.prisma

    migrations/

    seed.js
```

No mezclar Prisma dentro de src.

Lo dejaría separado.

---

# Utils

Muy pequeños.

```
utils/

    pagination.js

    dates.js
```

Nada de poner media aplicación ahí.

---

# Organización final

Yo haría exactamente esto.

```
backend/

│

├── prisma/

│      schema.prisma
│      seed.js
│      migrations/

│

├── src/

│      app.js
│      server.js
│
│      config/
│
│      middlewares/
│
│      routes/
│
│      modules/
│
│      utils/
│
│      errors/
│
└── package.json
```

---

Y dentro de modules.

```
modules/

    auth/

    usuarios/

    localidades/

    categorias/

    marcas/

    productos/

    proveedores/

    inventario/

    almacenes/

    medios-pago/

    pedidos/

    envios/
```

Todos iguales.

---

# Flujo completo

Un ejemplo.

```
POST /pedidos
```

```
Cliente

↓

Express

↓

Route

↓

JWT Middleware

↓

Controller

↓

PedidoService

↓

ProductoRepository

↓

PedidoRepository

↓

StockRepository

↓

EnvioRepository

↓

Prisma

↓

MySQL
```

Y vuelve.

```
MySQL

↓

Prisma

↓

Repositories

↓

Service

↓

Controller

↓

Cliente
```

---

# Convenciones

## Un Controller

Una entidad.

```
ProductoController

PedidoController

UsuarioController
```

---

## Un Service

Una entidad.

```
ProductoService

PedidoService
```

---

## Un Repository

Una entidad.

```
ProductoRepository
```

---

## Un Router

Una entidad.

```
producto.routes.js
```

---

## Un módulo

Una responsabilidad.

Nunca un módulo mezclará:

```
Productos

+

Pedidos
```
# DER
## Mi propuesta de modelo relacional

### Usuario

|Campo|Tipo|Restricción|
|---|---|---|
|dni|String|PK|
|nombre|String||
|apellido|String||
|email|String|UNIQUE|
|password|String||
|telefono|String||
|direccion|String||
|rol|Enum||
|localidadId|Int|FK|

---

### Localidad

|Campo|Tipo|Restricción|
|---|---|---|
|id|Int|PK|
|nombre|String||
|codigoPostal|String||
|provincia|String||

---

### Categoria

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|

---

### Marca

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|

---

### Proveedor

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|
|cuit|String|
|telefono|String|

---

### Producto

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|
|descripcion|String|
|imagen|String?|
|categoriaId|Int|
|marcaId|Int|
|proveedorId|Int|

No tendría un campo `precioActual`.

El precio vigente se obtiene del historial.

---

### Precio

|Campo|Tipo|
|---|---|
|id|Int|
|productoId|Int|
|valor|Decimal|
|fechaDesde|DateTime|

---

### Almacen

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|
|direccion|String|

Agregaría `nombre`.

Si algún día existen varios almacenes es mucho más cómodo que decir "Almacén 1".

---

### Stock

|Campo|Tipo|
|---|---|
|id|Int|
|productoId|Int|
|almacenId|Int|
|cantidad|Int|

Y además impondría una restricción única:

```
(productoId, almacenId)
```

Para evitar tener dos registros del mismo producto en el mismo almacén.

---

### MedioPago

|Campo|Tipo|
|---|---|
|id|Int|
|nombre|String|

Por ejemplo:

- Efectivo
- Transferencia
- Tarjeta

---

### Pedido

|Campo|Tipo|
|---|---|
|id|Int|
|usuarioDni|String|
|medioPagoId|Int|
|estado|Enum|
|fecha|DateTime|
|total|Decimal|

---

### DetallePedido

|Campo|Tipo|
|---|---|
|id|Int|
|pedidoId|Int|
|productoId|Int|
|cantidad|Int|
|precioUnitario|Decimal|

Este `precioUnitario` es la copia del precio vigente al momento de la compra.

---

### Envio

|Campo|Tipo|
|---|---|
|id|Int|
|pedidoId|Int|
|costo|Decimal|
|domicilioEntrega|String|
|fechaTentativa|DateTime|
|fechaEntregado|DateTime?|
|estado|Enum|

---

# Relaciones

```
Localidad
    │
    └──────< Usuario

Categoria
    │
    └──────< Producto

Marca
    │
    └──────< Producto

Proveedor
    │
    └──────< Producto

Producto
    ├──────< Precio
    ├──────< Stock
    └──────< DetallePedido

Almacen
    │
    └──────< Stock

Usuario
    │
    └──────< Pedido

MedioPago
    │
    └──────< Pedido

Pedido
    ├──────< DetallePedido
    └─────── Envio (1 : 1)
```


# Proximo
## 1. Estructura del proyecto ⭐⭐⭐⭐⭐

Crear toda la estructura del backend.

Por ejemplo:

```
src/

app.js
server.js
router.js

config/

middlewares/

errors/

utils/

modules/

    auth/

    usuarios/

    localidades/

    categorias/

    marcas/

    productos/

    proveedores/

    almacenes/

    stock/

    pedidos/

    envios/

    medios-pago/
```

Eso ya está decidido por la arquitectura que definimos.

---

## 2. Crear todos los módulos ⭐⭐⭐⭐⭐

Cada módulo puede tener sus archivos vacíos.

Por ejemplo.

```
categorias/

categoria.routes.js

categoria.controller.js

categoria.service.js

categoria.repository.js

categoria.validation.js

categoria.mapper.js

index.js
```

Y repetir la misma plantilla para todos los módulos.

---

## 3. Configurar Express ⭐⭐⭐⭐⭐

Crear:

```
app.js

server.js

router.js
```

Configurar:

- express
- cors
- dotenv
- express.json()

Todavía sin lógica.

---

## 4. Middleware global ⭐⭐⭐⭐☆

Pueden implementar:

```
middlewares/

error.middleware.js

not-found.middleware.js
```

No dependen de la base.

---

## 5. Manejo de errores ⭐⭐⭐⭐☆

Crear:

```
errors/

ApiError.js

NotFoundError.js

ValidationError.js
```

Después todos los módulos los reutilizarán.

---

## 6. Configuración ⭐⭐⭐⭐☆

```
config/

env.js
```

Leer

```
PORT

DATABASE_URL

JWT_SECRET
```

Aunque JWT todavía no exista.

---

## 7. Documentación ⭐⭐⭐⭐⭐

La documentación de la API ya está prácticamente definida.

Pueden empezar a documentarla con Swagger/OpenAPI o dejar preparados los archivos Markdown para cumplir con la documentación requerida por la cátedra.

---

## 8. GitHub Projects ⭐⭐⭐⭐☆

Ya pueden crear:

- Backlog
- Milestones
- Issues
- Labels

Sin tocar una línea de código.

---

# Lo que yo haría mañana

Si yo fuera el Tech Lead, dividiría al equipo así:

### Integrante 1

Diseña el DER.

↓

Hace el `schema.prisma`.

↓

Hace las migraciones.

---

### Integrante 2

Construye toda la infraestructura.

```
src/

config/

middlewares/

errors/

router.js

server.js

app.js
```

---

### Integrante 3

Crea todos los módulos vacíos.

```
categorias/

productos/

usuarios/

...
```

Con exactamente la misma estructura.

---

### Integrante 4

Configura la calidad del proyecto.

- ESLint
- Prettier
- `.gitignore`
- `.env.example`
- Scripts
- README
- GitHub Actions (si deciden usar CI)
- Documentación inicial