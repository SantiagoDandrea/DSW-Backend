-- CreateTable
CREATE TABLE `Localidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `codigoPostal` VARCHAR(191) NOT NULL,
    `provincia` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `dni` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'CLIENTE') NOT NULL,
    `localidadId` INTEGER NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_localidadId_idx`(`localidadId`),
    PRIMARY KEY (`dni`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Marca_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cuit` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Proveedor_cuit_key`(`cuit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `marcaId` INTEGER NOT NULL,
    `proveedorId` INTEGER NOT NULL,

    INDEX `Producto_categoriaId_idx`(`categoriaId`),
    INDEX `Producto_marcaId_idx`(`marcaId`),
    INDEX `Producto_proveedorId_idx`(`proveedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenProducto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productoId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `orden` INTEGER NULL,

    INDEX `ImagenProducto_productoId_idx`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Precio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productoId` INTEGER NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,

    INDEX `Precio_productoId_idx`(`productoId`),
    INDEX `Precio_fechaDesde_idx`(`fechaDesde`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Almacen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productoId` INTEGER NOT NULL,
    `almacenId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,

    INDEX `Stock_productoId_idx`(`productoId`),
    INDEX `Stock_almacenId_idx`(`almacenId`),
    UNIQUE INDEX `Stock_productoId_almacenId_key`(`productoId`, `almacenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedioPago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MedioPago_descripcion_key`(`descripcion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioDni` VARCHAR(191) NOT NULL,
    `medioPagoId` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO') NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(10, 2) NOT NULL,

    INDEX `Pedido_usuarioDni_idx`(`usuarioDni`),
    INDEX `Pedido_medioPagoId_idx`(`medioPagoId`),
    INDEX `Pedido_estado_idx`(`estado`),
    INDEX `Pedido_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetallePedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,

    INDEX `DetallePedido_pedidoId_idx`(`pedidoId`),
    INDEX `DetallePedido_productoId_idx`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Envio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` INTEGER NOT NULL,
    `domicilioEntrega` VARCHAR(191) NOT NULL,
    `costo` DECIMAL(10, 2) NOT NULL,
    `fechaTentativa` DATETIME(3) NOT NULL,
    `fechaEntregado` DATETIME(3) NULL,
    `estado` ENUM('PENDIENTE', 'EN_PREPARACION', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO') NOT NULL,

    UNIQUE INDEX `Envio_pedidoId_key`(`pedidoId`),
    INDEX `Envio_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_localidadId_fkey` FOREIGN KEY (`localidadId`) REFERENCES `Localidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `Marca`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenProducto` ADD CONSTRAINT `ImagenProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Precio` ADD CONSTRAINT `Precio_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_almacenId_fkey` FOREIGN KEY (`almacenId`) REFERENCES `Almacen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_usuarioDni_fkey` FOREIGN KEY (`usuarioDni`) REFERENCES `Usuario`(`dni`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_medioPagoId_fkey` FOREIGN KEY (`medioPagoId`) REFERENCES `MedioPago`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePedido` ADD CONSTRAINT `DetallePedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetallePedido` ADD CONSTRAINT `DetallePedido_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Envio` ADD CONSTRAINT `Envio_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
