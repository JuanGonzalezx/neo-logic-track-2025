/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Ciudad` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Departamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ciudad_id_key" ON "Ciudad"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_id_key" ON "Departamento"("id");
