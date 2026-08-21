import express from "express";
import {
  logout,
  resetPassword,
  sendOtp,
  signIn,
  signUp,
  verifyOTP,
} from "../controllers/auth.controller.js";

const auth = express.Router();

auth.post("/register", signUp);
auth.post("/login", signIn);
auth.get("/log-out", logout);
auth.post("/send-otp", sendOtp);
auth.put("/verify-otp", verifyOTP);
auth.post("/reset-password", resetPassword);

export default auth;
