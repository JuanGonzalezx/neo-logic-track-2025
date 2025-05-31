-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ASSIGNED', 'ON_ROUTE', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "customer_name" TEXT NULL,
    "customer_email" TEXT NULL,
    "delivery_name" TEXT NULL,
    "delivery_email" TEXT NULL,
    "coordinate_id" TEXT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "id_almacen" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "distance" DOUBLE PRECISION NULL,
    "timeEstimated" TEXT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProducts" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
