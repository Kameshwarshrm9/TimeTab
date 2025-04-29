import express from 'express';
import { generateTimetable,  getTimetableByBranchAndSem} from '../controller/timetable.controller.js';

const router = express.Router();

router.post('/generate', generateTimetable);
// router.get('/:branchId', getTimetableByBranch);
router.get('/:branch/:semester', getTimetableByBranchAndSem);
export default router;
