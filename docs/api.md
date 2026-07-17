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

Listado de productos.

Filtros:

- categoría
- marca
- nombre
- precioMin
- precioMax

## GET /productos/:id

Detalle del producto.

Incluye:

- categoría
- marca
- precio vigente
- proveedor
- stock
- almacenes

## POST /productos

Crea un producto.

## PUT /productos/:id

Actualiza un producto.

## DELETE /productos/:id

Elimina un producto.

---

## Historial de precios

### GET /productos/:id/precios

Obtiene todos los precios del producto.

### POST /productos/:id/precios

Agrega un nuevo precio.

El precio anterior queda como histórico.

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