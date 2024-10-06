import express from "express";
import { getUser } from "../controllers/userController.js";
// import { verifyAccessTokenMiddleware } from "../controllers/authController.js";

const router = express.Router();

// router.get("/get-user", verifyAccessTokenMiddleware, getUser);
router.get("/get-user", getUser);

export default router;
