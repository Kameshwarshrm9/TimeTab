import express from 'express';
import {
  assignSubjectToBranch,
  getSubjectsOfBranch,
  deleteSubjectFromBranch,
  bulkAssignSubjectsToBranches,
} from '../controller/branchSubjectController.js';

const router = express.Router();

router.post('/', assignSubjectToBranch);                // Assign subject to branch: POST /api/branch-subjects
router.post('/bulk', bulkAssignSubjectsToBranches);     // Bulk assign subjects to branches: POST /api/branch-subjects/bulk
router.get('/:branchId', getSubjectsOfBranch);          // Get subjects of a branch: GET /api/branch-subjects/:branchId
router.delete('/:branchId/:subjectId', deleteSubjectFromBranch); // Delete subject from branch: DELETE /api/branch-subjects/:branchId/:subjectId

export default router;