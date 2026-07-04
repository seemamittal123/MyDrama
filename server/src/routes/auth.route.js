import express from "express";
import { logout, signIn, signUp } from "../controllers/auth.controller.js";

const auth = express.Router();

auth.post("/register", signUp);
auth.post("/login", signIn);
auth.get("/log-out", logout);
// auth.post("/send-otp",sendOtp);
// auth.put("/verify-otp",verifyOtp);
// auth.post("/reset-password");

export default auth;
