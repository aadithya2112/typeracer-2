/*
  Warnings:

  - A unique constraint covering the columns `[roomId,isActive]` on the table `Race` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Race_roomId_isActive_key" ON "Race"("roomId", "isActive");
