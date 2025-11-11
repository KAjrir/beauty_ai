/*
  Warnings:

  - You are about to drop the column `stripe_id` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripe_id";
