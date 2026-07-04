import express  from "express";
import isAuth from "../middlewares/isAuth.js";
import { currentUser } from "../controllers/user.controller.js";
import {
  createOrDeleteWatchList,
  getWatchList,
} from "../controllers/watchlist.controller.js";
import {
  updateProgress,
  getContinueWatching,
  getFullHistory,
  clearHistory,
} from "../controllers/watchHistory.controller.js";
const user = express.Router();

user.get("/user", isAuth, currentUser);
user.post("/create/watchlist", isAuth, createOrDeleteWatchList);
user.get("/watchlist", isAuth, getWatchList);
user.post("/progress", isAuth, updateProgress);
user.get("/continue-watching", isAuth, getContinueWatching);
user.get("/history", isAuth, getFullHistory);
user.delete("/history", isAuth, clearHistory);

export default user;
