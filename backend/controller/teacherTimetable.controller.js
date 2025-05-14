export const getTeacherTimetable = async (req, res) => {
    const { teacherId } = req.params;
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(teacherId) },
      });
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      const timetable = await prisma.timetable.findMany({
        where: { teacherId: Number(teacherId) },
        include: {
          branch: true,
          subject: true,
        },
      });
  
      timetable.sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
  
      res.json({
        teacherId: teacher.id,
        teacherName: teacher.name,
        timetable,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching teacher timetable' });
    }
  };
  