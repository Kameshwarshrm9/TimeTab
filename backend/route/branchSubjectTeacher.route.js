import express from 'express';
import { assignTeacherToBranchSubject, getAllAssignments } from '../controller/branchSubjectTeacher.controller.js';

const router = express.Router();

// POST request to assign teacher to branch-subject
router.post('/', assignTeacherToBranchSubject);

// GET request to fetch all assignments
router.get('/', getAllAssignments);

export default router;
