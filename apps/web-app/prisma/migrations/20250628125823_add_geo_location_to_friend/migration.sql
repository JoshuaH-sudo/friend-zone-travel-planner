/*
  Warnings:

  - Added the required column `latitude` to the `Friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
