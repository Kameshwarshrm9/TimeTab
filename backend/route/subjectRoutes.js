import express from "express";
import { getAllSubjects, createSubject, bulkCreateSubjects, updateSubject, deleteSubject } from "../controller/subjectController.js";

const router = express.Router();

router.get("/getsub", getAllSubjects);      // GET /api/subjects/getsub
router.post("/create", createSubject);      // POST /api/subjects/create
router.post("/bulk", bulkCreateSubjects);   // POST /api/subjects/bulk
router.put("/:id", updateSubject);          // PUT /api/subjects/:id
router.delete("/:id", deleteSubject);       // DELETE /api/subjects/:id

export default router;