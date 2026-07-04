import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import auth from "./src/routes/auth.route.js";
import user from "./src/routes/user.route.js";
import show from "./src/routes/show.route.js";
import episode from "./src/routes/episode.route.js";

dotenv.config();
const PORT = 5000 || process.env.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/auth", auth);
app.use("/api/users",user);
app.use("/api/shows",show);
app.use("/api/episodes",episode);

app.get("/", (req, res) => {
  return res.json({ message: "Server is running" });
});

connectDB()
  .then((res) => {
    app.listen(PORT, () => {
      console.log("Server is listen");
    });
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });
