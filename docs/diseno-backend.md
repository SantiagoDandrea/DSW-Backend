# Diseño del backend

Este documento describe la arquitectura, la organización del código y el modelo de datos del backend. El contrato de la API (endpoints, filtros, respuestas y reglas de acceso) está en [api.md](api.md).

## 1. Arquitectura general

```
Cliente → Express → Route → middlewares (JWT, roles) → validación → Controller → Service → Repository → Prisma → MySQL
```

Cada capa tiene una única responsabilidad. Esto permite probar la lógica de negocio sin la base de datos (los tests unitarios reemplazan el repository por simulaciones) y cambiar la forma de acceder a los datos sin tocar el resto del código.

## 2. Organización del código

El código se organiza por funcionalidad (una carpeta por entidad) y no por capa técnica: todo lo relacionado con Productos queda junto, en lugar de repartido entre carpetas globales de controllers, services y repositories.

```
prisma/
├── schema.prisma
└── migrations/
src/
├── app.js            configuración de Express y montaje de las rutas bajo /api
├── server.js         arranque del servidor
├── config/           env.js (variables de entorno) y database.js (cliente de Prisma)
├── errors/           ApiError y sus subclases
├── middlewares/      auth.middleware.js, error.middleware.js, not-found.middleware.js
├── modules/          un directorio por entidad
└── utils/            validation.utils.js (validación de montos)
tests/
├── unit/             tests unitarios
├── integration/      test de integración HTTP
└── *.http            pruebas manuales por módulo
docs/
```

Módulos: `auth`, `usuarios`, `localidades`, `categorias`, `marcas`, `productos`, `precios`, `proveedores`, `almacenes`, `stock`, `medios-pago`, `pedidos` y `envios`.

## 3. Estructura de un módulo

Todos los módulos tienen el mismo conjunto de archivos:

| Archivo | Responsabilidad |
|---|---|
| `<entidad>.routes.js` | Asocia cada URL con sus middlewares y con un método del controller. Sin lógica. |
| `<entidad>.validation.js` | Valida y normaliza el body, los parámetros y los filtros antes de llegar al controller. |
| `<entidad>.controller.js` | Traduce el pedido HTTP a una llamada al service y el resultado a una respuesta. Sin lógica de negocio ni consultas. |
| `<entidad>.service.js` | Lógica de negocio: reglas, cálculos y coordinación entre repositories. |
| `<entidad>.repository.js` | Único lugar donde se consulta la base de datos (Prisma), incluidas las transacciones. |
| `<entidad>.mapper.js` | Convierte las entidades de Prisma en la respuesta de la API; nunca se devuelve el objeto de Prisma tal cual (por ejemplo, la contraseña no se expone). |
| `index.js` | Punto de entrada del módulo. |

`auth` es la excepción: no tiene repository ni mapper propios porque reutiliza los de `usuarios`.

### Reglas de cada capa

- **Validación:** acepta solo los campos esperados y reemplaza `req.body` por los datos validados. Así el controller y el service reciben únicamente datos conocidos; por ejemplo, el registro público y la edición del perfil propio no aceptan el campo `rol`.
- **Controller:** cada método captura los errores con `try/catch` y los delega con `next(err)`; la respuesta de error la arma el middleware global.
- **Service:** puede usar varios repositories. Traduce los errores conocidos de la base a errores de la API (registro duplicado → 409, inexistente → 404, restricción de borrado → 409).
- **Repository:** expone operaciones por entidad. Las operaciones que deben ser atómicas (por ejemplo, crear un pedido y descontar el stock) usan transacciones de Prisma.

### Ejemplo: `POST /api/pedidos`

1. La ruta exige sesión (`authMiddleware`) y `validateCrearPedido` valida el body.
2. `pedidoController.crearPedido` llama a `pedidoService.crearPedido`.
3. El service comprueba que existan el usuario, el medio de pago y los productos; toma el precio vigente de cada producto; verifica el stock total y lo reparte entre los almacenes; calcula el costo de envío; y arma el total.
4. `pedidoRepository` crea el pedido, sus detalles y el envío, y descuenta el stock, todo en una transacción.
5. El mapper arma la respuesta y el controller la devuelve con el código 201.

## 4. Manejo de errores

- Las clases de error están en `src/errors/`: `ApiError` (base, con `statusCode`) y sus subclases `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404) y `ConflictError` (409).
- `error.middleware.js` responde `{ "error": "<mensaje>" }` con el código de la excepción cuando es una `ApiError`; ante cualquier otro error registra el detalle en el servidor y responde 500 con un mensaje genérico.
- `not-found.middleware.js` responde 404 a las rutas inexistentes.

## 5. Autenticación y autorización

- Las contraseñas se guardan con bcrypt. El login devuelve un JWT válido por 24 horas, firmado con `JWT_SECRET`, con el DNI y el rol del usuario.
- `authMiddleware` valida el token y deja el usuario en `req.usuario`. `requireRole(...)` restringe una ruta a ciertos roles.
- En los recursos que pertenecen a un cliente (pedidos y envíos), el service compara además el DNI del token con el dueño del recurso: un cliente solo accede a los propios, un `ADMIN` a todos.
- Los usuarios tienen un campo `activo`: los inactivos no pueden iniciar sesión.
- La tabla de acceso por módulo está en [api.md](api.md), sección "Roles y Autorizaciones".

## 6. Configuración

Las variables de entorno se leen en `src/config/env.js`: `DATABASE_URL`, `JWT_SECRET` y `PORT` (opcional, por defecto 3000). `src/config/database.js` crea el cliente de Prisma con el adaptador de MariaDB, que Prisma 7 requiere para conectarse a MySQL. El archivo `.env.example` indica los valores esperados y `.env` no se versiona.

## 7. Modelo de datos

El modelo completo está en [`prisma/schema.prisma`](../prisma/schema.prisma). Resumen de las entidades:

- **Usuario:** `dni` (clave primaria), nombre, apellido, `email` (único), password (hash), teléfono, `activo` (por defecto verdadero), `rol` (`ADMIN` o `CLIENTE`) y `localidadId` (obligatoria).
- **Localidad:** nombre, código postal y provincia; la combinación nombre + código postal es única.
- **Categoria**, **Marca:** nombre único.
- **Proveedor:** nombre, `cuit` (único) y teléfono.
- **Producto:** nombre, descripción, categoría, marca y proveedor (opcional). No guarda su precio: el precio vigente sale del historial.
- **ImagenProducto:** `url` y orden, asociadas a un producto.
- **Precio:** `valor` y `fechaDesde` de un producto; la combinación producto + fecha es única. El precio vigente es el de `fechaDesde` más reciente que ya rige.
- **Almacen:** descripción y dirección.
- **Stock:** `cantidad` de un producto en un almacén; la combinación producto + almacén es única, lo que evita dos registros del mismo producto en el mismo almacén.
- **MedioPago:** descripción única (por ejemplo, efectivo, transferencia o tarjeta).
- **Pedido:** usuario, medio de pago, `estado` (`PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `ENVIADO`, `ENTREGADO` o `CANCELADO`), fecha y total.
- **DetallePedido:** producto, almacén de origen, cantidad y `precioUnitario`, que es una copia del precio vigente al momento de la compra.
- **Envio:** un pedido tiene como máximo uno. Guarda domicilio de entrega, costo, fecha tentativa y de entrega (ambas opcionales) y `estado` (`PENDIENTE`, `EN_PREPARACION`, `EN_TRANSITO`, `ENTREGADO` o `CANCELADO`).

### Relaciones

```
Localidad ──< Usuario ──< Pedido
Categoria ──< Producto
Marca ──< Producto
Proveedor ──< Producto
MedioPago ──< Pedido

Producto ──< ImagenProducto
Producto ──< Precio
Producto ──< Stock >── Almacen
Producto ──< DetallePedido >── Almacen
Pedido ──< DetallePedido
Pedido ── Envio (1 : 1)
```

### Comportamiento ante el borrado

- **Cascade:** `Producto` → `ImagenProducto` y `Precio`; `Pedido` → `DetallePedido` y `Envio`. Estos registros no existen sin su padre.
- **Restrict:** el resto de las relaciones. No se puede eliminar un registro mientras haya otros que dependan de él (por ejemplo, una categoría con productos): la API responde 409.

## 8. Decisiones de diseño

- **Historial de precios:** el precio no es un campo de `Producto` sino una tabla con vigencias. Permite reconstruir el precio de un producto en cualquier fecha, y `DetallePedido.precioUnitario` conserva una copia para que cambiar el precio no altere las ventas ya hechas.
- **Stock por almacén:** cada almacén lleva su propio conteo. `DetallePedido` registra de qué almacén salió cada cantidad, de modo que al cancelar un pedido el stock se repone exactamente donde se descontó. La API devuelve los detalles consolidados por producto.
- **Disponibilidad pública:** el módulo Stock es administrativo. El catálogo informa la disponibilidad con un campo calculado en el producto (`disponible`), sin desglose por almacén.
- **Estado del envío derivado del pedido:** el estado del envío acompaña al del pedido. Cancelar solo el envío (por ejemplo, para retirar en el local) no cancela el pedido ni toca el stock.
- **Clave primaria natural en Usuario:** el DNI identifica a la persona, por lo que no se agrega un identificador artificial.
- **Desactivación de usuarios:** el campo `activo` permite impedir el acceso de un usuario sin perder el historial de sus pedidos. Por eso `DELETE /usuarios/:dni` es una baja lógica y no borra el registro.
