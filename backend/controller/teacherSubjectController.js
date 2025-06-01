import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Assign a teacher to a subject
export const assignTeacherToSubject = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;

    if (!teacherId || !subjectId) {
      return res.status(400).json({ message: 'teacherId and subjectId are required' });
    }

    // Prevent duplicate assignment
    const existing = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: Number(teacherId),
        subjectId: Number(subjectId),
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Teacher already assigned to this subject' });
    }

    const assigned = await prisma.teacherSubject.create({
      data: {
        teacherId: Number(teacherId),
        subjectId: Number(subjectId),
      },
    });

    res.status(201).json(assigned);
  } catch (error) {
    console.error("Error assigning teacher to subject:", error);
    res.status(500).json({ error: "Failed to assign teacher to subject" });
  }
};

// POST: Bulk assign teachers to subjects
export const bulkAssignTeachersToSubjects = async (req, res) => {
  const assignments = req.body; // Array of assignment objects
  try {
    // Validate input
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of assignments" });
    }

    // Validate each assignment
    const validatedAssignments = [];
    for (const [index, assignment] of assignments.entries()) {
      const { teacherName, subjectName } = assignment;
      if (!teacherName || !subjectName) {
        throw new Error(`Assignment at index ${index} is missing required field: teacherName or subjectName`);
      }

      // Find teacher by name
      const teacher = await prisma.teacher.findFirst({
        where: { name: teacherName },
      });
      if (!teacher) {
        throw new Error(`Teacher '${teacherName}' not found at index ${index}`);
      }

      // Find subject by name
      const subject = await prisma.subject.findFirst({
        where: { name: subjectName },
      });
      if (!subject) {
        throw new Error(`Subject '${subjectName}' not found at index ${index}`);
      }

      validatedAssignments.push({
        teacherId: teacher.id,
        subjectId: subject.id,
      });
    }

    // Check for duplicates (teacherId and subjectId combination should be unique)
    const assignmentKeys = validatedAssignments.map((a) => `${a.teacherId}-${a.subjectId}`);
    const duplicateKeys = assignmentKeys.filter((key, index) => assignmentKeys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Duplicate assignments found in input: ${duplicateKeys.join(', ')}`,
      });
    }

    // Check for existing assignments in the database
    const existingAssignments = await prisma.teacherSubject.findMany({
      where: {
        OR: validatedAssignments.map((a) => ({
          teacherId: a.teacherId,
          subjectId: a.subjectId,
        })),
      },
      select: { teacherId: true, subjectId: true },
    });
    const existingKeys = existingAssignments.map((a) => `${a.teacherId}-${a.subjectId}`);
    const duplicates = assignmentKeys.filter((key) => existingKeys.includes(key));
    if (duplicates.length > 0) {
      return res.status(400).json({
        error: `Assignments already exist in database: ${duplicates.join(', ')}`,
      });
    }

    // Create assignments in a transaction
    const createdAssignments = await prisma.$transaction(
      validatedAssignments.map((assignment) =>
        prisma.teacherSubject.create({
          data: assignment,
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdAssignments.length} teacher-subject assignments`,
      assignments: createdAssignments,
    });
  } catch (err) {
    console.error('Error bulk assigning teachers to subjects:', err);
    res.status(400).json({ error: err.message || "Failed to bulk assign teachers to subjects" });
  }
};

// Get all subjects taught by a teacher
export const getSubjectsOfTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const subjects = await prisma.teacherSubject.findMany({
      where: { teacherId: Number(teacherId) },
      include: {
        subject: true,
      },
    });

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching teacher's subjects:", error);
    res.status(500).json({ error: "Failed to fetch teacher's subjects" });
  }
};

// DELETE: Remove a teacher-subject assignment
export const deleteTeacherSubject = async (req, res) => {
  const { teacherId, subjectId } = req.params;
  try {
    // Validate inputs
    if (!teacherId || !subjectId) {
      return res.status(400).json({ error: "teacherId and subjectId are required" });
    }

    const parsedTeacherId = Number(teacherId);
    const parsedSubjectId = Number(subjectId);

    // Check if the TeacherSubject record exists
    const teacherSubjectExists = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId: parsedTeacherId,
          subjectId: parsedSubjectId,
        },
      },
    });
    if (!teacherSubjectExists) {
      return res.status(404).json({ error: "Teacher-Subject assignment not found" });
    }

    // Delete related BranchSubjectTeacher records
    await prisma.branchSubjectTeacher.deleteMany({
      where: {
        teacherId: parsedTeacherId,
        subjectId: parsedSubjectId,
      },
    });

    // Delete related Timetable records
    await prisma.timetable.deleteMany({
      where: {
        teacherId: parsedTeacherId,
        subjectId: parsedSubjectId,
      },
    });

    // Delete the TeacherSubject record
    await prisma.teacherSubject.delete({
      where: {
        teacherId_subjectId: {
          teacherId: parsedTeacherId,
          subjectId: parsedSubjectId,
        },
      },
    });

    res.json({ message: "Teacher-Subject assignment deleted successfully" });
  } catch (error) {
    console.error('Error deleting teacher-subject assignment:', error);
    res.status(500).json({ error: "Failed to delete teacher-subject assignment" });
  }
};