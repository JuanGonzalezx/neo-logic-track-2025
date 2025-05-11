/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Almacen` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Almacen` table. All the data in the column will be lost.

*/
-- DropIndex
ALTER TABLE "Departamento" DROP CONSTRAINT "Departamento_nombre_key";


-- AlterTable
ALTER TABLE "Almacen" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
