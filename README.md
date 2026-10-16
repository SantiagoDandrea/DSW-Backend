# DSW-Backend

Backend de un e-commerce de colchonería, tecnología y electrodomésticos — TP de Desarrollo de Software (UTN FRRo).

Es una API REST que consume la aplicación web: [DSW-Frontend](https://github.com/SantiagoDandrea/DSW-Frontend).

## Qué incluye

- **Autenticación y roles:** inicio de sesión con JWT, registro público de clientes y perfil propio. Hay dos roles, `CLIENTE` y `ADMIN`; un cliente solo accede a sus propios pedidos y envíos.
- **Catálogo:** productos (con imágenes, precio vigente e historial de precios y disponibilidad), categorías, marcas, proveedores, medios de pago y localidades.
- **Inventario:** almacenes y stock por almacén.
- **Pedidos y envíos:** creación de pedidos con reparto del stock entre almacenes, máquina de estados, cancelación con reposición exacta del stock, y envío a domicilio con tarifa según la zona de entrega.

## Stack
Node.js + Express 5 + Prisma 7 + MySQL. Autenticación con JWT y contraseñas con bcrypt. Pruebas con Vitest y Supertest.

## Requisitos previos
- Node 20+
- pnpm
- MySQL corriendo localmente (o accesible por red), con una base de datos creada

## Instalación

1. Instalá las dependencias:
   ```
   pnpm install
   ```
2. Copiá `.env.example` a `.env` y completá los valores:
   ```
   cp .env.example .env
   ```
   En Windows (CMD o PowerShell): `copy .env.example .env`. Las variables son:
   ```
   DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_db?allowPublicKeyRetrieval=true"
   JWT_SECRET="cualquier_string_random"
   ```
   `JWT_SECRET` es la clave con la que se firman los tokens de sesión; es obligatoria y sin ella el servidor no arranca. El parámetro `allowPublicKeyRetrieval=true` evita un error de conexión con MySQL 8 o superior sin SSL. Opcionalmente se puede definir `PORT` (por defecto, `3000`).
3. Aplicá las migraciones de la base de datos:
   ```
   npx prisma migrate dev
   ```
4. Cargá los datos de prueba iniciales (productos, categorías, precios y usuarios):
   ```
   pnpm seed
   ```
   (o `node prisma/seed.js`).
5. Levantá el servidor:
   ```
   pnpm dev
   ```
   El servidor queda escuchando en `http://localhost:3000` y la API responde bajo `/api`.

## Usuarios

La base de datos cuenta con usuarios de prueba (contraseña para todos: `Password123`):

| Rol | Correo | DNI | Ubicación |
|---|---|---|---|
| `ADMIN` | `admin@demo.com` | `10000001` | Las Parejas |
| `CLIENTE` | `carlos@demo.com` | `20000001` | Las Parejas |
| `CLIENTE` | `ana@demo.com` | `20000002` | Rosario |
| `CLIENTE` | `lucas@demo.com` | `20000003` | Caseros |

- Cualquier persona puede registrarse con `POST /api/auth/register`: la cuenta siempre se crea con rol `CLIENTE`.
- Para usar los endpoints administrativos se necesita un usuario con rol `ADMIN`. Una vez autenticado como `ADMIN`, se pueden crear otros usuarios con `POST /api/usuarios`.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga automática (nodemon) |
| `pnpm start` | Servidor en modo producción |
| `pnpm seed` | Pobla o reinicia la base con datos de prueba iniciales |
| `pnpm test` | Todos los tests (Vitest) |
| `pnpm test:unit` | Tests unitarios |
| `pnpm test:integration` | Test de integración HTTP; usa la base configurada en `.env` y borra los datos que crea |
| `pnpm test:watch` | Tests en modo observador |

## Estructura

```
prisma/        schema.prisma y migraciones
src/
├── config/        variables de entorno y conexión a la base (Prisma)
├── errors/        clases de error de la API (400, 401, 403, 404, 409)
├── middlewares/   autenticación y roles, manejo de errores y ruta no encontrada
├── modules/       un directorio por entidad (rutas, controller, service, repository, validación y mapper)
└── utils/         funciones auxiliares de validación
tests/         tests unitarios, de integración y archivos .http de prueba manual
docs/          documentación del proyecto
```

## Documentación
El detalle del diseño, la API y las minutas está en [docs/README.md](docs/README.md).
