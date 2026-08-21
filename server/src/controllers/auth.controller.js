import bcrypt from "bcryptjs/dist/bcrypt.js";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import User from "../models/user.js";
import getToken from "../utils/token.js";
import { sendOtpmail } from "../utils/mail.js";

const otpStore = new Map();
const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User is alerady exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      email,
      username,
      password: hashPassword,
    });

    const token = await getToken(user?._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return res.status(200).json({ message: "Successful", user });
  } catch (error) {
    return res.status(500).json({ message: `Sign up error ${error}` });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Password is incorrect", success: false });
    }

    const token = await getToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Successful", user });
  } catch (error) {
    return res.status(500).json({ message: `Sign in error ${error}` });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Log out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error}` });
  }
};
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({ message: "User is not exist" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpmail(email, otp);
    return res.status(200).json({ message: "Otp sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Send otp Error : ${error}` });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!otp) {
      return res.status(500).json({ message: `otp is required` });
    }
    if (user.resetOtp != otp) {
      return res.status(500).json({ message: `Invaild otp` });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Otp is expired" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Otp is verifed successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Verify otp Error : ${error}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newpassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist " });
    }
    if (!newpassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    if (newpassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be 6 character" });
    }
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification is requied" });
    }
    const hashPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashPassword;
    user.isOtpVerified = false;
    await user.save();
    return res
      .status(200)
      .json({ message: "password is successfully changed" });
  } catch (error) {
    return res.status(500).json({ message: "Password is not change" });
  }
};
