import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

export const createSubject = async (req, res) => {
  const { name, code, isLab = false } = req.body; // default to false if not provided
  try {
    const subject = await prisma.subject.create({
      data: { name, code, isLab },
    });
    res.status(201).json(subject);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error creating subject" });
  }
};
