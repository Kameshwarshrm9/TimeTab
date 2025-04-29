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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};
