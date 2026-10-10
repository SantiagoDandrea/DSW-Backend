# Minutas — Backend (DSW Ecommerce)

Grupo: Santiago D'Andrea, Martín De Benedetti, Santino Ravarotto, Guillermo Giannuzzi.
Metodología: Kanban informal, coordinación diaria por Discord, revisión de pull requests entre integrantes antes de mergear.

## 2026-04-22 — Inicio
Se conforma el grupo y se presenta la propuesta del TP: un e-commerce de colchonería, tecnología y electrodomésticos. Se toma como referencia el repositorio de la cátedra.

## 2026-07-17/22 — Schema inicial y estructura del backend
Se define la primera versión del schema de Prisma (PR #2, integrada el 21/7). Se corrige la relación entre `Usuario` y `Localidad`: `localidadId` pasa de opcional a obligatoria y el borrado de una localidad con usuarios asociados queda restringido (`onDelete: Restrict` en lugar de `SetNull`), de acuerdo con la consigna del TP ("CRUD Usuario depende de CRUD Localidad") (PR #3, 21/7). Se crea la estructura de carpetas del backend, con los archivos de cada módulo vacíos (PR #4, 22/7).

## 2026-08-14 — Retoma y configuración del entorno
Después de unas semanas sin actividad se retoma el desarrollo con la configuración del entorno. Se corrige `.gitignore` para excluir `node_modules` y `.env`, que se habían subido al repositorio (PR #5); se agrega `.env.example` como guía y se corrige `DATABASE_URL`, que apuntaba a PostgreSQL por defecto de Prisma cuando el proyecto usa MySQL (PR #6); y se elimina el `.env` versionado (PR #7). Las tres se integran el mismo día.

## 2026-08-18/25 — Primeros CRUD: Categoría, Marca, Medio de Pago, Localidad y Proveedor
Se incorpora el primer CRUD completo (Categoría), probado de punta a punta contra MySQL, junto con la base común de todos los módulos: manejo centralizado de errores, conexión a Prisma con el adaptador de MariaDB (requerido por Prisma 7 para conectarse a MySQL) y la estructura en capas. Sobre esa base se suman Marca, Medio de Pago, Localidad (con una restricción de unicidad combinada entre nombre y código postal) y Proveedor. Las reglas de negocio asumidas quedan documentadas en la descripción del PR (PR #8, integrada el 25/8).

## 2026-08-26/27 — Producto
Se integra el CRUD de Producto: alta, baja, modificación y consulta, con validación de las referencias a categoría, marca y proveedor y protección contra el borrado de productos con stock o pedidos asociados (PR #9, 26/8). Al día siguiente se extiende con el historial de precios, las imágenes del producto y los filtros de búsqueda del listado (PR #10, 27/8).

## 2026-09-01 — Usuario y Almacén
Antes de desarrollar el módulo de Usuario se define el límite con Auth para no duplicar lógica: `usuarios/` es el único que crea usuarios, con la contraseña hasheada, y `auth/` se limita a la sesión (login, logout y consulta del usuario autenticado). Se integran los CRUD de Usuario (PR #12) y de Almacén (PR #13).

## 2026-09-02/03 — Stock y Precio
Se define que el stock se modela por almacén: cada almacén lleva su propio conteo del producto. Se implementa el CRUD de Stock (PR #14) y el de Precio como historial: cada registro tiene una fecha de vigencia y el precio vigente es el más reciente que ya rige, lo que permite reconstruir el precio de un producto en cualquier momento (PR #15, integrada el 3/9). Al integrarlos se detecta que el endpoint `GET/POST /productos/:id/precios` estaba implementado en dos módulos con comportamientos distintos. Tras evaluar tres alternativas, se centraliza toda la lógica de precios en el módulo Precio y Producto delega en él para crear el precio inicial (PR #16).

## 2026-09-03 — Corrección de inconsistencias generales
Se revisa el código en conjunto y se corrigen varias inconsistencias menores entre módulos: el manejo de errores en Usuario, la validación del precio como texto o número entre Producto y Precio, y la falta de `try/catch` en un controller (PR #17).

## 2026-09-04 — Autenticación
Se implementa el módulo de Auth: login, logout y consulta del usuario autenticado con JWT. Se unifica además el manejo de errores con `try/catch` y `next(err)` en los controllers que todavía no lo tenían, de modo que todos los módulos usan el mismo criterio (PR #18).

## 2026-09-05/07 — Pedidos, Envíos y autorización por rol
Se implementa el flujo completo de Pedidos: reparto del stock entre almacenes, cálculo del total y máquina de estados (PR #19). Sobre la misma base se agrega el módulo de Envíos, que depende de Pedido: costo según la localidad, correlación entre los estados del pedido y del envío, y cancelación independiente del envío. Se define además la autorización por rol (`ADMIN` y `CLIENTE`) para todas las rutas: un cliente solo accede a sus propios pedidos y envíos (PR #20, integrada el 7/9).

## 2026-09-07/09 — Revisión de autorizaciones, tests, documentación y registro de usuarios
Antes de integrar la autorización se revisan las reglas por rol y se corrigen dos inconsistencias: faltaba una vía para que el usuario edite su propio perfil (`PUT /auth/me`) y el stock era exclusivo de administradores, lo que impedía mostrar la disponibilidad en el catálogo (PR #20). Se incorporan los tests automatizados, unitarios y de integración, con Vitest y Supertest (PR #21, integrada el 8/9), el README con las instrucciones de instalación y la documentación de la API (PR #22 a #25) y el registro público de usuarios con inicio de sesión automático, que siempre crea cuentas con rol `CLIENTE` (PR #26, integrada el 9/9).

## 2026-09-09 — Disponibilidad de stock en el catálogo
Se detecta que la consulta pública de stock expone más información de la necesaria: la cantidad exacta y el almacén de cada producto. El módulo Stock vuelve a ser exclusivo de administradores y la disponibilidad para el catálogo se resuelve con un campo calculado en Producto (`disponible`), sin exponer el desglose por almacén (PR #27).

## 2026-09-09/14 — Conexión a MySQL
Se agrega el parámetro `allowPublicKeyRetrieval=true` a `DATABASE_URL` en `.env.example`: con MySQL 8 o superior sin SSL, el driver puede quedar sin responder después de reiniciar el equipo o el servicio, porque no obtiene la clave pública RSA del servidor (PR #28, integrada el 14/9).

## 2026-10-10 — Mejoras de modelo, tarifas de envío y seguridad
Se integran varias mejoras en una sola PR (PR #29). Al crear un pedido con envío se elige la zona de entrega (`LOCAL` o `NACIONAL`) y se aplica la tarifa fija correspondiente. Los detalles de un pedido que consume stock de varios almacenes se devuelven consolidados por producto, y el detalle por almacén se conserva en la base para reponer el stock exacto al cancelar. Los pedidos ya no pueden cancelarse desde `EN_PREPARACION`. Se agrega la desactivación de usuarios mediante el campo `activo`, y los usuarios inactivos no pueden iniciar sesión. El proveedor de un producto pasa a ser opcional.
