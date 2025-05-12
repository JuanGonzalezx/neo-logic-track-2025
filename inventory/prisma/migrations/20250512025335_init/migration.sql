/*
  Warnings:

  - You are about to drop the column `product_id` on the `AlmacenProducto` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `Movement_Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_producto,id_almacen]` on the table `AlmacenProducto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_producto,id_almacen]` on the table `Movement_Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_producto,id_proveedor]` on the table `ProveedorProducto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_producto` to the `AlmacenProducto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_producto` to the `Movement_Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlmacenProducto" DROP CONSTRAINT "AlmacenProducto_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Movement_Inventory" DROP CONSTRAINT "Movement_Inventory_product_id_fkey";

-- AlterTable
ALTER TABLE "AlmacenProducto" DROP COLUMN "product_id",
ADD COLUMN     "id_producto" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Movement_Inventory" DROP COLUMN "product_id",
ADD COLUMN     "id_producto" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AlmacenProducto_id_producto_id_almacen_key" ON "AlmacenProducto"("id_producto", "id_almacen");

-- CreateIndex
CREATE UNIQUE INDEX "Movement_Inventory_id_producto_id_almacen_key" ON "Movement_Inventory"("id_producto", "id_almacen");

-- CreateIndex
CREATE UNIQUE INDEX "ProveedorProducto_id_producto_id_proveedor_key" ON "ProveedorProducto"("id_producto", "id_proveedor");

-- AddForeignKey
ALTER TABLE "AlmacenProducto" ADD CONSTRAINT "AlmacenProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement_Inventory" ADD CONSTRAINT "Movement_Inventory_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;
