/*
  Warnings:

  - You are about to drop the `Patitent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Patitent" DROP CONSTRAINT "Patitent_userId_fkey";

-- DropTable
DROP TABLE "Patitent";

-- CreateTable
CREATE TABLE "patitent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "address" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "patitent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patitent_email_key" ON "patitent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patitent_userId_key" ON "patitent"("userId");

-- CreateIndex
CREATE INDEX "idx_patitent_email" ON "patitent"("email");

-- CreateIndex
CREATE INDEX "idx_patitent_isDeleted" ON "patitent"("isDeleted");

-- AddForeignKey
ALTER TABLE "patitent" ADD CONSTRAINT "patitent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
