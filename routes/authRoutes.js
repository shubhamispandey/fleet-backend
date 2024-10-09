import express from "express";
import {
  getUser,
  login,
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiidleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);

export default router;
