/*
  Warnings:

  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Categoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category_id` on the `Producto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_category_id_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "category_id",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
