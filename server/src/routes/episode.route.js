import  express  from "express";
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
    { name: "thumbnailUrl", maxCount: 1 },
    { name: "subtitleFile", maxCount: 1 },
  ]),
  createEpisode,
);
episode.post("/edit/:id", isAuth, editEpisode);
episode.delete("/delete/:id", isAuth, deleteEpisode);
episode.get("/show/:show_id/all/episodes", getEpisodesByShow);
episode.get("/episode/:id", getEpisode);

export default episode;
