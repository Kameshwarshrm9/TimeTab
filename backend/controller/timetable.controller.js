import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateTimetable = async (req, res) => {
  try {
    await prisma.timetable.deleteMany(); // Clear old data

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 01:00",
      "02:00 - 03:00",
      "03:00 - 04:00",
      "04:00 - 05:00"
    ];

    const branches = await prisma.branch.findMany({
      include: {
        subjects: { include: { subject: true } },
        branchSubjectTeachers: {
          include: { subject: true, teacher: true }
        }
      }
    });

    const timetable = [];
    const teacherSchedule = {}; // teacherId -> day -> slot
    const teacherMorningTracker = {}; // teacherId -> Set of morning days

    for (const branch of branches) {
      const branchSchedule = {};
      const subjectDayTracker = {}; // subjectId -> day -> count

      weekdays.forEach(day => {
        branchSchedule[day] = {};
        timeSlots.forEach(slot => {
          branchSchedule[day][slot] = null;
        });
        subjectDayTracker[day] = {};
      });

      // Phase 1: Schedule Labs First
      const labSubjects = branch.subjects.filter(bs => bs.subject.isLab);
      for (const bs of labSubjects) {
        const subject = bs.subject;
        const frequency = bs.frequency;
        const isLab = subject.isLab;

        const assignment = branch.branchSubjectTeachers.find(x => x.subjectId === subject.id);
        if (!assignment) continue;

        const teacherId = assignment.teacherId;
        let slotsAssigned = 0;

        teacherMorningTracker[teacherId] = teacherMorningTracker[teacherId] || new Set();

        if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = {};
        weekdays.forEach(day => {
          if (!teacherSchedule[teacherId][day]) teacherSchedule[teacherId][day] = {};
        });

        // Systematic slot selection for labs
        let scheduled = false;
        for (let session = 0; session < Math.floor(frequency / 2) && slotsAssigned < frequency; session++) {
          scheduled = false;
          // Shuffle weekdays for this session to randomize day selection
          const shuffledDays = shuffleArray(weekdays);
          // Define valid starting slot indices for labs (excluding "12:00 - 01:00")
          const validSlotIndices = [0, 1, 4, 5]; // "09:00 - 11:00", "10:00 - 12:00", "14:00 - 16:00", "15:00 - 17:00"
          const shuffledSlotIndices = shuffleArray(validSlotIndices);
          
          for (const day of shuffledDays) {
            for (const slotIndex of shuffledSlotIndices) {
              const slot = timeSlots[slotIndex];
              const nextSlot = timeSlots[slotIndex + 1];
              const isMorning = slotIndex === 0;

              // Skip if lab can't be scheduled here (already handled by validSlotIndices, but keep for clarity)
              if (slot === "12:00 - 01:00") continue; // Can't start lab before break

              const teacherBusy = teacherSchedule[teacherId][day][slot];
              const branchBusy = branchSchedule[day][slot];
              const nextTeacherBusy = teacherSchedule[teacherId][day][nextSlot];
              const nextBranchBusy = branchSchedule[day][nextSlot];

              if (teacherBusy || branchBusy || nextTeacherBusy || nextBranchBusy) continue;

              // Check morning constraints
              if (isMorning) {
                if (teacherMorningTracker[teacherId].has(day)) continue;
                if (teacherMorningTracker[teacherId].size >= 3) continue;
              }

              // Assign LAB (2 hours)
              timetable.push(
                { branchId: branch.id, subjectId: subject.id, teacherId, day, timeSlot: slot },
                { branchId: branch.id, subjectId: subject.id, teacherId, day, timeSlot: nextSlot }
              );

              branchSchedule[day][slot] = subject.id;
              branchSchedule[day][nextSlot] = subject.id;

              teacherSchedule[teacherId][day][slot] = true;
              teacherSchedule[teacherId][day][nextSlot] = true;

              subjectDayTracker[day][subject.id] = (subjectDayTracker[day][subject.id] || 0) + 2;

              if (isMorning) teacherMorningTracker[teacherId].add(day);

              slotsAssigned += 2;
              scheduled = true;
              break;
            }
            if (scheduled) break;
          }
          if (!scheduled && slotsAssigned < frequency) {
            console.warn(`Could not schedule lab session for ${subject.name} (Branch: ${branch.name}, Sem: ${branch.semester}). Assigned ${slotsAssigned} of ${frequency} slots.`);
          }
        }
      }

      // Phase 2: Schedule Normal Subjects
      const normalSubjects = branch.subjects.filter(bs => !bs.subject.isLab);
      for (const bs of normalSubjects) {
        const subject = bs.subject;
        const frequency = bs.frequency;

        const assignment = branch.branchSubjectTeachers.find(x => x.subjectId === subject.id);
        if (!assignment) continue;

        const teacherId = assignment.teacherId;
        let slotsAssigned = 0;
        let retryCount = 0;

        teacherMorningTracker[teacherId] = teacherMorningTracker[teacherId] || new Set();

        if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = {};
        weekdays.forEach(day => {
          if (!teacherSchedule[teacherId][day]) teacherSchedule[teacherId][day] = {};
        });

        while (slotsAssigned < frequency && retryCount < frequency * 15) {
          retryCount++;

          const day = weekdays[Math.floor(Math.random() * weekdays.length)];
          const slotIndex = Math.floor(Math.random() * timeSlots.length);
          const slot = timeSlots[slotIndex];
          const isMorning = slotIndex === 0;

          // Skip scheduling during lunch break
          if (slot === "12:00 - 01:00") continue;

          const prevSlot = slotIndex > 0 ? timeSlots[slotIndex - 1] : null;
          const nextSlot = slotIndex < timeSlots.length - 1 ? timeSlots[slotIndex + 1] : null;

          const teacherBusy = teacherSchedule[teacherId]?.[day]?.[slot];
          const branchBusy = branchSchedule[day][slot];

          if (teacherBusy || branchBusy) continue;

          // Check if subject is already assigned on this day
          const subjectAssignedToday = subjectDayTracker[day][subject.id] || 0;
          if (frequency <= 5 && subjectAssignedToday > 0) continue;

          if (isMorning) {
            if (teacherMorningTracker[teacherId].has(day)) continue;
            if (teacherMorningTracker[teacherId].size >= 3) continue;
          }

          const prevBusy = prevSlot ? teacherSchedule[teacherId][day]?.[prevSlot] : false;
          const nextBusy = nextSlot ? teacherSchedule[teacherId][day]?.[nextSlot] : false;

          if (prevBusy || nextBusy) continue;

          timetable.push({
            branchId: branch.id,
            subjectId: subject.id,
            teacherId,
            day,
            timeSlot: slot
          });

          branchSchedule[day][slot] = subject.id;
          teacherSchedule[teacherId][day][slot] = true;

          subjectDayTracker[day][subject.id] = (subjectDayTracker[day][subject.id] || 0) + 1;

          if (isMorning) teacherMorningTracker[teacherId].add(day);

          slotsAssigned++;
        }

        if (slotsAssigned < frequency) {
          console.warn(`Could not schedule all slots for ${subject.name} (Branch: ${branch.name}, Sem: ${branch.semester}). Assigned ${slotsAssigned} of ${frequency} slots.`);
        }
      }
    }

    // Save final timetable to DB
    for (const entry of timetable) {
      try {
        await prisma.timetable.create({ data: entry });
      } catch (err) {
        if (err.code === "P2002") {
          console.warn("Skipping duplicate slot:", entry);
          continue;
        } else {
          throw err;
        }
      }
    }

    res.status(201).json({ message: "Timetable generated successfully", timetable });

  } catch (err) {
    console.error("Error generating timetable:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// GET /api/timetable?branch=CSE&semester=8
export const getTimetableByBranchAndSem = async (req, res) => {
  try {
    const { branch, semester } = req.params;

    const branchData = await prisma.branch.findFirst({
      where: {
        name: branch,
        semester: Number(semester),
      },
    });

    if (!branchData) {
      return res.status(404).json({ message: 'Branch or semester not found' });
    }

    const timetable = await prisma.timetable.findMany({
      where: {
        branchId: branchData.id
      },
      include: {
        subject: true,
        teacher: true,
      },
    });

    // Sort timetable: Monday to Friday, then by timeSlot
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    timetable.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    res.json({
      branch: branchData.name,
      semester: branchData.semester,
      timetable,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
};

// GET /api/teacher-timetable/:teacherId
export const getTeacherTimetable = async (req, res) => {
  const { teacherId } = req.params;
  try {
    console.log('Requested teacherId:', teacherId);
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

    // Sort timetable: Monday to Friday, then by timeSlot
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    timetable.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    // Format the response
    const formattedTimetable = timetable.map(entry => ({
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject.name,
      branch: entry.branch.name,
      semester: entry.branch.semester,
    }));

    res.json({
      teacherId: teacher.id,
      teacherName: teacher.name,
      timetable: formattedTimetable,
    });
  } catch (err) {
    console.error('Error fetching teacher timetable:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching teacher timetable', error: err.message });
  }
};

export const getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;

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

    // Sort timetable: Monday to Friday, then by timeSlot
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    timetable.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    // Format the response
    const formattedTimetable = timetable.map(entry => ({
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject.name,
      branch: entry.branch.name,
      semester: entry.branch.semester,
    }));

    res.json({
      teacherId: teacher.id,
      teacherName: teacher.name,
      timetable: formattedTimetable,
    });
  } catch (err) {
    console.error('Error fetching teacher schedule:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching teacher schedule', error: err.message });
  }
};