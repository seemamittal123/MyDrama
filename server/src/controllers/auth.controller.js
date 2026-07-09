import bcrypt from "bcryptjs/dist/bcrypt.js";
import User from "../models/user.js";
import getToken from "../utils/token.js";

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
