import express from 'express';
import { assignTeacherToBranchSubject, getAllAssignments, getAssignmentsByBranchAndSemester, deleteBranchSubjectTeacher, bulkAssignTeachersToBranchSubjects } from '../controller/branchSubjectTeacher.controller.js';

const router = express.Router();

// POST request to assign teacher to branch-subject
router.post('/', assignTeacherToBranchSubject);

// POST request to bulk assign teachers to branch-subjects
router.post('/bulk', bulkAssignTeachersToBranchSubjects);

// GET request to fetch all assignments
router.get('/', getAllAssignments);

// GET request to fetch assignments by branch and semester
router.get('/by-branch-semester', getAssignmentsByBranchAndSemester);

// DELETE request to delete a branch-subject-teacher assignment
router.delete('/:branchId/:subjectId/:teacherId', deleteBranchSubjectTeacher);

export default router;