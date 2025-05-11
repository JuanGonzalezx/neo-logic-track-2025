-- CreateEnum
CREATE TYPE "EstadoAlmacen" AS ENUM ('ACTIVO', 'MANTENIMIENTO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('INPUT', 'OUTPUT');

-- Crear Tabla Departamento
CREATE TABLE "Departamento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "pais" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Departamento_nombre_key" UNIQUE ("nombre")
);

-- Crear Tabla Ciudad
CREATE TABLE "Ciudad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" TEXT NOT NULL,
    "codigo_postal" TEXT NOT NULL,

    CONSTRAINT "Ciudad_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ciudad_nombre_departamentoId_key" UNIQUE ("nombre", "departamentoId") -- Restricción de unicidad
);
-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_producto" TEXT NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "codigo_barras" TEXT NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "peso_kg" DOUBLE PRECISION NOT NULL,
    "dimensiones_cm" DOUBLE PRECISION NOT NULL,
    "es_fragil" BOOLEAN NOT NULL,
    "requiere_refrigeracion" BOOLEAN NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProveedorProducto" (
    "id" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "id_proveedor" TEXT NOT NULL,

    CONSTRAINT "ProveedorProducto_pkey" PRIMARY KEY ("id")
);
-- Crear Tabla Direccion
CREATE TABLE "Direccion" (
    "id" TEXT NOT NULL, 
    "calle" TEXT NOT NULL,
    "ciudadId" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Direccion_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "Ciudad"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);


-- CreateTable
CREATE TABLE "Almacen" (
    "id_almacen" TEXT NOT NULL,
    "nombre_almacen" TEXT NOT NULL,
    "direccionId" TEXT NOT NULL,
    "gerente" TEXT NOT NULL,
    "gerenteId" TEXT DEFAULT NULL,
    "capacidad_m3" INTEGER NOT NULL,
    "capacidad_usada_m3" INTEGER NOT NULL,
    "estado" "EstadoAlmacen" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id_almacen"),
    CONSTRAINT "Almacen_direccionId_key" UNIQUE ("direccionId"),
    CONSTRAINT "Almacen_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "Direccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlmacenProducto" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "id_almacen" TEXT NOT NULL,
    "cantidad_stock" INTEGER NOT NULL,
    "nivel_reorden" INTEGER NOT NULL,
    "ultima_reposicion" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlmacenProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement_Inventory" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "id_almacen" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movement_Inventory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorProducto" ADD CONSTRAINT "ProveedorProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorProducto" ADD CONSTRAINT "ProveedorProducto_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlmacenProducto" ADD CONSTRAINT "AlmacenProducto_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlmacenProducto" ADD CONSTRAINT "AlmacenProducto_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "Almacen"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement_Inventory" ADD CONSTRAINT "Movement_Inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement_Inventory" ADD CONSTRAINT "Movement_Inventory_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "Almacen"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ciudad" ADD CONSTRAINT "Ciudad_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
