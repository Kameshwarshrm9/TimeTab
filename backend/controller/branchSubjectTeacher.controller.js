import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new branch-subject-teacher assignment
export const assignTeacherToBranchSubject = async (req, res) => {
  try {
    const { branchId, subjectId, teacherId } = req.body;

    // Basic validation
    if (!branchId || !subjectId || !teacherId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const assignment = await prisma.branchSubjectTeacher.create({
      data: {
        branchId,
        subjectId,
        teacherId,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error assigning teacher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Bulk create branch-subject-teacher assignments
export const bulkAssignTeachersToBranchSubjects = async (req, res) => {
  const assignments = req.body; // Array of { branchId, subjectId, teacherId }
  try {
    // Validate input
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of assignments" });
    }

    // Validate each assignment
    const validatedAssignments = assignments.map((assignment, index) => {
      if (!assignment.branchId || !assignment.subjectId || !assignment.teacherId) {
        throw new Error(`Assignment at index ${index} is missing required field: branchId, subjectId, or teacherId`);
      }
      return {
        branchId: Number(assignment.branchId),
        subjectId: Number(assignment.subjectId),
        teacherId: Number(assignment.teacherId),
      };
    });

    // Check for existing TeacherSubject records and create them if they don't exist
    const teacherSubjectPairs = [...new Set(validatedAssignments.map((a) => `${a.teacherId}-${a.subjectId}`))];
    const existingTeacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        OR: teacherSubjectPairs.map((pair) => {
          const [teacherId, subjectId] = pair.split('-').map(Number);
          return { teacherId, subjectId };
        }),
      },
      select: { teacherId: true, subjectId: true },
    });

    const existingTSPairs = existingTeacherSubjects.map((ts) => `${ts.teacherId}-${ts.subjectId}`);
    const newTeacherSubjects = teacherSubjectPairs
      .filter((pair) => !existingTSPairs.includes(pair))
      .map((pair) => {
        const [teacherId, subjectId] = pair.split('-').map(Number);
        return { teacherId, subjectId };
      });

    // Check for existing BranchSubject records and create them if they don't exist
    const branchSubjectPairs = [...new Set(validatedAssignments.map((a) => `${a.branchId}-${a.subjectId}`))];
    const existingBranchSubjects = await prisma.branchSubject.findMany({
      where: {
        OR: branchSubjectPairs.map((pair) => {
          const [branchId, subjectId] = pair.split('-').map(Number);
          return { branchId, subjectId };
        }),
      },
      select: { branchId: true, subjectId: true },
    });

    const existingBSPairs = existingBranchSubjects.map((bs) => `${bs.branchId}-${bs.subjectId}`);
    const newBranchSubjects = branchSubjectPairs
      .filter((pair) => !existingBSPairs.includes(pair))
      .map((pair) => {
        const [branchId, subjectId] = pair.split('-').map(Number);
        return { branchId, subjectId, frequency: 3 }; // Default frequency
      });

    // Check for existing BranchSubjectTeacher records
    const existingAssignments = await prisma.branchSubjectTeacher.findMany({
      where: {
        OR: validatedAssignments.map((a) => ({
          branchId: a.branchId,
          subjectId: a.subjectId,
          teacherId: a.teacherId,
        })),
      },
      select: { branchId: true, subjectId: true, teacherId: true },
    });

    const existingKeys = existingAssignments.map((a) => `${a.branchId}-${a.subjectId}-${a.teacherId}`);
    const duplicates = validatedAssignments
      .map((a, index) => ({ key: `${a.branchId}-${a.subjectId}-${a.teacherId}`, index }))
      .filter((a) => existingKeys.includes(a.key))
      .map((a) => a.index);

    if (duplicates.length > 0) {
      return res.status(400).json({
        error: `Assignments already exist in database at indices: ${duplicates.join(', ')}`,
      });
    }

    // Create necessary TeacherSubject and BranchSubject records, then create BranchSubjectTeacher records
    await prisma.$transaction([
      ...newTeacherSubjects.map((ts) =>
        prisma.teacherSubject.create({
          data: ts,
        })
      ),
      ...newBranchSubjects.map((bs) =>
        prisma.branchSubject.create({
          data: bs,
        })
      ),
      ...validatedAssignments.map((assignment) =>
        prisma.branchSubjectTeacher.create({
          data: assignment,
        })
      ),
    ]);

    res.status(201).json({
      message: `Successfully created ${validatedAssignments.length} branch-subject-teacher assignments`,
    });
  } catch (err) {
    console.error('Error bulk assigning teachers:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'One or more assignments violate unique constraints (branchId, subjectId combination already assigned)',
      });
    }
    res.status(400).json({ error: err.message || "Failed to bulk assign teachers" });
  }
};

// Get all branch-subject-teacher assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await prisma.branchSubjectTeacher.findMany({
      include: {
        branch: true,
        subject: true,
        teacher: true,
      },
    });
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get assignments by branch & semester
export const getAssignmentsByBranchAndSemester = async (req, res) => {
  try {
    const { branchId, semester } = req.query;

    if (!branchId || !semester) {
      return res.status(400).json({ error: 'Branch ID and semester are required' });
    }

    const assignments = await prisma.branchSubjectTeacher.findMany({
      where: {
        branch: {
          is: {
            id: parseInt(branchId),
            semester: parseInt(semester),
          },
        },
      },
      include: {
        branch: true,
        subject: true,
        teacher: true,
      },
    });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments by branch and semester:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a branch-subject-teacher assignment
export const deleteBranchSubjectTeacher = async (req, res) => {
  try {
    const { branchId, subjectId, teacherId } = req.params;

    // Validate inputs
    if (!branchId || !subjectId || !teacherId) {
      return res.status(400).json({ error: "branchId, subjectId, and teacherId are required" });
    }

    const parsedBranchId = parseInt(branchId);
    const parsedSubjectId = parseInt(subjectId);
    const parsedTeacherId = parseInt(teacherId);

    // Find the BranchSubjectTeacher record using branchId, subjectId, and teacherId
    const assignment = await prisma.branchSubjectTeacher.findFirst({
      where: {
        branchId: parsedBranchId,
        subjectId: parsedSubjectId,
        teacherId: parsedTeacherId,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Branch-Subject-Teacher assignment not found" });
    }

    // Delete related Timetable records
    await prisma.timetable.deleteMany({
      where: {
        branchId: parsedBranchId,
        subjectId: parsedSubjectId,
        teacherId: parsedTeacherId,
      },
    });

    // Delete the BranchSubjectTeacher record using its id
    await prisma.branchSubjectTeacher.delete({
      where: {
        id: assignment.id,
      },
    });

    res.status(200).json({ message: "Branch-Subject-Teacher assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};