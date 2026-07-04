import  express  from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { createShow, deleteShow, editShow, filterShows, getAllShow, getLatestShows, getPopularShows, getTrendingShows, getUpcommingShow, searchShow, toggleLike } from "../controllers/show.controller.js";

const show = express.Router();

show.post(
  "/create",
  isAuth,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createShow,
);
show.post(
  "/edit",
  isAuth,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  editShow,
);
show.delete('/delete',isAuth,deleteShow);
show.get("/all/shows",getAllShow);
show.get("/search/shows",searchShow);
show.get("/filter/shows",filterShows);
show.get("/latest", getLatestShows);
show.get("/trending", getTrendingShows);
show.get("/popular", getPopularShows);
show.get("/upcomming", getUpcommingShow);
show.post('/like-dislike',isAuth,toggleLike)


export default show;
