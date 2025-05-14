import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import cors from 'cors';
import subjectRoutes from './route/subjectRoutes.js';
import teacherRoutes from './route/teacherRoutes.js'; 
import branchRoutes from './route/branchRoutes.js';
import branchSubjectRoutes from './route/branchSubjectRoutes.js';
import branchSubjectTeacherRoutes from './route/branchSubjectTeacher.route.js'; 
import teacherSubjectRoutes from './route/teacherSubjectRoutes.js';
import timetableRoutes from "./route/timetable.routes.js";
import adminRoutes from "./route/ddRoutes.js";
import teacherTimetableRoutes from "./route/teacherTimetable.routes.js"

dotenv.config();

const app = express();
app.use(express.json());

// API Routes
app.use(cors());
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes); 
app.use('/api/branches', branchRoutes);
app.use('/api/branch-subjects', branchSubjectRoutes);
app.use('/api/branch-subject-teachers', branchSubjectTeacherRoutes); 
app.use('/api/teacher-subjects', teacherSubjectRoutes);
app.use("/api", timetableRoutes);
app.use('/api', teacherTimetableRoutes);
app.use("/api", adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is up and running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgGreen.black);
});
