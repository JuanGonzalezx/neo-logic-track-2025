-- CreateTable
CREATE TABLE "Coordinates" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "cityId" TEXT NOT NULL,
    "postal_code" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Coordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinates_User" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coordinate_id" TEXT NOT NULL,

    CONSTRAINT "Coordinates_User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coordinates_id_key" ON "Coordinates"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinates_User_id_key" ON "Coordinates_User"("id");

-- AddForeignKey
ALTER TABLE "Coordinates_User" ADD CONSTRAINT "Coordinates_User_coordinate_id_fkey" FOREIGN KEY ("coordinate_id") REFERENCES "Coordinates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
