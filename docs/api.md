# API REST

## Base URL

/api/

## Errores

Los errores se responden con el formato `{ "error": "mensaje" }`. Si el cuerpo de la solicitud no es un JSON válido, se responde 400 ("El cuerpo de la solicitud no es un JSON válido."). Si falta el cuerpo, cada endpoint responde el 400 de validación del primer campo obligatorio.

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

## POST /auth/register

Registro público: crea una cuenta de cliente y devuelve un JWT de una, igual que `/login` (no hace falta loguearse aparte después).

Body:

```json
{
  "dni": "30111222",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "telefono": "string",
  "provincia": "Santa Fe",
  "localidad": "Rosario",
  "codigoPostal": "2000"
}
```

> Nota: Por compatibilidad con clientes existentes o migraciones, también se admite enviar `"localidadId": 1` en lugar de la terna provincia/localidad/código postal.

Respuesta (201):

```json
{
  "token": "string",
  "usuario": { "dni": "...", "nombre": "...", "...": "mismo formato que GET /usuarios/:dni" }
}
```

- El rol se fuerza siempre a `CLIENTE` en el servidor — si se manda `rol` en el body, se ignora, no se puede crear una cuenta ADMIN por acá.
- Para la localidad se valida y procesa la combinación `{ provincia, localidad, codigoPostal }` (si la localidad no existe en la base, el sistema la crea dinámicamente) o bien un `localidadId` válido existente.
- Mismas validaciones que `POST /usuarios` (dni, password, email único), sin el campo `rol`.

## POST /auth/logout

Cierra la sesión. Como el token es JWT (stateless), el servidor no lo invalida ni lo revoca — quien debe descartarlo es el cliente. Este endpoint no requiere estar autenticado y siempre responde 200.

## GET /auth/me

Devuelve los datos del usuario autenticado (mismo formato que `GET /usuarios/:dni`, sin `password`).

Requiere el header `Authorization: Bearer <token>` con un token válido.

- Sin header, con formato inválido, o con un token vencido/con firma inválida: 401.
- Si el usuario del token ya no existe o fue desactivado después de emitirse el token: 401.

## PUT /auth/me

Actualiza el perfil del usuario autenticado (nombre, apellido, email, teléfono, localidad, y opcionalmente password).

Body (los que se quieran actualizar):

```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "provincia": "Santa Fe",
  "localidad": "Rosario",
  "codigoPostal": "2000",
  "localidadId": 1,
  "password": "string"
}
```

- `rol` y `dni` no son editables por esta vía — si se mandan en el body, se ignoran.
- Para actualizar la ubicación se puede enviar `{ provincia, localidad, codigoPostal }` (resolución/alta dinámica) o `localidadId`.
- `password` es opcional: si no se manda, no se toca la actual.

---

# Usuarios

Todos los endpoints de este módulo son administrativos y requieren autenticación con rol `ADMIN` (`Authorization: Bearer <token_admin>`).

> Nota: Los clientes no tienen acceso a este módulo y consultan su propio perfil exclusivamente a través de `GET /auth/me`.

## GET /usuarios

Listado de usuarios. Requiere rol `ADMIN`. Incluye la localidad resuelta (`{ id, nombre, provincia, codigoPostal }`) de cada uno. La respuesta nunca incluye `password`.

Filtros (query params, todos opcionales):

- nombre (búsqueda parcial)
- apellido (búsqueda parcial)
- rol (`ADMIN` o `CLIENTE`)

## GET /usuarios/:dni

Detalle de un usuario. Requiere rol `ADMIN`. Incluye la localidad resuelta (`{ id, nombre, provincia, codigoPostal }`). Nunca incluye `password`.

## POST /usuarios

Crea un usuario. Requiere rol `ADMIN`.

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

Actualiza los datos del usuario (nombre, apellido, email, teléfono, rol, localidad, `activo`). Requiere rol `ADMIN`. El `dni` no se puede modificar por esta vía.

`password` es opcional: si se manda, se valida y se hashea de nuevo, reemplazando el hash guardado. Si no se manda, la contraseña actual no se toca.

## DELETE /usuarios/:dni

Da de baja al usuario de forma lógica: no se borra, se marca `activo: false`. Requiere rol `ADMIN`. Responde 204, o 404 si el usuario no existe.

El usuario conserva sus pedidos y sigue apareciendo en el listado, pero no puede iniciar sesión. Se reactiva con `PUT /usuarios/:dni` enviando `activo: true`.

---

# Localidades

Las operaciones de consulta (`GET`) son públicas para permitir la navegación y selección de localidades. Las operaciones de modificación (`POST`, `PUT`, `DELETE`) requieren rol `ADMIN`.

## GET /localidades
Obtiene todas las localidades. (Público)

## GET /localidades/:id
Obtiene una localidad. (Público)

## POST /localidades
Crea una localidad. (Requiere `ADMIN`)

## PUT /localidades/:id
Actualiza una localidad. (Requiere `ADMIN`)

## DELETE /localidades/:id
Elimina una localidad. (Requiere `ADMIN`)

---

# Productos

Las operaciones de consulta (`GET`) del catálogo de productos e imágenes son públicas. Las operaciones de creación, edición y eliminación de productos e imágenes requieren rol `ADMIN`.

## GET /productos

Listado de productos. (Público). Incluye categoría, marca, proveedor, precio vigente, disponibilidad e imágenes de cada uno.

- `disponible`: booleano — `true` si hay stock en algún almacén. No expone el desglose por almacén, eso es información administrativa (ver módulo Stock).

Filtros (query params, todos opcionales):

- categoriaId
- marcaId
- nombre (búsqueda parcial)
- precioMin
- precioMax (filtran sobre el precio vigente)

## GET /productos/:id

Detalle del producto. (Público). Incluye categoría, marca, proveedor, precio vigente, disponibilidad e imágenes (mismo campo `disponible` que en el listado).

Nota: el desglose de stock por almacén es información administrativa, no se expone acá — ver módulo Stock.

## POST /productos

Crea un producto junto con su primer precio, en una sola operación atómica. Requiere rol `ADMIN`.

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

Actualiza los datos del producto (nombre, descripción, categoría, marca, proveedor). Requiere rol `ADMIN`. No modifica el precio — para eso usar el endpoint de precios.

## DELETE /productos/:id

Elimina un producto. Requiere rol `ADMIN`. Falla con 409 si tiene stock o pedidos asociados.

---

# Precios

Todos los endpoints de precios son administrativos y requieren autenticación con rol `ADMIN`.

Un producto puede tener múltiples precios y se conserva todo el historial. La combinación `productoId + fechaDesde` es única, por lo que no puede haber dos precios del mismo producto con la misma fecha de vigencia. El precio vigente se determina tomando el precio con la `fechaDesde` más reciente que corresponda.

### GET /precios

Obtiene todos los precios registrados. Requiere rol `ADMIN`.

Filtros (query params, todos opcionales):

- productoId
- fechaDesde
- fechaHasta

### GET /precios/:id

Obtiene un precio. Requiere rol `ADMIN`.

### POST /precios

Crea un precio para un producto. Requiere rol `ADMIN`.

Body:

```json
{
  "productoId": 1,
  "valor": 199.99,
  "fechaDesde": "2026-09-02T00:00:00.000Z"
}
```

productoId debe corresponder a un producto existente.

`valor` debe ser mayor a 0, con hasta dos decimales.

No puede existir más de un precio para el mismo producto con la misma fechaDesde.

### PUT /precios/:id

Actualiza el valor o la fecha de vigencia de un precio. Requiere rol `ADMIN`. Mismo body y validaciones que `POST /precios`.

- El producto de un precio no se puede cambiar: si `productoId` es distinto del actual, responde 400. Para corregirlo, se elimina el precio y se carga en el producto correcto.
- Si el precio ya rige y se lo pasa a una fecha futura, debe quedar otro precio que rija en su lugar; si no, responde 409. Así un producto nunca queda sin precio vigente.

### DELETE /precios/:id

Elimina un precio. Requiere rol `ADMIN`.

- Un precio que ya rige solo se puede eliminar si queda otro que rija en su lugar (el anterior pasa a ser el vigente); si es el único, responde 409. Los precios con fecha futura se pueden eliminar siempre.

### GET /productos/:id/precios

Obtiene el historial de precios del producto, ordenado por fechaDesde de forma descendente. Requiere rol `ADMIN`.


---

# Imágenes

### GET /productos/:id/imagenes

Obtiene todas las imágenes del producto. (Público).

### POST /productos/:id/imagenes

Agrega una imagen (`{ "url": string, "orden"?: number }`). Requiere rol `ADMIN`.

### DELETE /productos/imagenes/:id

Elimina una imagen por su propio id (no requiere el id del producto). Requiere rol `ADMIN`.

---

# Categorías

Las operaciones de consulta son públicas. Las operaciones de escritura requieren rol `ADMIN`.

## GET /categorias (Público)

## GET /categorias/:id (Público)

## POST /categorias (Requiere `ADMIN`)

## PUT /categorias/:id (Requiere `ADMIN`)

## DELETE /categorias/:id (Requiere `ADMIN`)

---

# Marcas

Las operaciones de consulta son públicas. Las operaciones de escritura requieren rol `ADMIN`.

## GET /marcas (Público)

## GET /marcas/:id (Público)

## POST /marcas (Requiere `ADMIN`)

## PUT /marcas/:id (Requiere `ADMIN`)

## DELETE /marcas/:id (Requiere `ADMIN`)

---

# Proveedores

Todos los endpoints de este módulo son administrativos y requieren autenticación con rol `ADMIN`.

## GET /proveedores (Requiere `ADMIN`)

## GET /proveedores/:id (Requiere `ADMIN`)

## POST /proveedores (Requiere `ADMIN`)

## PUT /proveedores/:id (Requiere `ADMIN`)

## DELETE /proveedores/:id (Requiere `ADMIN`)

---

# Inventario (Stock)

Todos los endpoints de stock son administrativos y requieren autenticación con rol `ADMIN`.

## GET /stock (Requiere `ADMIN`)

Consulta el stock.

Filtros:

- producto
- almacén

## GET /stock/:id (Requiere `ADMIN`)

Detalle del registro de stock.

## POST /stock (Requiere `ADMIN`)

Registra stock.

## PUT /stock/:id (Requiere `ADMIN`)

Actualiza stock. Si el par producto + almacén resultante ya tiene otro registro de stock, responde 409.

## DELETE /stock/:id (Requiere `ADMIN`)

Elimina un registro de stock.

---

# Almacenes

Todos los endpoints de almacenes son administrativos y requieren autenticación con rol `ADMIN`.

## GET /almacenes (Requiere `ADMIN`)

## GET /almacenes/:id (Requiere `ADMIN`)

## POST /almacenes (Requiere `ADMIN`)

## PUT /almacenes/:id (Requiere `ADMIN`)

## DELETE /almacenes/:id (Requiere `ADMIN`)

Falla con 409 si el almacén tiene stock o pedidos asociados.

---

# Medios de Pago

Las operaciones de consulta (`GET`) son públicas para que los clientes puedan seleccionar un medio de pago al realizar un pedido. Las operaciones de escritura requieren rol `ADMIN`.

## GET /medios-pago (Público)

Obtiene los medios de pago disponibles.

## GET /medios-pago/:id (Público)

Obtiene un medio de pago.

## POST /medios-pago (Requiere `ADMIN`)

Crea un medio de pago.

## PUT /medios-pago/:id (Requiere `ADMIN`)

Actualiza un medio de pago.

## DELETE /medios-pago/:id (Requiere `ADMIN`)

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
      "cantidad": 10,
      "precioUnitario": 100000,
      "subtotal": 1000000
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

Los detalles se consolidan por producto: si un mismo producto se descontó de más de un almacén, la respuesta trae una sola línea con la cantidad y el subtotal sumados (en el ejemplo, 6 del Local + 4 del Depósito = 10). Los campos `almacenId` y `almacen` de esa línea corresponden al primer almacén de origen. El detalle por almacén se conserva internamente para devolver el stock exacto al cancelar.

## POST /pedidos

Crea un pedido completo.
- El usuario normal se asocia automáticamente a partir del token JWT.
- Un administrador puede especificar `usuarioDni` en el cuerpo para registrar un pedido a nombre de otro cliente.
- El cliente no envía precios, totales ni estados; son determinados por el backend.
- Se utiliza el precio vigente de cada producto (`fechaDesde <= fecha actual`).
- Se verifica el stock total disponible entre todos los almacenes (Local y Depósito). Si es suficiente, se descuenta de forma atómica y transaccional.
- Si el pedido requiere envío:
  - El costo es una tarifa fija según la zona de entrega: `LOCAL` (Las Parejas) = $3.000, `NACIONAL` (resto del país) = $15.000.
  - La zona se indica con `envio.tipoEnvio` (`LOCAL` o `NACIONAL`). Opcionalmente se puede mandar `envio.localidad` (texto): si es "Las Parejas" se aplica la tarifa local, cualquier otra, la nacional. Si no se manda ninguno de los dos, se usa la localidad del perfil del usuario.
  - Se genera el registro de Envio (sin inventar fecha tentativa).
- Si no requiere envío (retiro en local), no se genera Envio ni costo de flete.
- `envio.requiereEnvio` debe ser `true` o `false` (booleano); si se omite, se toma como `false`.

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
    "tipoEnvio": "LOCAL",
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
  - `EN_PREPARACION` → `ENVIADO`
  - `ENVIADO` → `ENTREGADO`
- No se permiten transiciones hacia atrás (409 Conflict).
- Desde `EN_PREPARACION` en adelante el pedido ya no puede cancelarse (409 Conflict).
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
- Solo pueden cancelarse pedidos en estado `PENDIENTE` o `CONFIRMADO`.
- Pedidos en estado `EN_PREPARACION`, `ENVIADO`, `ENTREGADO` o ya `CANCELADO` no pueden cancelarse (409 Conflict).
- **Reversión atómica de stock**: El stock se devuelve exactamente a los mismos almacenes de donde fue descontado originalmente.

Respuesta (200): Pedido cancelado.

# Envíos

`Envio` representa la entrega a domicilio asociada a un pedido.

### Reglas generales y generación
- **Generación**: El registro `Envio` se genera de manera automática y transaccional como parte de la creación del pedido (`POST /pedidos`) cuando se especifica `envio.requiereEnvio: true` y se proporciona `envio.domicilioEntrega`.
- **Cuándo existe**: Si el pedido no requiere envío (retiro en local), **no** se genera ningún registro de `Envio`, el costo de envío es `$0` y el total del pedido equivale al subtotal de los productos.
- **Cálculo del costo**: El costo pertenece exclusivamente al módulo de Envíos y es una tarifa fija según la zona de entrega:
  - **Local (Las Parejas, Santa Fe)**: `$3.000`
  - **Nacional (resto del país)**: `$15.000`
  - La zona se elige al crear el pedido con `envio.tipoEnvio` (`LOCAL` o `NACIONAL`); si no se indica, se determina por la localidad (`envio.localidad`, o la del perfil del usuario).
  - El cliente **no** puede enviar un monto arbitrario de flete, solo elegir una de las dos tarifas fijas.
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

# Roles y Autorizaciones

El sistema implementa control de acceso basado en roles (`RBAC`) con dos roles definidos: `ADMIN` y `CLIENTE`.

## Mecanismos de Seguridad

- **Autenticación (`authMiddleware`)**:
  - Valida el token JWT enviado en el header `Authorization: Bearer <token>`.
  - Si no se provee el header o el formato es incorrecto: `401 Unauthorized` ("Token no provisto.").
  - Si el token está vencido o tiene firma inválida: `401 Unauthorized` ("Token inválido o vencido.").
  - En cada solicitud se consulta al usuario en la base: si ya no existe o fue desactivado, responde `401 Unauthorized` ("El usuario no existe o se encuentra inactivo."). El rol se toma de la base, no del token, por lo que desactivar a un usuario o cambiarle el rol tiene efecto inmediato aunque tenga un token vigente.
- **Autorización por Rol (`requireRole`)**:
  - Verifica si el usuario autenticado posee uno de los roles permitidos para la operación.
  - Si el rol no cuenta con permisos suficientes: `403 Forbidden` ("No tienes permisos para realizar esta acción.").
- **Autorización por Propiedad del Recurso (Rol ≠ Propiedad)**:
  - En recursos asociados a clientes (`pedidos` y `envíos`), tener el rol `CLIENTE` no otorga acceso indiscriminado:
    - `CLIENTE` solo puede consultar, modificar o cancelar **sus propios** pedidos y envíos.
    - Intentar acceder al detalle o cancelar un pedido/envío ajeno devuelve `403 Forbidden`.
    - Al listar pedidos o envíos, los resultados para un `CLIENTE` se filtran automáticamente a su propio DNI.
    - `ADMIN` puede consultar y gestionar los pedidos y envíos de **cualquier cliente**.

---

## Matriz de Acceso por Módulo

| Módulo / Recurso | Operaciones Lectura (GET) | Operaciones Escritura (POST, PUT, DELETE, PATCH) |
|---|---|---|
| **Catálogo** (`/productos`, `/categorias`, `/marcas`) | **Público** (Visitantes, CLIENTE, ADMIN) | Solo **ADMIN** |
| **Localidades** (`/localidades`) | **Público** | Solo **ADMIN** |
| **Medios de Pago** (`/medios-pago`) | **Público** | Solo **ADMIN** |
| **Usuarios** (`/usuarios`) | Solo **ADMIN** | Solo **ADMIN** |
| **Proveedores** (`/proveedores`) | Solo **ADMIN** | Solo **ADMIN** |
| **Stock / Inventario** (`/stock`) | Solo **ADMIN** | Solo **ADMIN** |
| **Almacenes** (`/almacenes`) | Solo **ADMIN** | Solo **ADMIN** |
| **Precios** (`/precios`, `/productos/:id/precios`) | Solo **ADMIN** | Solo **ADMIN** |
| **Auth** (`/auth/login`, `/auth/logout`) | **Público** | **Público** |
| **Perfil Propio** (`/auth/me`) | **CLIENTE** y **ADMIN** | **CLIENTE** y **ADMIN** |
| **Pedidos** (`/pedidos`) | **CLIENTE** (solo propios) / **ADMIN** (todos) | `POST`: CLIENTE (a su nombre) / ADMIN<br>`PATCH /:id/estado`: Solo **ADMIN**<br>`POST /:id/cancelar`: CLIENTE (solo propios) / ADMIN<br>`PUT /:id`, `DELETE /:id`: Solo **ADMIN** |
| **Envíos** (`/envios`) | **CLIENTE** (solo propios) / **ADMIN** (todos) | `PUT /:id`: CLIENTE (solo propios PENDIENTES) / ADMIN<br>`POST /:id/cancelar`: CLIENTE (solo propios cancelables) / ADMIN |
