/*
  Warnings:

  - You are about to drop the column `date` on the `Movement_Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Movement_Inventory` table. All the data in the column will be lost.
  - Added the required column `fecha` to the `Movement_Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Tipo" AS ENUM ('ENTRADA', 'SALIDA');

-- AlterTable
ALTER TABLE "Movement_Inventory" DROP COLUMN "date",
DROP COLUMN "type",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tipo" "Tipo" NOT NULL DEFAULT 'ENTRADA';

-- DropEnum
DROP TYPE "Type";
