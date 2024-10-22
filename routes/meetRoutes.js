import express from "express";
import { createMeet, getMeetInfo } from "../controllers/meetController.js";
import authMiddleware from "../middlewares/authMiidleware.js";

const router = express.Router();

router.post("/create-meet", authMiddleware, createMeet);
router.post("/get-meet-info", authMiddleware, getMeetInfo);

export default router;
