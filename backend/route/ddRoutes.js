import express from "express";
import { resetDatabase } from "../controller/ddController.js";
import { backupDatabase } from "../controller/backupController.js";

const router = express.Router();

router.get("/backup", backupDatabase);
router.post("/reset", resetDatabase);

export default router;