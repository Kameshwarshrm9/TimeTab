/*
  Warnings:

  - A unique constraint covering the columns `[name,semester]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_semester_key" ON "Branch"("name", "semester");
