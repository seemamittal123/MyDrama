import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/User.js";



const makeAdmin = async (email) => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );
  console.log(user ? `${user.email} is now admin` : "User not found");
  process.exit();
};

makeAdmin(process.env.ADMIN_EMAIL);