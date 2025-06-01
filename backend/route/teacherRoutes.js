import express from 'express';
const router = express.Router();

import { getAllTeachers, createTeacher, bulkCreateTeachers, updateTeacher, deleteTeacher } from '../controller/teacherController.js';

router.get('/', getAllTeachers);         // GET /api/teachers
router.post('/', createTeacher);         // POST /api/teachers
router.post('/bulk', bulkCreateTeachers); // POST /api/teachers/bulk
router.put('/:id', updateTeacher);       // PUT /api/teachers/:id
router.delete('/:id', deleteTeacher);    // DELETE /api/teachers/:id

export default router;