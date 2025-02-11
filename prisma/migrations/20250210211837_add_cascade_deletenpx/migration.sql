-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_itineraryId_fkey";

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
