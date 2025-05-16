import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const resetDatabase = async (req, res) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'confirm') {
      return res.status(400).json({ error: 'Confirmation token must be "confirm"' });
    }

    await prisma.timetable.deleteMany();
    await prisma.branchSubjectTeacher.deleteMany();
    await prisma.branchSubject.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.branch.deleteMany();

    res.status(200).json({ message: "Database reset successfully!" });
  } catch (error) {
    console.error("Reset failed:", error);
    res.status(500).json({ error: "Something went wrong while resetting the DB" });
  }
};