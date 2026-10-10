-- AlterTable
ALTER TABLE `producto` MODIFY `proveedorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `domicilio` VARCHAR(191) NULL;
