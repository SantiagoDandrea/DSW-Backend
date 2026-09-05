# API REST

## Base URL

/api/

---

# Auth

## POST /auth/login

Inicia sesión y devuelve un JWT válido por 24hs.

Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Respuesta (200):

```json
{
  "token": "string",
  "usuario": { "dni": "...", "nombre": "...", "...": "mismo formato que GET /usuarios/:dni" }
}
```

- Si el email no existe o la contraseña no coincide, responde 401 con un mensaje genérico ("Email o contraseña incorrectos.") — no distingue cuál de los dos fue el problema, por seguridad.

## POST /auth/logout

Cierra la sesión. Como el token es JWT (stateless), el servidor no lo invalida ni lo revoca — quien debe descartarlo es el cliente. Este endpoint no requiere estar autenticado y siempre responde 200.

## GET /auth/me

Devuelve los datos del usuario autenticado (mismo formato que `GET /usuarios/:dni`, sin `password`).

Requiere el header `Authorization: Bearer <token>` con un token válido.

- Sin header, con formato inválido, o con un token vencido/con firma inválida: 401.
- Si el usuario del token ya no existe en la base (fue eliminado después de emitirse el token): 401.

---

# Usuarios

## GET /usuarios

Listado de usuarios. Incluye la localidad resuelta (`{ id, nombre }`) de cada uno. La respuesta nunca incluye `password`.

Filtros (query params, todos opcionales):

- nombre (búsqueda parcial)
- apellido (búsqueda parcial)
- rol (`ADMIN` o `CLIENTE`)

## GET /usuarios/:dni

Detalle de un usuario. Incluye la localidad resuelta. Nunca incluye `password`.

## POST /usuarios

Crea un usuario.

Body:

```json
{
  "dni": "30111222",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "telefono": "string",
  "rol": "ADMIN | CLIENTE",
  "localidadId": 1
}
```

- `dni` es la clave primaria (no autoincremental): 7 u 8 dígitos numéricos, lo define el cliente.
- `password`: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número. Se guarda hasheado (bcrypt) — nunca se persiste ni se devuelve en texto plano.
- `email` debe ser único (409 si ya existe otro usuario con ese email).
- `localidadId` debe existir (404 si no).

## PUT /usuarios/:dni

Actualiza los datos del usuario (nombre, apellido, email, teléfono, rol, localidad). El `dni` no se puede modificar por esta vía.

`password` es opcional: si se manda, se valida y se hashea de nuevo, reemplazando el hash guardado. Si no se manda, la contraseña actual no se toca.

## DELETE /usuarios/:dni

Elimina un usuario. Falla con 409 si tiene pedidos asociados.

---

# Localidades

## GET /localidades
Obtiene todas las localidades.

## GET /localidades/:id
Obtiene una localidad.

## POST /localidades
Crea una localidad.

## PUT /localidades/:id
Actualiza una localidad.

## DELETE /localidades/:id
Elimina una localidad.

---

# Productos

## GET /productos

Listado de productos. Incluye categoría, marca, proveedor, precio vigente e imágenes de cada uno.

Filtros (query params, todos opcionales):

- categoriaId
- marcaId
- nombre (búsqueda parcial)
- precioMin
- precioMax (filtran sobre el precio vigente)

## GET /productos/:id

Detalle del producto. Incluye categoría, marca, proveedor, precio vigente e imágenes.

Nota: `stock` y `almacenes` todavía no se incluyen — se agregan cuando se implemente ese módulo.

## POST /productos

Crea un producto junto con su primer precio, en una sola operación atómica.

Body:

```json
{
  "nombre": "string",
  "descripcion": "string",
  "categoriaId": 1,
  "marcaId": 1,
  "proveedorId": 1,
  "precio": 199.99
}
```

`categoriaId`, `marcaId` y `proveedorId` deben existir (404 si no).

## PUT /productos/:id

Actualiza los datos del producto (nombre, descripción, categoría, marca, proveedor). No modifica el precio — para eso usar el endpoint de precios.

## DELETE /productos/:id

Elimina un producto. Falla con 409 si tiene stock o pedidos asociados.

---

## Precios

Un producto puede tener múltiples precios y se conserva todo el historial. La combinación `productoId + fechaDesde` es única, por lo que no puede haber dos precios del mismo producto con la misma fecha de vigencia. El precio vigente se determina tomando el precio con la `fechaDesde` más reciente que corresponda.

### GET /precios

Obtiene todos los precios registrados.

Filtros (query params, todos opcionales):

- productoId
- fechaDesde
- fechaHasta

### GET /precios/:id

Obtiene un precio.

### POST /precios

Crea un precio para un producto.

Body:

```json
{
  "productoId": 1,
  "valor": 199.99,
  "fechaDesde": "2026-09-02T00:00:00.000Z"
}
```

productoId debe corresponder a un producto existente.

No puede existir más de un precio para el mismo producto con la misma fechaDesde.

### PUT /precios/:id

Actualiza un precio.

### DELETE /precios/:id

Elimina un precio.

### GET /productos/:id/precios

Obtiene el historial de precios del producto, ordenado por fechaDesde de forma descendente.


---

## Imágenes

### GET /productos/:id/imagenes

Obtiene todas las imágenes del producto.

### POST /productos/:id/imagenes

Agrega una imagen (`{ "url": string, "orden"?: number }`).

### DELETE /productos/imagenes/:id

Elimina una imagen por su propio id (no requiere el id del producto).

---

# Categorías

## GET /categorias

## GET /categorias/:id

## POST /categorias

## PUT /categorias/:id

## DELETE /categorias/:id

---

# Marcas

## GET /marcas

## GET /marcas/:id

## POST /marcas

## PUT /marcas/:id

## DELETE /marcas/:id

---

# Proveedores

## GET /proveedores

## GET /proveedores/:id

## POST /proveedores

## PUT /proveedores/:id

## DELETE /proveedores/:id

---

# Inventario

## GET /stock

Consulta el stock.

Filtros:

- producto
- almacén

## GET /stock/:id

Detalle del registro de stock.

## POST /stock

Registra stock.

## PUT /stock/:id

Actualiza stock.

## DELETE /stock/:id

Elimina un registro de stock.

---

# Almacenes

## GET /almacenes

## GET /almacenes/:id

## POST /almacenes

## PUT /almacenes/:id

## DELETE /almacenes/:id

---

# Medios de Pago

## GET /medios-pago

Obtiene los medios de pago disponibles.

## GET /medios-pago/:id

Obtiene un medio de pago.

## POST /medios-pago

Crea un medio de pago.

## PUT /medios-pago/:id

Actualiza un medio de pago.

## DELETE /medios-pago/:id

Elimina un medio de pago.

---

# Pedidos

Todos los endpoints de pedidos requieren autenticación mediante el header:
`Authorization: Bearer <token>`

## GET /pedidos

Listado de pedidos. Si quien consulta es `CLIENTE`, solo se devuelven los pedidos propios. Si es `ADMIN`, puede consultar todos los pedidos o filtrar por usuario.

Filtros (query params, todos opcionales):

- `estado`: `PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `ENVIADO`, `ENTREGADO`, `CANCELADO`
- `fechaDesde`: fecha/hora mínima en formato ISO
- `fechaHasta`: fecha/hora máxima en formato ISO
- `usuario`: DNI del usuario (disponible solo para `ADMIN`)

Respuesta (200):

```json
[
  {
    "id": 1,
    "fecha": "2026-09-04T23:00:00.000Z",
    "estado": "PENDIENTE",
    "total": 103000,
    "cliente": {
      "dni": "40111222",
      "nombre": "Carlos",
      "apellido": "Perez",
      "email": "carlos@test.com"
    },
    "medioPago": {
      "id": 1,
      "descripcion": "Transferencia Bancaria"
    },
    "envio": {
      "id": 1,
      "domicilioEntrega": "Av. 25 de Mayo 123",
      "costo": 3000,
      "estado": "PENDIENTE"
    }
  }
]
```

## GET /pedidos/:id

Detalle completo del pedido. Un `CLIENTE` solo puede consultar el detalle de sus propios pedidos (403 si intenta ver uno ajeno). Un `ADMIN` puede consultar cualquier pedido.

Respuesta (200):

```json
{
  "id": 1,
  "fecha": "2026-09-04T23:00:00.000Z",
  "estado": "PENDIENTE",
  "total": 103000,
  "cliente": {
    "dni": "40111222",
    "nombre": "Carlos",
    "apellido": "Perez",
    "email": "carlos@test.com",
    "telefono": "3471112233",
    "localidad": {
      "id": 1,
      "nombre": "Las Parejas",
      "provincia": "Santa Fe",
      "codigoPostal": "2505"
    }
  },
  "medioPago": {
    "id": 1,
    "descripcion": "Transferencia Bancaria"
  },
  "detalles": [
    {
      "id": 1,
      "productoId": 1,
      "producto": {
        "id": 1,
        "nombre": "Taladro Percutor 750W",
        "descripcion": "Taladro con velocidad variable y percutor"
      },
      "almacenId": 1,
      "almacen": {
        "id": 1,
        "descripcion": "Local Físico Central",
        "direccion": "Calle 20 Nro 500"
      },
      "cantidad": 6,
      "precioUnitario": 100000,
      "subtotal": 600000
    },
    {
      "id": 2,
      "productoId": 1,
      "producto": {
        "id": 1,
        "nombre": "Taladro Percutor 750W",
        "descripcion": "Taladro con velocidad variable y percutor"
      },
      "almacenId": 2,
      "almacen": {
        "id": 2,
        "descripcion": "Depósito Industrial",
        "direccion": "Ruta 178 Km 2"
      },
      "cantidad": 4,
      "precioUnitario": 100000,
      "subtotal": 400000
    }
  ],
  "envio": {
    "id": 1,
    "domicilioEntrega": "Av. 25 de Mayo 123",
    "costo": 3000,
    "fechaTentativa": null,
    "fechaEntregado": null,
    "estado": "PENDIENTE"
  }
}
```

## POST /pedidos

Crea un pedido completo.
- El usuario normal se asocia automáticamente a partir del token JWT.
- Un administrador puede especificar `usuarioDni` en el cuerpo para registrar un pedido a nombre de otro cliente.
- El cliente no envía precios, totales ni estados; son determinados por el backend.
- Se utiliza el precio vigente de cada producto (`fechaDesde <= fecha actual`).
- Se verifica el stock total disponible entre todos los almacenes (Local y Depósito). Si es suficiente, se descuenta de forma atómica y transaccional.
- Si el pedido requiere envío:
  - Dentro de Las Parejas: costo = $3.000.
  - Fuera de Las Parejas: costo = $15.000.
  - Se genera el registro de Envio (sin inventar fecha tentativa).
- Si no requiere envío (retiro en local), no se genera Envio ni costo de flete.

Body:

```json
{
  "productos": [
    {
      "productoId": 1,
      "cantidad": 10
    }
  ],
  "medioPagoId": 1,
  "envio": {
    "requiereEnvio": true,
    "domicilioEntrega": "Av. 25 de Mayo 123"
  }
}
```

Respuesta (201): Mismo formato detallado que `GET /pedidos/:id`.

## PUT /pedidos/:id

Actualiza datos permitidos de un pedido (`medioPagoId`, `domicilioEntrega`).
- Solo permitido para `ADMIN`.
- Solo permitido si el pedido se encuentra en estado `PENDIENTE`.
- No permite alterar productos, cantidades, precios ni totales para preservar la integridad del stock y la venta.

Body (al menos un campo):

```json
{
  "medioPagoId": 2,
  "domicilioEntrega": "Nueva dirección 456"
}
```

Respuesta (200): Pedido actualizado.

## DELETE /pedidos/:id

Elimina un pedido.
- Exclusivo de `ADMIN`.
- Solo permitido si el pedido se encuentra en estado `CANCELADO` (409 si tiene otro estado).

Respuesta (204 No Content).

---

## Cambio de estado

### PATCH /pedidos/:id/estado

Actualiza el estado del pedido siguiendo la máquina de estados.
- Exclusivo de `ADMIN`.
- Transiciones permitidas:
  - `PENDIENTE` → `CONFIRMADO` o `CANCELADO`
  - `CONFIRMADO` → `EN_PREPARACION` o `CANCELADO`
  - `EN_PREPARACION` → `ENVIADO` o `CANCELADO`
  - `ENVIADO` → `ENTREGADO`
- No se permiten transiciones hacia atrás (409 Conflict).
- Si se pasa a `CANCELADO`, se revierte el stock automáticamente.

Body:

```json
{
  "estado": "CONFIRMADO | EN_PREPARACION | ENVIADO | ENTREGADO | CANCELADO"
}
```

Respuesta (200): Pedido actualizado.

---

## Cancelar pedido

### POST /pedidos/:id/cancelar

Cancela un pedido y revierte el stock descontado.
- `CLIENTE` puede cancelar sus propios pedidos si están en estado cancelable.
- `ADMIN` puede cancelar cualquier pedido cancelable.
- Solo pueden cancelarse pedidos en estado `PENDIENTE`, `CONFIRMADO` o `EN_PREPARACION`.
- Pedidos en estado `ENVIADO`, `ENTREGADO` o ya `CANCELADO` no pueden cancelarse (409 Conflict).
- **Reversión atómica de stock**: El stock se devuelve exactamente a los mismos almacenes de donde fue descontado originalmente.

Respuesta (200): Pedido cancelado.

# Envíos

`Envio` representa la entrega a domicilio asociada a un pedido.

### Reglas generales y generación
- **Generación**: El registro `Envio` se genera de manera automática y transaccional como parte de la creación del pedido (`POST /pedidos`) cuando se especifica `envio.requiereEnvio: true` y se proporciona `envio.domicilioEntrega`.
- **Cuándo existe**: Si el pedido no requiere envío (retiro en local), **no** se genera ningún registro de `Envio`, el costo de envío es `$0` y el total del pedido equivale al subtotal de los productos.
- **Cálculo del costo**: El costo pertenece exclusivamente al módulo de Envíos y se calcula automáticamente en el backend según la localidad del usuario asociado:
  - **Las Parejas (Santa Fe)**: `$3.000`
  - **Cualquier otra localidad (resto del país)**: `$15.000`
  - El cliente **no** puede enviar arbitrariamente el costo del flete.
  - El total del pedido utiliza dicho costo: `subtotal + costoEnvio = total`.
- **Fecha tentativa**: El campo `fechaTentativa` es opcional (`null`), ya que el sistema no realiza estimaciones automáticas de tiempos ni cálculo de rutas.

### Estados del Envío y sincronización con Pedido
El ciclo de vida del envío depende directamente del estado del pedido asociado:
- Pedido `PENDIENTE` → Envío `PENDIENTE`
- Pedido `CONFIRMADO` → Envío `PENDIENTE`
- Pedido `EN_PREPARACION` → Envío `PENDIENTE`
- Pedido `ENVIADO` → Envío `EN_TRANSITO`
- Pedido `ENTREGADO` → Envío `ENTREGADO` (registra automáticamente `fechaEntregado`)
- Pedido `CANCELADO` → Envío `CANCELADO`

### Cancelación independiente de Envío vs. Cancelación de Pedido
- **Cancelar Pedido (`POST /pedidos/:id/cancelar`)**:
  - Cambia el estado del pedido a `CANCELADO`.
  - Cambia el estado del envío a `CANCELADO` (si existe).
  - **Devuelve el stock** de los productos a los almacenes de origen de forma atómica.
- **Cancelar Envío (`POST /envios/:id/cancelar`)**:
  - Aplica cuando el cliente decide retirar el pedido por el local/sucursal y ya no requiere despacho a domicilio.
  - Cambia el estado del envío a `CANCELADO`.
  - **El pedido permanece activo** y en su estado actual (no se cancela).
  - **Se resta el costo de envío del total del pedido** (`total = subtotal`).
  - **NO se modifica el stock** ni los productos del pedido.
  - Operación atómica y transaccional.
  - Si el pedido cambia de estado posteriormente (por ejemplo, avanza en preparación), el envío **permanece `CANCELADO`** y no resucita a estados activos.

---

## GET /envios

Listado de envíos.
- `ADMIN`: Consulta todos los envíos.
- `CLIENTE`: Consulta únicamente los envíos vinculados a sus propios pedidos.

Filtros (query params, opcionales):
- `estado` (`PENDIENTE | EN_PREPARACION | EN_TRANSITO | ENTREGADO | CANCELADO`)
- `pedidoId` (número entero positivo)

Respuesta (200):
```json
[
  {
    "id": 1,
    "pedidoId": 15,
    "domicilioEntrega": "Av. 25 de Mayo 123",
    "costo": 3000,
    "fechaTentativa": null,
    "fechaEntregado": null,
    "estado": "PENDIENTE",
    "pedido": {
      "id": 15,
      "fecha": "2026-09-05T12:00:00.000Z",
      "estado": "PENDIENTE",
      "total": 103000,
      "cliente": {
        "dni": "40111222",
        "nombre": "Carlos",
        "apellido": "Perez",
        "email": "carlos@test.com"
      }
    }
  }
]
```

## GET /envios/:id

Obtiene el detalle completo de un envío por su ID.
- `ADMIN`: Puede consultar cualquier envío.
- `CLIENTE`: Solo puede consultar si el envío pertenece a uno de sus pedidos (403 si pertenece a otro).

Respuesta (200): Mismo formato con detalle completo del pedido, cliente y artículos.

## PUT /envios/:id

Actualiza el domicilio de entrega de un envío.
- Permitido para `ADMIN` o el `CLIENTE` dueño del pedido.
- Solo permitido si el envío y el pedido se encuentran en estado `PENDIENTE` (409 Conflict en otros estados).

Body:
```json
{
  "domicilioEntrega": "Calle 22 Nro 750"
}
```

Respuesta (200): Envío actualizado.

## POST /envios/:id/cancelar

Cancela la entrega a domicilio de forma independiente (ej. cambio a retiro en sucursal).
- Permitido para `ADMIN` o el `CLIENTE` dueño del pedido.
- Solo puede cancelarse si el envío está en estado `PENDIENTE` o `EN_PREPARACION`, y el pedido en `PENDIENTE`, `CONFIRMADO` o `EN_PREPARACION`.
- Si el envío ya fue entregado, está en tránsito o ya fue cancelado: 409 Conflict.
- Si el pedido está cancelado, enviado o entregado: 409 Conflict.
- Actualiza el estado del envío a `CANCELADO` y descuenta el costo del flete del `total` del pedido.
- No altera el stock ni el estado del pedido.

Respuesta (200):
```json
{
  "id": 1,
  "pedidoId": 15,
  "domicilioEntrega": "Av. 25 de Mayo 123",
  "costo": 3000,
  "fechaTentativa": null,
  "fechaEntregado": null,
  "estado": "CANCELADO",
  "pedido": {
    "id": 15,
    "fecha": "2026-09-05T12:00:00.000Z",
    "estado": "PENDIENTE",
    "total": 100000,
    "cliente": {
      "dni": "40111222",
      "nombre": "Carlos",
      "apellido": "Perez",
      "email": "carlos@test.com"
    }
  }
}
```

---

# Roles

Cliente

Puede:

- consultar productos
- realizar pedidos (con o sin entrega a domicilio)
- consultar sus pedidos y el detalle de sus pedidos
- consultar sus envíos
- cancelar sus propios pedidos (cuando su estado lo permite)
- cancelar el envío de sus pedidos para retiro en sucursal (cuando su estado lo permite)
- consultar su perfil

Administrador

Puede acceder a todos los endpoints y realizar todas las operaciones administrativas.
