-- CreateTable
CREATE TABLE "BranchSubjectTeacher" (
    "branchId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "BranchSubjectTeacher_pkey" PRIMARY KEY ("branchId","subjectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchSubjectTeacher_branchId_subjectId_teacherId_key" ON "BranchSubjectTeacher"("branchId", "subjectId", "teacherId");

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSubjectTeacher" ADD CONSTRAINT "BranchSubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
