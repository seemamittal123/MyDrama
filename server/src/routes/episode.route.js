import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  createEpisode,
  deleteEpisode,
  editEpisode,
  getEpisode,
  getEpisodesByShow,
} from "../controllers/episode.controller.js";

const episode = express.Router();

episode.post(
  "/create",
  isAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "subtitle", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createEpisode,
);
episode.post(
  "/edit/:id",
  isAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "subtitle", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  editEpisode,
);
episode.delete("/delete/:id", isAuth, deleteEpisode);
episode.get("/show/:show_id/all/episodes", getEpisodesByShow);
episode.get("/episode/:id", getEpisode);

export default episode;
