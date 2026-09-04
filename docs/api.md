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

## GET /pedidos

Listado de pedidos.

Filtros:

- estado
- fechaDesde
- fechaHasta
- usuario

## GET /pedidos/:id

Detalle completo del pedido.

Incluye:

- cliente
- productos
- cantidades
- precio de cada producto
- total
- medio de pago
- envío

## POST /pedidos

Realiza un pedido completo.

El request contiene:

- productos
- cantidades
- medio de pago
- domicilio de entrega

El backend:

- valida stock
- calcula el total
- crea el pedido
- descuenta stock
- genera el envío

## PUT /pedidos/:id

Actualiza un pedido.

## DELETE /pedidos/:id

Elimina un pedido.

---

## Cambio de estado

### PATCH /pedidos/:id/estado

Actualiza únicamente el estado.

Ejemplos:

- Pendiente
- Confirmado
- En preparación
- Enviado
- Entregado
- Cancelado

---

## Cancelar pedido

### POST /pedidos/:id/cancelar

Cancela un pedido.

El backend:

- cambia el estado
- devuelve el stock
- registra la operación

---

# Envíos

## GET /envios

## GET /envios/:id

## POST /envios

## PUT /envios/:id

## DELETE /envios/:id

---

# Roles

Cliente

Puede:

- consultar productos
- realizar pedidos
- consultar sus pedidos
- consultar su perfil

Administrador

Puede acceder a todos los endpoints.
