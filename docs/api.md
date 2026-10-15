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

- `nombre` (búsqueda parcial)
- `apellido` (búsqueda parcial)
- `rol` (`ADMIN` o `CLIENTE`)

Respuesta (200):

```json
[
  {
    "dni": "30111222",
    "nombre": "Carlos",
    "apellido": "Perez",
    "email": "carlos@test.com",
    "telefono": "3471112233",
    "activo": true,
    "rol": "CLIENTE",
    "localidad": {
      "id": 1,
      "nombre": "Rosario",
      "provincia": "Santa Fe",
      "codigoPostal": "2000"
    }
  }
]
```

## GET /usuarios/:dni

Detalle de un usuario por su DNI. Requiere rol `ADMIN`. Incluye la localidad resuelta y nunca incluye `password`.

Respuesta (200): Mismo formato de objeto que en el listado.

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
  "provincia": "Santa Fe",
  "localidad": "Rosario",
  "codigoPostal": "2000"
}
```

> Nota: Se puede enviar la terna `{ provincia, localidad, codigoPostal }` (resolución/alta dinámica) o `"localidadId": 1`.

- `dni`: 7 u 8 dígitos numéricos, clave primaria definida por el cliente.
- `password`: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número. Se almacena hasheada con bcrypt.
- `email`: debe ser único (409 si ya existe otro usuario con ese email).
- `rol`: `ADMIN` o `CLIENTE`.

Respuesta (201): Objeto de usuario creado (sin `password`).

## PUT /usuarios/:dni

Actualiza los datos del usuario (nombre, apellido, email, teléfono, rol, localidad, `activo`). Requiere rol `ADMIN`. El `dni` no es modificable.

Body (campos que se deseen actualizar):

```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "rol": "ADMIN | CLIENTE",
  "provincia": "Santa Fe",
  "localidad": "Rosario",
  "codigoPostal": "2000",
  "localidadId": 1,
  "activo": true,
  "password": "string"
}
```

- `password` es opcional: si se envía, se valida y hashea nuevamente, reemplazando la actual.
- `activo`: booleano (`true` o `false`). Permite reactivar un usuario desactivado previamente.

Respuesta (200): Objeto de usuario actualizado.

## DELETE /usuarios/:dni

Da de baja al usuario de forma lógica: no se borra de la base, se marca `activo: false`. Requiere rol `ADMIN`.

Respuesta (204 No Content), o 404 si el usuario no existe.

El usuario conserva sus pedidos históricos y sigue apareciendo en el listado administrativo, pero queda impedido de iniciar sesión. Puede reactivarse con `PUT /usuarios/:dni` enviando `activo: true`.

---

# Localidades

Las operaciones de consulta (`GET`) son públicas para permitir la selección de localidades y cotización de envíos. Las operaciones de modificación (`POST`, `PUT`, `DELETE`) requieren rol `ADMIN`.

## GET /localidades

Obtiene el listado de todas las localidades registradas. (Público).

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Las Parejas",
    "codigoPostal": "2505",
    "provincia": "Santa Fe"
  }
]
```

## GET /localidades/:id

Obtiene el detalle de una localidad por su ID. (Público).

Respuesta (200):

```json
{
  "id": 1,
  "nombre": "Las Parejas",
  "codigoPostal": "2505",
  "provincia": "Santa Fe"
}
```

## POST /localidades

Crea una nueva localidad. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Rosario",
  "codigoPostal": "2000",
  "provincia": "Santa Fe"
}
```

- `nombre`: texto obligatorio, no vacío.
- `codigoPostal`: texto obligatorio, no vacío.
- `provincia`: texto obligatorio, debe pertenecer al catálogo oficial de las 24 provincias argentinas (ej. "Santa Fe", "Buenos Aires", "Córdoba", etc.).
- Restricción de unicidad: la combinación `(nombre, codigoPostal)` debe ser única en el sistema. Si ya existe, responde 409 Conflict.

Respuesta (201): Objeto de la localidad creada con su `id`.

## PUT /localidades/:id

Actualiza los datos de una localidad existente. Requiere rol `ADMIN`.

Mismo body y validaciones que `POST /localidades`. Si la combinación `(nombre, codigoPostal)` resultante ya pertenece a otra localidad, responde 409 Conflict.

Respuesta (200): Objeto de la localidad actualizado.

## DELETE /localidades/:id

Elimina una localidad. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si la localidad tiene usuarios o pedidos/envíos asociados.

---

# Productos

Las operaciones de consulta (`GET`) del catálogo de productos e imágenes son públicas. Las operaciones de creación, edición y eliminación de productos e imágenes requieren rol `ADMIN`.

## GET /productos

Listado de productos para el catálogo comercial. (Público). Incluye categoría, marca, proveedor (si posee), precio actual vigente, cálculo de disponibilidad (`disponible`), conteo consolidado de unidades (`stockDisponible`) y galería de imágenes.

Filtros (query params, todos opcionales):

- `categoriaId`: número entero positivo.
- `marcaId`: número entero positivo.
- `nombre`: texto (búsqueda parcial insensible a mayúsculas).
- `precioMin`: número mayor o igual a 0.
- `precioMax`: número mayor o igual a 0 (debe ser mayor o igual que `precioMin`).

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Colchón Espuma Alta Densidad 2 Plazas",
    "descripcion": "Colchón de espuma de alta densidad (30 kg/m³) con tela de punto.",
    "categoria": {
      "id": 1,
      "nombre": "Colchones"
    },
    "marca": {
      "id": 1,
      "nombre": "Piero"
    },
    "proveedor": {
      "id": 1,
      "nombre": "Distribuidora Confort S.A."
    },
    "precioActual": 250000,
    "disponible": true,
    "stockDisponible": 15,
    "imagenes": [
      {
        "id": 1,
        "url": "https://example.com/imagen1.jpg",
        "orden": 1
      }
    ]
  }
]
```

- `precioActual`: número con el valor vigente, o `null` si aún no tiene precio asignado.
- `disponible`: booleano (`true` si `stockDisponible > 0`).
- `stockDisponible`: cantidad total de unidades sumando todos los almacenes. No expone el desglose por almacén (información exclusiva de `ADMIN` en el módulo Stock).
- `proveedor`: `{ id, nombre }` o `null` si no tiene proveedor asignado.

## GET /productos/:id

Detalle completo de un producto por su ID. (Público). Mismo formato y campos calculados que en el listado.

Respuesta (200): Objeto de producto.

## POST /productos

Crea un producto junto con su precio inicial en una única operación atómica transaccional. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Colchón Espuma Alta Densidad 2 Plazas",
  "descripcion": "Colchón de espuma de alta densidad (30 kg/m³)",
  "categoriaId": 1,
  "marcaId": 1,
  "proveedorId": 1,
  "precio": 250000
}
```

- `nombre` y `descripcion`: obligatorios, textos no vacíos.
- `categoriaId`: entero positivo de una categoría existente (404 si no existe).
- `marcaId`: entero positivo de una marca existente (404 si no existe).
- `proveedorId`: entero positivo de un proveedor existente, o `null`/omitido (opcional).
- `precio`: número positivo mayor a 0 con hasta 2 decimales (crea el precio inicial vigente desde la fecha actual).

Respuesta (201): Objeto de producto creado con `precioActual` asignado.

## PUT /productos/:id

Actualiza los atributos informativos del producto (nombre, descripción, categoría, marca, proveedor). Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "string",
  "descripcion": "string",
  "categoriaId": 1,
  "marcaId": 1,
  "proveedorId": 1
}
```

- `proveedorId`: opcional (puede enviarse `null` para desasociar el proveedor).
- No modifica el precio: para alterar precios vigentes o cargar nuevos se utiliza el módulo Precios (`POST /precios`).

Respuesta (200): Objeto de producto actualizado.

## DELETE /productos/:id

Elimina un producto. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si el producto posee registros de stock o pedidos asociados.

---

# Precios

Todos los endpoints de precios son administrativos y requieren autenticación con rol `ADMIN`.

Un producto puede tener múltiples precios y se conserva todo el historial. La combinación `productoId + fechaDesde` es única, por lo que no puede haber dos precios del mismo producto con la misma fecha de vigencia. El precio vigente se determina tomando el precio con la `fechaDesde` más reciente que corresponda.

### GET /precios

Obtiene todos los precios registrados. Requiere rol `ADMIN`.

Filtros (query params, todos opcionales):

- `productoId`: número entero positivo.
- `fechaDesde`: fecha/hora mínima en formato ISO.
- `fechaHasta`: fecha/hora máxima en formato ISO.

Respuesta (200):

```json
[
  {
    "id": 1,
    "productoId": 1,
    "valor": 199.99,
    "fechaDesde": "2026-09-02T00:00:00.000Z"
  }
]
```

### GET /precios/:id

Obtiene un precio por su ID. Requiere rol `ADMIN`.

Respuesta (200): Objeto de precio con su valor y fechaDesde.

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

- `productoId`: debe corresponder a un producto existente.
- `valor`: debe ser mayor a 0, con hasta dos decimales.
- No puede existir más de un precio para el mismo producto con la misma fechaDesde (409 Conflict).

Respuesta (201): Objeto de precio creado.

### PUT /precios/:id

Actualiza el valor o la fecha de vigencia de un precio. Requiere rol `ADMIN`. Mismo body y validaciones que `POST /precios`.

- El producto de un precio no se puede cambiar: si `productoId` es distinto del actual, responde 400. Para corregirlo, se elimina el precio y se carga en el producto correcto.
- Si el precio ya rige y se lo pasa a una fecha futura, debe quedar otro precio que rija en su lugar; si no, responde 409. Así un producto nunca queda sin precio vigente.

Respuesta (200): Objeto de precio actualizado.

### DELETE /precios/:id

Elimina un precio. Requiere rol `ADMIN`.

- Un precio que ya rige solo se puede eliminar si queda otro que rija en su lugar (el anterior pasa a ser el vigente); si es el único, responde 409. Los precios con fecha futura se pueden eliminar siempre.

Respuesta (204 No Content).

### GET /productos/:id/precios

Obtiene el historial completo de precios del producto indicado, ordenado por fechaDesde de forma descendente. Requiere rol `ADMIN`.

Respuesta (200): Listado de precios históricos del producto.

---

# Imágenes

### GET /productos/:id/imagenes

Obtiene todas las imágenes asociadas al producto. (Público).

Respuesta (200):

```json
[
  {
    "id": 1,
    "url": "https://example.com/imagen1.jpg",
    "orden": 1
  }
]
```

### POST /productos/:id/imagenes

Agrega una imagen a la galería de un producto. Requiere rol `ADMIN`.

Body:

```json
{
  "url": "https://example.com/imagen1.jpg",
  "orden": 1
}
```

- `url`: obligatoria, texto no vacío. Debe comenzar obligatoriamente con `http://` o `https://`.
- `orden`: opcional (entero mayor o igual a 0, o `null`).

Respuesta (201): Objeto de imagen creada con su `id`.

### DELETE /productos/imagenes/:id

Elimina una imagen por su propio id (no requiere el id del producto en la URL). Requiere rol `ADMIN`.

Respuesta (204 No Content).

---

# Categorías

Las operaciones de consulta son públicas para el catálogo. Las operaciones de escritura requieren rol `ADMIN`.

## GET /categorias

Obtiene el listado de todas las categorías disponibles. (Público).

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Colchonería"
  }
]
```

## GET /categorias/:id

Obtiene una categoría por su ID. (Público).

Respuesta (200):

```json
{
  "id": 1,
  "nombre": "Colchonería"
}
```

## POST /categorias

Crea una nueva categoría. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Electrodomésticos"
}
```

- `nombre`: obligatorio, texto no vacío.

Respuesta (201): Objeto de la categoría creada con su `id`.

## PUT /categorias/:id

Actualiza el nombre de una categoría existente. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Tecnología y Audio"
}
```

Respuesta (200): Objeto de la categoría actualizado.

## DELETE /categorias/:id

Elimina una categoría. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si la categoría tiene productos asociados.

---

# Marcas

Las operaciones de consulta son públicas para el catálogo. Las operaciones de escritura requieren rol `ADMIN`.

## GET /marcas

Obtiene el listado de todas las marcas registradas. (Público).

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Piero"
  }
]
```

## GET /marcas/:id

Obtiene una marca por su ID. (Público).

Respuesta (200):

```json
{
  "id": 1,
  "nombre": "Piero"
}
```

## POST /marcas

Crea una nueva marca. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Samsung"
}
```

- `nombre`: obligatorio, texto no vacío.

Respuesta (201): Objeto de la marca creada con su `id`.

## PUT /marcas/:id

Actualiza el nombre de una marca existente. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Samsung Electronics"
}
```

Respuesta (200): Objeto de la marca actualizado.

## DELETE /marcas/:id

Elimina una marca. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si la marca tiene productos asociados.

---

# Proveedores

Todos los endpoints de este módulo son administrativos y requieren autenticación con rol `ADMIN`.

## GET /proveedores

Listado de proveedores registrados. Requiere rol `ADMIN`.

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Distribuidora Confort S.A.",
    "cuit": "30-11223344-5",
    "telefono": "011-4567-8900"
  }
]
```

## GET /proveedores/:id

Detalle de un proveedor por su ID. Requiere rol `ADMIN`.

Respuesta (200): Objeto de proveedor.

## POST /proveedores

Crea un nuevo proveedor. Requiere rol `ADMIN`.

Body:

```json
{
  "nombre": "Distribuidora Confort S.A.",
  "cuit": "30-11223344-5",
  "telefono": "011-4567-8900"
}
```

- `nombre`: obligatorio, texto no vacío.
- `cuit`: obligatorio, texto no vacío con formato exacto `XX-XXXXXXXX-X` (dos dígitos, guion, ocho dígitos, guion, un dígito).
- `telefono`: obligatorio, texto no vacío.

Respuesta (201): Objeto del proveedor creado con su `id`.

## PUT /proveedores/:id

Actualiza los datos de un proveedor existente. Requiere rol `ADMIN`.

Mismo body y validaciones que `POST /proveedores`.

Respuesta (200): Objeto de proveedor actualizado.

## DELETE /proveedores/:id

Elimina un proveedor. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si el proveedor tiene productos asociados.

---

# Inventario (Stock)

Todos los endpoints de stock son administrativos y requieren autenticación con rol `ADMIN`.

## GET /stock

Consulta el stock de productos por almacén. Requiere rol `ADMIN`.

Filtros (query params, todos opcionales):

- `productoId`: número entero positivo.
- `almacenId`: número entero positivo.

Respuesta (200):

```json
[
  {
    "id": 1,
    "productoId": 1,
    "almacenId": 1,
    "cantidad": 25
  }
]
```

## GET /stock/:id

Detalle de un registro de stock por su ID. Requiere rol `ADMIN`.

Respuesta (200): Objeto de stock.

## POST /stock

Registra stock para un producto en un almacén. Requiere rol `ADMIN`.

Body:

```json
{
  "productoId": 1,
  "almacenId": 1,
  "cantidad": 25
}
```

- `productoId`: entero positivo de un producto existente (404 si no existe).
- `almacenId`: entero positivo de un almacén existente (404 si no existe).
- `cantidad`: número entero mayor o igual a 0.
- Si el par `(productoId, almacenId)` ya posee un registro de stock en la base, responde 409 Conflict.

Respuesta (201): Objeto de stock creado con su `id`.

## PUT /stock/:id

Actualiza la cantidad, producto o almacén de un registro de stock. Requiere rol `ADMIN`.

Mismo body y validaciones que `POST /stock`.

- Si la actualización causara un par `(productoId, almacenId)` ya existente en otro registro, responde 409 Conflict.

Respuesta (200): Objeto de stock actualizado.

## DELETE /stock/:id

Elimina un registro de stock. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si el registro está comprometido en pedidos o dependencias de integridad.

---

# Almacenes

Todos los endpoints de almacenes son administrativos y requieren autenticación con rol `ADMIN`.

## GET /almacenes

Listado de almacenes o sucursales físicas. Requiere rol `ADMIN`.

Respuesta (200):

```json
[
  {
    "id": 1,
    "descripcion": "Local Físico Central",
    "direccion": "Calle 20 Nro 500"
  }
]
```

## GET /almacenes/:id

Detalle de un almacén por su ID. Requiere rol `ADMIN`.

Respuesta (200): Objeto de almacén.

## POST /almacenes

Crea un nuevo almacén. Requiere rol `ADMIN`.

Body:

```json
{
  "descripcion": "Local Físico Central",
  "direccion": "Calle 20 Nro 500"
}
```

- `descripcion` y `direccion`: obligatorios, textos no vacíos.

Respuesta (201): Objeto de almacén creado con su `id`.

## PUT /almacenes/:id

Actualiza los datos de un almacén. Requiere rol `ADMIN`.

Mismo body y validaciones que `POST /almacenes`.

Respuesta (200): Objeto de almacén actualizado.

## DELETE /almacenes/:id

Elimina un almacén. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si el almacén tiene stock o pedidos asociados.

---

# Medios de Pago

Las operaciones de consulta (`GET`) son públicas para que los clientes puedan seleccionar un medio de pago al realizar un pedido. Las operaciones de escritura requieren rol `ADMIN`.

## GET /medios-pago

Obtiene los medios de pago disponibles. (Público).

Respuesta (200):

```json
[
  {
    "id": 1,
    "descripcion": "Transferencia Bancaria"
  }
]
```

## GET /medios-pago/:id

Obtiene el detalle de un medio de pago por su ID. (Público).

Respuesta (200): Objeto de medio de pago.

## POST /medios-pago

Crea un medio de pago. Requiere rol `ADMIN`.

Body:

```json
{
  "descripcion": "Transferencia Bancaria"
}
```

- `descripcion`: obligatoria, texto no vacío.

Respuesta (201): Objeto de medio de pago creado con su `id`.

## PUT /medios-pago/:id

Actualiza la descripción de un medio de pago. Requiere rol `ADMIN`.

Mismo body y validación que `POST /medios-pago`.

Respuesta (200): Objeto de medio de pago actualizado.

## DELETE /medios-pago/:id

Elimina un medio de pago. Requiere rol `ADMIN`.

Respuesta (204 No Content).

- Falla con 409 Conflict si el medio de pago está asociado a pedidos existentes.

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
