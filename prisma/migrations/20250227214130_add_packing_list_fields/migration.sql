/*
  Warnings:

  - You are about to drop the `ChecklistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_userId_fkey";

-- AlterTable
ALTER TABLE "PackingList" ADD COLUMN     "category" TEXT,
ADD COLUMN     "departureDate" TIMESTAMP(3),
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "returnDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "ChecklistItem";
