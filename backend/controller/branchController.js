import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST: Create a new branch
export const createBranch = async (req, res) => {
  try {
    const { name, semester } = req.body;

    if (!name || !semester) {
      return res.status(400).json({ message: 'Name and semester are required' });
    }

    const parsedSemester = Number(semester);

    // Check if a branch with the same name and semester already exists
    const existingBranch = await prisma.branch.findFirst({
      where: {
        name,
        semester: parsedSemester,
      },
    });

    if (existingBranch) {
      return res.status(400).json({
        error: `Branch with name '${name}' and semester ${semester} already exists`,
      });
    }

    const newBranch = await prisma.branch.create({
      data: { name, semester: parsedSemester },
    });

    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: `Branch with name '${req.body.name}' and semester ${req.body.semester} already exists`,
      });
    }
    res.status(500).json({ error: "Failed to create branch" });
  }
};

// POST: Bulk create branches
export const bulkCreateBranches = async (req, res) => {
  const branches = req.body; // Array of branch objects
  try {
    // Validate input
    if (!Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of branches" });
    }

    // Validate each branch
    const validatedBranches = branches.map((branch, index) => {
      if (!branch.name || !branch.semester) {
        throw new Error(`Branch at index ${index} is missing required field: name or semester`);
      }
      return {
        name: branch.name,
        semester: Number(branch.semester),
      };
    });

    // Check for duplicates within the input array (name and semester combination should be unique)
    const branchKeys = validatedBranches.map((b) => `${b.name}-${b.semester}`);
    const duplicateKeys = branchKeys.filter((key, index) => branchKeys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Duplicate branches found in input: ${duplicateKeys.join(', ')}`,
      });
    }

    // Check for existing branches in the database
    const existingBranches = await prisma.branch.findMany({
      where: {
        OR: validatedBranches.map((b) => ({ name: b.name, semester: b.semester })),
      },
      select: { name: true, semester: true },
    });
    const existingKeys = existingBranches.map((b) => `${b.name}-${b.semester}`);
    const duplicates = branchKeys.filter((key) => existingKeys.includes(key));
    if (duplicates.length > 0) {
      return res.status(400).json({
        error: `Branches already exist in database: ${duplicates.join(', ')}`,
      });
    }

    // Create branches in a transaction
    const createdBranches = await prisma.$transaction(
      validatedBranches.map((branch) =>
        prisma.branch.create({
          data: branch,
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdBranches.length} branches`,
      branches: createdBranches,
    });
  } catch (err) {
    console.error('Error bulk creating branches:', err);
    // Handle Prisma unique constraint violation
    if (err.code === 'P2002') {
      const duplicates = branches
        .map((b) => `${b.name}-${b.semester}`)
        .filter((key, index, self) => self.indexOf(key) === index);
      return res.status(400).json({
        error: `Branches already exist in database: ${duplicates.join(', ')}`,
      });
    }
    res.status(400).json({ error: err.message || "Failed to bulk create branches" });
  }
};

// GET: Fetch all branches
export const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

// DELETE: Delete a branch by ID
export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the branch exists
    const branchExists = await prisma.branch.findUnique({
      where: { id: Number(id) },
    });
    if (!branchExists) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Delete the branch (cascading deletes will handle related records)
    await prisma.branch.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: "Failed to delete branch" });
  }
};