/*
  Warnings:

  - You are about to drop the column `category_id` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_category_id_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "category_id",
ADD COLUMN     "categoria_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
