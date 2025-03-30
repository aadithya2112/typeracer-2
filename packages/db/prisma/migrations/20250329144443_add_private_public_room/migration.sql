/*
  Warnings:

  - Added the required column `textContent` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Room_adminId_key";

-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "textContent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT;
