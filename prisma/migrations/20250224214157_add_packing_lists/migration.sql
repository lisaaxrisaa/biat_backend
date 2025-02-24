/*
  Warnings:

  - You are about to drop the column `category` on the `PackingList` table. All the data in the column will be lost.
  - You are about to drop the column `packed` on the `PackingList` table. All the data in the column will be lost.
  - You are about to drop the column `tripType` on the `PackingList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackingList" DROP COLUMN "category",
DROP COLUMN "packed",
DROP COLUMN "tripType";

-- CreateTable
CREATE TABLE "PackingItem" (
    "id" TEXT NOT NULL,
    "packingListId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "packed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackingItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackingItem" ADD CONSTRAINT "PackingItem_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
