import express from 'express';
import { getTeacherTimetable } from '../controller/teacherTimetable.controller.js'; // if same file

const router = express.Router();

router.get('/teacher-timetable/:teacherId', getTeacherTimetable);

export default router;
