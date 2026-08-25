/*
  Warnings:

  - A unique constraint covering the columns `[nombre,codigoPostal]` on the table `Localidad` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Localidad_nombre_codigoPostal_key` ON `Localidad`(`nombre`, `codigoPostal`);
