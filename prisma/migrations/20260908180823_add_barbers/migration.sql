/*
  Warnings:

  - Added the required column `barberId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "barberId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Barber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_barberId_idx" ON "Appointment"("barberId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
