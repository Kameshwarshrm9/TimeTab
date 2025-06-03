import express from 'express';
import { generateTimetable, getTeacherSchedule, getTeacherTimetable, getTimetableByBranchAndSem} from '../controller/timetable.controller.js';

const router = express.Router();

router.post('/generate', generateTimetable);

router.get('/:branch/:semester', getTimetableByBranchAndSem);

router.get('/teacher-timetable/:teacherId', getTeacherTimetable);
router.get('/teacher-timetable/:teacherId/schedule', getTeacherSchedule);


export default router;
