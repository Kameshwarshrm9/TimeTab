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
// Get assignments by branch
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
