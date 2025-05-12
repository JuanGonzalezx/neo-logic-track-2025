/*
  Warnings:

  - A unique constraint covering the columns `[id_producto,id_almacen,fecha]` on the table `Movement_Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Movement_Inventory_id_producto_id_almacen_key";

-- CreateIndex
CREATE UNIQUE INDEX "Movement_Inventory_id_producto_id_almacen_fecha_key" ON "Movement_Inventory"("id_producto", "id_almacen", "fecha");
