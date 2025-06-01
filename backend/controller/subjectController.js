import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

// Create a new subject
export const createSubject = async (req, res) => {
  const { name, code, isLab = false } = req.body;
  try {
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }

    // Check for existing subject with the same name or code
    const existingSubject = await prisma.subject.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingSubject) {
      if (existingSubject.name === name) {
        return res.status(400).json({ error: `Subject with name '${name}' already exists` });
      }
      if (existingSubject.code === code) {
        return res.status(400).json({ error: `Subject with code '${code}' already exists` });
      }
    }

    const subject = await prisma.subject.create({
      data: { name, code, isLab },
    });
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) {
        return res.status(400).json({ error: `Subject with name '${name}' already exists` });
      }
      if (error.meta?.target?.includes('code')) {
        return res.status(400).json({ error: `Subject with code '${code}' already exists` });
      }
    }
    res.status(400).json({ error: "Error creating subject" });
  }
};

// Bulk create subjects
export const bulkCreateSubjects = async (req, res) => {
  const subjects = req.body;
  try {
    // Validate input
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of subjects" });
    }

    // Validate each subject
    const validatedSubjects = subjects.map((subject, index) => {
      if (!subject.name || !subject.code) {
        throw new Error(`Subject at index ${index} is missing required field: name or code`);
      }
      return {
        name: subject.name,
        code: subject.code,
        isLab: subject.isLab ?? false,
      };
    });

    // Check for duplicates within the input array
    const nameKeys = validatedSubjects.map((s) => s.name);
    const codeKeys = validatedSubjects.map((s) => s.code);
    const duplicateNames = nameKeys.filter((name, index) => nameKeys.indexOf(name) !== index);
    const duplicateCodes = codeKeys.filter((code, index) => codeKeys.indexOf(code) !== index);
    if (duplicateNames.length > 0) {
      return res.status(400).json({
        error: `Duplicate subject names found in input: ${duplicateNames.join(', ')}`,
      });
    }
    if (duplicateCodes.length > 0) {
      return res.status(400).json({
        error: `Duplicate subject codes found in input: ${duplicateCodes.join(', ')}`,
      });
    }

    // Check for existing subjects in the database
    const existingSubjects = await prisma.subject.findMany({
      where: {
        OR: [
          { name: { in: validatedSubjects.map((s) => s.name) } },
          { code: { in: validatedSubjects.map((s) => s.code) } },
        ],
      },
      select: { name: true, code: true },
    });
    const existingNames = existingSubjects.map((s) => s.name);
    const existingCodes = existingSubjects.map((s) => s.code);
    const duplicateExistingNames = validatedSubjects
      .filter((s) => existingNames.includes(s.name))
      .map((s) => s.name);
    const duplicateExistingCodes = validatedSubjects
      .filter((s) => existingCodes.includes(s.code))
      .map((s) => s.code);
    if (duplicateExistingNames.length > 0) {
      return res.status(400).json({
        error: `Subject names already exist in database: ${duplicateExistingNames.join(', ')}`,
      });
    }
    if (duplicateExistingCodes.length > 0) {
      return res.status(400).json({
        error: `Subject codes already exist in database: ${duplicateExistingCodes.join(', ')}`,
      });
    }

    // Create subjects in a transaction
    const createdSubjects = await prisma.$transaction(
      validatedSubjects.map((subject) =>
        prisma.subject.create({
          data: subject,
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdSubjects.length} subjects`,
      subjects: createdSubjects,
    });
  } catch (err) {
    console.error('Error bulk creating subjects:', err);
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('name')) {
        return res.status(400).json({ error: "One or more subject names already exist" });
      }
      if (err.meta?.target?.includes('code')) {
        return res.status(400).json({ error: "One or more subject codes already exist" });
      }
    }
    res.status(400).json({ error: err.message || "Failed to bulk create subjects" });
  }
};

// Update a subject
export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { name, code, isLab } = req.body;
  try {
    // Check if subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: Number(id) },
    });
    if (!subjectExists) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }

    // Check for conflicts with other subjects
    const conflictingSubject = await prisma.subject.findFirst({
      where: {
        OR: [{ name }, { code }],
        NOT: { id: Number(id) },
      },
    });

    if (conflictingSubject) {
      if (conflictingSubject.name === name) {
        return res.status(400).json({ error: `Subject with name '${name}' already exists` });
      }
      if (conflictingSubject.code === code) {
        return res.status(400).json({ error: `Subject with code '${code}' already exists` });
      }
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id: Number(id) },
      data: { name, code, isLab: isLab ?? false },
    });

    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) {
        return res.status(400).json({ error: `Subject with name '${name}' already exists` });
      }
      if (error.meta?.target?.includes('code')) {
        return res.status(400).json({ error: `Subject with code '${code}' already exists` });
      }
    }
    res.status(500).json({ error: "Failed to update subject" });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: Number(id) },
    });
    if (!subjectExists) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Delete the subject (cascading deletes will handle related records)
    await prisma.subject.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: "Failed to delete subject" });
  }
};