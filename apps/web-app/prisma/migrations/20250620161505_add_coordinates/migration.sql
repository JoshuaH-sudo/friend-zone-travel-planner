/*
  Warnings:

  - Added the required column `latitude` to the `Destination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Destination` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Destination" DROP CONSTRAINT "Destination_routeId_fkey";

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "Destination_order_seq";

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
