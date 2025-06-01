import express from 'express';
import { createBranch, getBranches, deleteBranch, bulkCreateBranches } from '../controller/branchController.js';

const router = express.Router();

router.post('/', createBranch);          // Create new branch: POST /api/branches
router.post('/bulk', bulkCreateBranches); // Bulk create branches: POST /api/branches/bulk
router.get('/', getBranches);            // Get all branches: GET /api/branches
router.delete('/:id', deleteBranch);     // Delete a branch: DELETE /api/branches/:id

export default router;