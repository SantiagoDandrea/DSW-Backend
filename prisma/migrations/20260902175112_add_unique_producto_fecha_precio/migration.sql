/*
  Warnings:

  - A unique constraint covering the columns `[productoId,fechaDesde]` on the table `Precio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Precio_productoId_fechaDesde_key` ON `Precio`(`productoId`, `fechaDesde`);
