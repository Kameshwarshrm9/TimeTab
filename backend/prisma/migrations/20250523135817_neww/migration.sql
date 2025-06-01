-- DropForeignKey
ALTER TABLE "BranchSubject" DROP CONSTRAINT "BranchSubject_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchSubject" DROP CONSTRAINT "BranchSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "BranchSubjectTeacher" DROP CONSTRAINT "BranchSubjectTeacher_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchSubjectTeacher" DROP CONSTRAINT "BranchSubjectTeacher_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubject" ADD CONSTRAINT "BranchSubject_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubject" ADD CONSTRAINT "BranchSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
