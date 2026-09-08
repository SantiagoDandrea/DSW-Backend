# DSW-Backend

Backend de un ecommerce de colchonería, tecnología y electrodomésticos — TP de Desarrollo de Software (UTN FRRo).

## Stack
Node.js + Express + Prisma + MySQL.

## Requisitos previos
- Node 20+
- pnpm
- MySQL corriendo localmente (o accesible por red)

## Instalación

1. Instalá las dependencias:
   ```
   pnpm install
   ```
2. Copiá `.env.example` a `.env` y completá los valores:
   ```
   DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_db"
   JWT_SECRET="cualquier_string_random"
   ```
3. Aplicá las migraciones de la base de datos:
   ```
   npx prisma migrate dev
   ```
4. Levantá el servidor:
   ```
   pnpm dev
   ```
   El servidor queda escuchando en `http://localhost:3000`.

## Tests
```
pnpm test
```

## Documentación
Ver [docs/README.md](docs/README.md) para el contrato completo de la API.
