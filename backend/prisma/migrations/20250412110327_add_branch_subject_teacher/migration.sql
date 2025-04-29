/*
  Warnings:

  - The primary key for the `BranchSubjectTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[branchId,subjectId]` on the table `BranchSubjectTeacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BranchSubjectTeacher_branchId_subjectId_teacherId_key";

-- AlterTable
ALTER TABLE "BranchSubjectTeacher" DROP CONSTRAINT "BranchSubjectTeacher_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "BranchSubjectTeacher_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "BranchSubjectTeacher_branchId_subjectId_key" ON "BranchSubjectTeacher"("branchId", "subjectId");
