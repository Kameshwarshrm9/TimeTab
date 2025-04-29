import express from "express";
import { resetDatabase } from "../controller/ddController.js";

const router = express.Router();

router.post("/reset", resetDatabase);

export default router;
