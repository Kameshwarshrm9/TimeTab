import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST: Assign subject to branch with frequency
export const assignSubjectToBranch = async (req, res) => {
  try {
    const { branchId, subjectId, frequency } = req.body;

    // Validate inputs
    if (!branchId || !subjectId || frequency == null) {
      return res.status(400).json({ error: "branchId, subjectId, and frequency are required" });
    }

    // Check if the assignment already exists
    const existingAssignment = await prisma.branchSubject.findFirst({
      where: {
        branchId: Number(branchId),
        subjectId: Number(subjectId),
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: `Branch (ID: ${branchId}) is already assigned to Subject (ID: ${subjectId})`,
      });
    }

    // Create the assignment
    const assignment = await prisma.branchSubject.create({
      data: {
        branchId: Number(branchId),
        subjectId: Number(subjectId),
        frequency: Number(frequency),
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning subject to branch:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: `Branch (ID: ${req.body.branchId}) is already assigned to Subject (ID: ${req.body.subjectId})`,
      });
    }
    res.status(500).json({ error: "Failed to assign subject to branch" });
  }
};

// POST: Bulk assign subjects to branches
export const bulkAssignSubjectsToBranches = async (req, res) => {
  const assignments = req.body; // Array of assignment objects
  try {
    // Validate input
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of assignments" });
    }

    // Validate each assignment and map to branchId and subjectId
    const validatedAssignments = [];
    for (const [index, assignment] of assignments.entries()) {
      const { branchName, semester, subjectName, frequency } = assignment;
      if (!branchName || !semester || !subjectName || frequency == null) {
        throw new Error(`Assignment at index ${index} is missing required field: branchName, semester, subjectName, or frequency`);
      }

      // Find branch by name and semester
      const branch = await prisma.branch.findFirst({
        where: {
          name: branchName,
          semester: Number(semester),
        },
      });
      if (!branch) {
        throw new Error(`Branch '${branchName}' with semester ${semester} not found at index ${index}`);
      }

      // Find subject by name
      const subject = await prisma.subject.findFirst({
        where: { name: subjectName },
      });
      if (!subject) {
        throw new Error(`Subject '${subjectName}' not found at index ${index}`);
      }

      validatedAssignments.push({
        branchId: branch.id,
        subjectId: subject.id,
        frequency: Number(frequency),
      });
    }

    // Check for duplicates within the input array
    const assignmentKeys = validatedAssignments.map((a) => `${a.branchId}-${a.subjectId}`);
    const duplicateKeys = assignmentKeys.filter((key, index) => assignmentKeys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Duplicate branch-subject assignments found in input: ${duplicateKeys.join(', ')}`,
      });
    }

    // Check for existing assignments in the database
    const existingAssignments = await prisma.branchSubject.findMany({
      where: {
        OR: validatedAssignments.map((a) => ({
          branchId: a.branchId,
          subjectId: a.subjectId,
        })),
      },
      select: { branchId: true, subjectId: true },
    });
    const existingKeys = existingAssignments.map((a) => `${a.branchId}-${a.subjectId}`);
    const duplicates = assignmentKeys.filter((key) => existingKeys.includes(key));
    if (duplicates.length > 0) {
      return res.status(400).json({
        error: `Branch-subject assignments already exist in database: ${duplicates.join(', ')}`,
      });
    }

    // Create assignments in a transaction
    const createdAssignments = await prisma.$transaction(
      validatedAssignments.map((assignment) =>
        prisma.branchSubject.create({
          data: assignment,
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdAssignments.length} branch-subject assignments`,
      assignments: createdAssignments,
    });
  } catch (err) {
    console.error('Error bulk assigning subjects to branches:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'One or more branch-subject assignments already exist',
      });
    }
    res.status(400).json({ error: err.message || "Failed to bulk assign subjects to branches" });
  }
};

// GET: Get subjects assigned to a branch
export const getSubjectsOfBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const subjects = await prisma.branchSubject.findMany({
      where: { branchId: Number(branchId) },
      include: {
        subject: true,
      },
    });

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects of branch:', error);
    res.status(500).json({ error: "Failed to fetch subjects of branch" });
  }
};

// DELETE: Remove subject from branch
export const deleteSubjectFromBranch = async (req, res) => {
  const { branchId, subjectId } = req.params;
  try {
    // Validate inputs
    if (!branchId || !subjectId) {
      return res.status(400).json({ error: "branchId and subjectId are required" });
    }

    const parsedBranchId = Number(branchId);
    const parsedSubjectId = Number(subjectId);

    // Check if the BranchSubject record exists
    const branchSubjectExists = await prisma.branchSubject.findUnique({
      where: {
        branchId_subjectId: {
          branchId: parsedBranchId,
          subjectId: parsedSubjectId,
        },
      },
    });
    if (!branchSubjectExists) {
      return res.status(404).json({ error: "Branch-Subject assignment not found" });
    }

    // Delete related Timetable records
    await prisma.timetable.deleteMany({
      where: {
        branchId: parsedBranchId,
        subjectId: parsedSubjectId,
      },
    });

    // Delete the BranchSubject record (cascading deletes will handle BranchSubjectTeacher)
    await prisma.branchSubject.delete({
      where: {
        branchId_subjectId: {
          branchId: parsedBranchId,
          subjectId: parsedSubjectId,
        },
      },
    });

    res.json({ message: "Subject removed from branch successfully" });
  } catch (error) {
    console.error('Error deleting subject from branch:', error);
    res.status(500).json({ error: "Failed to delete subject from branch" });
  }
};