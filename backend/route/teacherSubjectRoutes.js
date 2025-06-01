import express from 'express';
import {
  assignTeacherToSubject,
  bulkAssignTeachersToSubjects,
  getSubjectsOfTeacher,
  deleteTeacherSubject,
} from '../controller/teacherSubjectController.js';

const router = express.Router();

router.post('/', assignTeacherToSubject);              // Assign teacher to subject: POST /api/teacher-subjects
router.post('/bulk', bulkAssignTeachersToSubjects);    // Bulk assign teachers to subjects: POST /api/teacher-subjects/bulk
router.get('/:teacherId', getSubjectsOfTeacher);       // Get subjects of a teacher: GET /api/teacher-subjects/:teacherId
router.delete('/:teacherId/:subjectId', deleteTeacherSubject); // Delete teacher-subject assignment: DELETE /api/teacher-subjects/:teacherId/:subjectId

export default router;