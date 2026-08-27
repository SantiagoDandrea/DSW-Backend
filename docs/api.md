# API REST

## Base URL

/api/

---

# Auth

## POST /auth/login
Inicia sesión.

## POST /auth/logout
Cierra la sesión del usuario.

## GET /auth/me
Obtiene la información del usuario autenticado.

---

# Usuarios

## GET /usuarios
Obtiene todos los usuarios.

Filtros:
- nombre
- apellido
- rol

## GET /usuarios/:id
Obtiene un usuario.

## POST /usuarios
Crea un usuario.

## PUT /usuarios/:id
Actualiza un usuario.

## DELETE /usuarios/:id
Elimina un usuario.

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

## Historial de precios

### GET /productos/:id/precios

Obtiene todos los precios del producto, más reciente primero.

### POST /productos/:id/precios

Agrega un nuevo precio (`{ "valor": number }`). El precio anterior queda como histórico — no se borra, simplemente deja de ser el vigente (el vigente es el de `fechaDesde` más reciente).

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