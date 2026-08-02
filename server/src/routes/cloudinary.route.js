import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getUploadSignature } from "../controllers/cloudinary.controller.js";

const cloudinaryRoute = express.Router();

// Sirf logged-in admin hi signature le sakta hai (security)
cloudinaryRoute.post("/signature", isAuth, getUploadSignature);

export default cloudinaryRoute;