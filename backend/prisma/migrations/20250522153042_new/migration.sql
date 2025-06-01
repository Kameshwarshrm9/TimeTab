-- DropForeignKey
ALTER TABLE "BranchSubjectTeacher" DROP CONSTRAINT "BranchSubjectTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_teacherId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "department" TEXT;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
