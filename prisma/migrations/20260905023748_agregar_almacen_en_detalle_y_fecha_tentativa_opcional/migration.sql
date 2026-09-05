/*
  Warnings:

  - Added the required column `almacenId` to the `DetallePedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DetallePedido` ADD COLUMN `almacenId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Envio` MODIFY `fechaTentativa` DATETIME(3) NULL,
    MODIFY `estado` ENUM('PENDIENTE', 'EN_PREPARACION', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE INDEX `DetallePedido_almacenId_idx` ON `DetallePedido`(`almacenId`);

-- AddForeignKey
ALTER TABLE `DetallePedido` ADD CONSTRAINT `DetallePedido_almacenId_fkey` FOREIGN KEY (`almacenId`) REFERENCES `Almacen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
