/*
  Warnings:

  - A unique constraint covering the columns `[id_producto,id_almacen,fecha]` on the table `Movement_Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Movement_Inventory_id_producto_id_almacen_key";

DROP TABLE "ProveedorProducto"; 

ALTER TABLE "Movement_Inventory"
ADD COLUMN "id_proveedor" TEXT;

ALTER TABLE "Movement_Inventory"
ADD CONSTRAINT fk_nombre_constraint
FOREIGN KEY ("id_proveedor") 
REFERENCES "Proveedor"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Movement_Inventory_id_producto_id_almacen_fecha_key" ON "Movement_Inventory"("id_producto", "id_almacen", "id_proveedor" ,"fecha");

ALTER TABLE "Almacen"
ADD COLUMN "despachadorId" TEXT;

ALTER TABLE "Almacen"
ADD COLUMN "despachador" TEXT;