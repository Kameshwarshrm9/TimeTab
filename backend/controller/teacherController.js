import prisma from '../config/db.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Create a new teacher
export const createTeacher = async (req, res) => {
  const { name, email, department } = req.body;
  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check for existing teacher with the same name or email
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ name }, email ? { email } : {}],
      },
    });

    if (existingTeacher) {
      if (existingTeacher.name === name) {
        return res.status(400).json({ error: `Teacher with name '${name}' already exists` });
      }
      if (email && existingTeacher.email === email) {
        return res.status(400).json({ error: `Teacher with email '${email}' already exists` });
      }
    }

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        department,
      },
    });

    res.status(201).json(teacher);
  } catch (err) {
    console.error('Error creating teacher:', err);
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('name')) {
        return res.status(400).json({ error: `Teacher with name '${name}' already exists` });
      }
      if (err.meta?.target?.includes('email')) {
        return res.status(400).json({ error: `Teacher with email '${email}' already exists` });
      }
    }
    res.status(500).json({ error: 'Failed to create teacher' });
  }
};

// Bulk create teachers
export const bulkCreateTeachers = async (req, res) => {
  const teachers = req.body;
  try {
    // Validate input
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ error: 'Expected an array of teachers' });
    }

    // Validate each teacher
    const validatedTeachers = teachers.map((teacher, index) => {
      if (!teacher.name) {
        throw new Error(`Teacher at index ${index} is missing required field: name`);
      }
      return {
        name: teacher.name,
        email: teacher.email || null,
        department: teacher.department || null,
      };
    });

    // Check for duplicates within the input array
    const nameKeys = validatedTeachers.map((t) => t.name);
    const emailKeys = validatedTeachers
      .filter((t) => t.email)
      .map((t) => t.email);
    const duplicateNames = nameKeys.filter((name, index) => nameKeys.indexOf(name) !== index);
    const duplicateEmails = emailKeys.filter((email, index) => emailKeys.indexOf(email) !== index);
    if (duplicateNames.length > 0) {
      return res.status(400).json({
        error: `Duplicate teacher names found in input: ${duplicateNames.join(', ')}`,
      });
    }
    if (duplicateEmails.length > 0) {
      return res.status(400).json({
        error: `Duplicate teacher emails found in input: ${duplicateEmails.join(', ')}`,
      });
    }

    // Check for existing teachers in the database
    const existingTeachers = await prisma.teacher.findMany({
      where: {
        OR: [
          { name: { in: validatedTeachers.map((t) => t.name) } },
          { email: { in: validatedTeachers.filter((t) => t.email).map((t) => t.email) } },
        ],
      },
      select: { name: true, email: true },
    });
    const existingNames = existingTeachers.map((t) => t.name);
    const existingEmails = existingTeachers.filter((t) => t.email).map((t) => t.email);
    const duplicateExistingNames = validatedTeachers
      .filter((t) => existingNames.includes(t.name))
      .map((t) => t.name);
    const duplicateExistingEmails = validatedTeachers
      .filter((t) => t.email && existingEmails.includes(t.email))
      .map((t) => t.email);
    if (duplicateExistingNames.length > 0) {
      return res.status(400).json({
        error: `Teacher names already exist in database: ${duplicateExistingNames.join(', ')}`,
      });
    }
    if (duplicateExistingEmails.length > 0) {
      return res.status(400).json({
        error: `Teacher emails already exist in database: ${duplicateExistingEmails.join(', ')}`,
      });
    }

    // Create teachers in a transaction
    const createdTeachers = await prisma.$transaction(
      validatedTeachers.map((teacher) =>
        prisma.teacher.create({
          data: teacher,
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdTeachers.length} teachers`,
      teachers: createdTeachers,
    });
  } catch (err) {
    console.error('Error bulk creating teachers:', err);
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('name')) {
        return res.status(400).json({ error: "One or more teacher names already exist" });
      }
      if (err.meta?.target?.includes('email')) {
        return res.status(400).json({ error: "One or more emails already exist" });
      }
    }
    res.status(400).json({ error: err.message || 'Failed to bulk create teachers' });
  }
};

// Update a teacher
export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, email, department } = req.body;
  try {
    // Check if teacher exists
    const teacherExists = await prisma.teacher.findUnique({
      where: { id: Number(id) },
    });
    if (!teacherExists) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check for conflicts with other teachers
    const conflictingTeacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ name }, email ? { email } : {}],
        NOT: { id: Number(id) },
      },
    });

    if (conflictingTeacher) {
      if (conflictingTeacher.name === name) {
        return res.status(400).json({ error: `Teacher with name '${name}' already exists` });
      }
      if (email && conflictingTeacher.email === email) {
        return res.status(400).json({ error: `Teacher with email '${email}' already exists` });
      }
    }

    // Update the teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        department,
      },
    });

    res.json(updatedTeacher);
  } catch (err) {
    console.error('Error updating teacher:', err);
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('name')) {
        return res.status(400).json({ error: `Teacher with name '${name}' already exists` });
      }
      if (err.meta?.target?.includes('email')) {
        return res.status(400).json({ error: `Teacher with email '${email}' already exists` });
      }
    }
    res.status(500).json({ error: 'Failed to update teacher' });
  }
};

// Delete a teacher
export const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if teacher exists
    const teacherExists = await prisma.teacher.findUnique({
      where: { id: Number(id) },
    });
    if (!teacherExists) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete the teacher (cascading deletes will handle related records)
    await prisma.teacher.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};