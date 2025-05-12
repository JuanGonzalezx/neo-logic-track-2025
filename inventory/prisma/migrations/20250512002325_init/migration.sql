/*
  Warnings:

  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_category_id_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Categoria_id_seq";

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_id_key" ON "Categoria"("id");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
