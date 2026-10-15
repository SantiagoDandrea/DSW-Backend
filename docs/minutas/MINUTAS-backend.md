# Minutas — Backend (DSW Ecommerce)

Grupo: Santiago D'Andrea, Martín De Benedetti, Santino Ravarotto, Guillermo Giannuzzi.
Metodología: Kanban informal, coordinación diaria por Discord, revisión de pull requests entre integrantes antes de mergear.
Tablero de seguimiento: [GitHub Projects](https://github.com/users/SantiagoDandrea/projects/3).

## 2026-04-22 — Inicio
Se conforma el grupo y se presenta la propuesta del TP: un e-commerce de colchonería, tecnología y electrodomésticos. Se toma como referencia el repositorio de la cátedra.

## 2026-07-17/22 — Schema inicial y estructura del backend
Se define la primera versión del schema de Prisma ([PR #2](https://github.com/SantiagoDandrea/DSW-Backend/pull/2), integrada el 21/7). Se corrige la relación entre `Usuario` y `Localidad`: `localidadId` pasa de opcional a obligatoria y el borrado de una localidad con usuarios asociados queda restringido (`onDelete: Restrict` en lugar de `SetNull`), de acuerdo con la consigna del TP ("CRUD Usuario depende de CRUD Localidad") ([PR #3](https://github.com/SantiagoDandrea/DSW-Backend/pull/3), 21/7). Se crea la estructura de carpetas del backend, con los archivos de cada módulo vacíos ([PR #4](https://github.com/SantiagoDandrea/DSW-Backend/pull/4), 22/7).

## 2026-08-14 — Retoma y configuración del entorno
Después de unas semanas sin actividad se retoma el desarrollo con la configuración del entorno. Se corrige `.gitignore` para excluir `node_modules` y `.env`, que se habían subido al repositorio ([PR #5](https://github.com/SantiagoDandrea/DSW-Backend/pull/5)); se agrega `.env.example` como guía y se corrige `DATABASE_URL`, que apuntaba a PostgreSQL por defecto de Prisma cuando el proyecto usa MySQL ([PR #6](https://github.com/SantiagoDandrea/DSW-Backend/pull/6)); y se elimina el `.env` versionado ([PR #7](https://github.com/SantiagoDandrea/DSW-Backend/pull/7)). Las tres se integran el mismo día.

## 2026-08-18/25 — Primeros CRUD: Categoría, Marca, Medio de Pago, Localidad y Proveedor
Se incorpora el primer CRUD completo (Categoría), probado de punta a punta contra MySQL, junto con la base común de todos los módulos: manejo centralizado de errores, conexión a Prisma con el adaptador de MariaDB (requerido por Prisma 7 para conectarse a MySQL) y la estructura en capas. Sobre esa base se suman Marca, Medio de Pago, Localidad (con una restricción de unicidad combinada entre nombre y código postal) y Proveedor. Las reglas de negocio asumidas quedan documentadas en la descripción del PR ([PR #8](https://github.com/SantiagoDandrea/DSW-Backend/pull/8), integrada el 25/8).

## 2026-08-26/27 — Producto
Se integra el CRUD de Producto: alta, baja, modificación y consulta, con validación de las referencias a categoría, marca y proveedor y protección contra el borrado de productos con stock o pedidos asociados ([PR #9](https://github.com/SantiagoDandrea/DSW-Backend/pull/9), 26/8). Al día siguiente se extiende con el historial de precios, las imágenes del producto y los filtros de búsqueda del listado ([PR #10](https://github.com/SantiagoDandrea/DSW-Backend/pull/10), 27/8).

## 2026-09-01 — Usuario y Almacén
Antes de desarrollar el módulo de Usuario se define el límite con Auth para no duplicar lógica: `usuarios/` es el único que crea usuarios, con la contraseña hasheada, y `auth/` se limita a la sesión (login, logout y consulta del usuario autenticado). Se integran los CRUD de Usuario ([PR #12](https://github.com/SantiagoDandrea/DSW-Backend/pull/12)) y de Almacén ([PR #13](https://github.com/SantiagoDandrea/DSW-Backend/pull/13)).

## 2026-09-02/03 — Stock y Precio
Se define que el stock se modela por almacén: cada almacén lleva su propio conteo del producto. Se implementa el CRUD de Stock ([PR #14](https://github.com/SantiagoDandrea/DSW-Backend/pull/14)) y el de Precio como historial: cada registro tiene una fecha de vigencia y el precio vigente es el más reciente que ya rige, lo que permite reconstruir el precio de un producto en cualquier momento ([PR #15](https://github.com/SantiagoDandrea/DSW-Backend/pull/15), integrada el 3/9). Al integrarlos se detecta que el endpoint `GET/POST /productos/:id/precios` estaba implementado en dos módulos con comportamientos distintos. Tras evaluar tres alternativas, se centraliza toda la lógica de precios en el módulo Precio y Producto delega en él para crear el precio inicial ([PR #16](https://github.com/SantiagoDandrea/DSW-Backend/pull/16)).

## 2026-09-03 — Corrección de inconsistencias generales
Se revisa el código en conjunto y se corrigen varias inconsistencias menores entre módulos: el manejo de errores en Usuario, la validación del precio como texto o número entre Producto y Precio, y la falta de `try/catch` en un controller ([PR #17](https://github.com/SantiagoDandrea/DSW-Backend/pull/17)).

## 2026-09-04 — Autenticación
Se implementa el módulo de Auth: login, logout y consulta del usuario autenticado con JWT. Se unifica además el manejo de errores con `try/catch` y `next(err)` en los controllers que todavía no lo tenían, de modo que todos los módulos usan el mismo criterio ([PR #18](https://github.com/SantiagoDandrea/DSW-Backend/pull/18)).

## 2026-09-05/07 — Pedidos, Envíos y autorización por rol
Se implementa el flujo completo de Pedidos: reparto del stock entre almacenes, cálculo del total y máquina de estados ([PR #19](https://github.com/SantiagoDandrea/DSW-Backend/pull/19)). Sobre la misma base se agrega el módulo de Envíos, que depende de Pedido: costo según la localidad, correlación entre los estados del pedido y del envío, y cancelación independiente del envío. Se define además la autorización por rol (`ADMIN` y `CLIENTE`) para todas las rutas: un cliente solo accede a sus propios pedidos y envíos ([PR #20](https://github.com/SantiagoDandrea/DSW-Backend/pull/20), integrada el 7/9).

## 2026-09-07/09 — Revisión de autorizaciones, tests, documentación y registro de usuarios
Antes de integrar la autorización se revisan las reglas por rol y se corrigen dos inconsistencias: faltaba una vía para que el usuario edite su propio perfil (`PUT /auth/me`) y el stock era exclusivo de administradores, lo que impedía mostrar la disponibilidad en el catálogo ([PR #20](https://github.com/SantiagoDandrea/DSW-Backend/pull/20)). Se incorporan los tests automatizados, unitarios y de integración, con Vitest y Supertest ([PR #21](https://github.com/SantiagoDandrea/DSW-Backend/pull/21), integrada el 8/9), el README con las instrucciones de instalación y la documentación de la API (PR [#22](https://github.com/SantiagoDandrea/DSW-Backend/pull/22) a [#25](https://github.com/SantiagoDandrea/DSW-Backend/pull/25)) y el registro público de usuarios con inicio de sesión automático, que siempre crea cuentas con rol `CLIENTE` ([PR #26](https://github.com/SantiagoDandrea/DSW-Backend/pull/26), integrada el 9/9).

## 2026-09-09 — Disponibilidad de stock en el catálogo
Se detecta que la consulta pública de stock expone más información de la necesaria: la cantidad exacta y el almacén de cada producto. El módulo Stock vuelve a ser exclusivo de administradores y la disponibilidad para el catálogo se resuelve con un campo calculado en Producto (`disponible`), sin exponer el desglose por almacén ([PR #27](https://github.com/SantiagoDandrea/DSW-Backend/pull/27)).

## 2026-09-09/14 — Conexión a MySQL
Se agrega el parámetro `allowPublicKeyRetrieval=true` a `DATABASE_URL` en `.env.example`: con MySQL 8 o superior sin SSL, el driver puede quedar sin responder después de reiniciar el equipo o el servicio, porque no obtiene la clave pública RSA del servidor ([PR #28](https://github.com/SantiagoDandrea/DSW-Backend/pull/28), integrada el 14/9).

## 2026-10-10 — Mejoras de modelo, tarifas de envío y seguridad
Se integran varias mejoras en una sola PR ([PR #29](https://github.com/SantiagoDandrea/DSW-Backend/pull/29)). Al crear un pedido con envío se elige la zona de entrega (`LOCAL` o `NACIONAL`) y se aplica la tarifa fija correspondiente. Los detalles de un pedido que consume stock de varios almacenes se devuelven consolidados por producto, y el detalle por almacén se conserva en la base para reponer el stock exacto al cancelar. Los pedidos ya no pueden cancelarse desde `EN_PREPARACION`. Se agrega la desactivación de usuarios mediante el campo `activo`, y los usuarios inactivos no pueden iniciar sesión. El proveedor de un producto pasa a ser opcional.

Ese mismo día se completa la baja de usuarios: `DELETE /usuarios/:dni` deja de borrar el registro y pasa a desactivarlo (`activo: false`). Así se puede dar de baja a un usuario con pedidos, algo que antes fallaba por la restricción de la base, y reactivarlo después desde la edición del usuario ([PR #31](https://github.com/SantiagoDandrea/DSW-Backend/pull/31)).

## 2026-10-13/14 — Documentación y revisión general
Se integra la documentación del backend: README con instalación, diseño, contrato de la API y estas minutas ([PR #30](https://github.com/SantiagoDandrea/DSW-Backend/pull/30)). Después se revisan todos los módulos y se corrigen los problemas encontrados ([PR #32](https://github.com/SantiagoDandrea/DSW-Backend/pull/32)). La autenticación pasa a consultar al usuario en la base en cada solicitud, por lo que desactivar a un usuario o cambiarle el rol tiene efecto inmediato aunque tenga un token vigente. En precios, un producto ya no puede quedar sin precio vigente, el valor debe ser mayor a 0 y un precio no puede cambiar de producto. Además, un JSON mal formado o una solicitud sin cuerpo responden 400 en lugar de un error interno, la edición de stock hacia un par producto + almacén existente responde 409, y el servidor no arranca si falta `JWT_SECRET`.

## 2026-10-15 — Flexibilización de localidades en registro y perfil de usuarios
Se flexibiliza la asignación de localidades para el registro público de clientes (`POST /auth/register`) y la edición de perfil (`PUT /auth/me`): en lugar de exigir un `localidadId` preexistente acotado, se permite ingresar provincia, localidad y código postal. El backend resuelve la localidad buscando coincidencias por nombre y código postal (`obtenerLocalidadPorNombreYCp`), y si no existe la crea automáticamente (`findOrCreate`), manteniendo total compatibilidad retroactiva con solicitudes que envíen `localidadId`. Adicionalmente, el mapper de usuario expone ahora `provincia` y `codigoPostal` en la localidad resuelta.
