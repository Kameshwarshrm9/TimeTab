import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

export const backupDatabase = async (req, res) => {
  try {
    // Fetch all data from tables
    const teachers = await prisma.teacher.findMany();
    const subjects = await prisma.subject.findMany();
    const branches = await prisma.branch.findMany();
    const timetable = await prisma.timetable.findMany({
      include: { branch: true, subject: true, teacher: true },
    });
    const branchSubjects = await prisma.branchSubject.findMany({
      include: { branch: true, subject: true },
    });
    const branchSubjectTeachers = await prisma.branchSubjectTeacher.findMany({
      include: { branch: true, subject: true, teacher: true },
    });
    const teacherSubjects = await prisma.teacherSubject.findMany({
      include: { teacher: true, subject: true },
    });

    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();

    // Teachers sheet
    const teacherSheet = XLSX.utils.json_to_sheet(
      teachers.map(t => ({
        ID: t.id,
        Name: t.name,
        Email: t.email,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, teacherSheet, 'Teachers');

    // Subjects sheet
    const subjectSheet = XLSX.utils.json_to_sheet(
      subjects.map(s => ({
        ID: s.id,
        Name: s.name,
        Code: s.code,
        IsLab: s.isLab,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Subjects');

    // Branches sheet
    const branchSheet = XLSX.utils.json_to_sheet(
      branches.map(b => ({
        ID: b.id,
        Name: b.name,
        Semester: b.semester,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, branchSheet, 'Branches');

    // Timetable sheet
    const timetableSheet = XLSX.utils.json_to_sheet(
      timetable.map(t => ({
        ID: t.id,
        Branch: t.branch.name,
        Semester: t.branch.semester,
        Subject: t.subject.name,
        Teacher: t.teacher.name,
        Day: t.day,
        TimeSlot: t.timeSlot,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable');

    // BranchSubjects sheet
    const branchSubjectSheet = XLSX.utils.json_to_sheet(
      branchSubjects.map(bs => ({
        ID: bs.id,
        Branch: bs.branch.name,
        Subject: bs.subject.name,
        Frequency: bs.frequency,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, branchSubjectSheet, 'BranchSubjects');

    // BranchSubjectTeachers sheet
    const branchSubjectTeacherSheet = XLSX.utils.json_to_sheet(
      branchSubjectTeachers.map(bst => ({
        ID: bst.id,
        Branch: bst.branch.name,
        Subject: bst.subject.name,
        Teacher: bst.teacher.name,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, branchSubjectTeacherSheet, 'BranchSubjectTeachers');

    // TeacherSubjects sheet
    const teacherSubjectSheet = XLSX.utils.json_to_sheet(
      teacherSubjects.map(ts => ({
        ID: ts.id,
        Teacher: ts.teacher.name,
        Subject: ts.subject.name,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, teacherSubjectSheet, 'TeacherSubjects');

    // Generate Excel file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.xlsx`;
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error generating backup:', error);
    res.status(500).json({ error: 'Failed to generate backup' });
  }
};