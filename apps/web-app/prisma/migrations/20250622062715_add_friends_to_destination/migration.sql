-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "destinationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
