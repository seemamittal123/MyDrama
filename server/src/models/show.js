import mongoose from "mongoose";
import slugify from "slugify";

const showSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    poster_url: {
      type: String,
      required: true,
    },
    banner_url: {
      type: String,
    },
    trailer_url:{
      type: String,
    },
    genre: [
      {
        type: String,
        enum: [
          "Romance",
          "Action",
          "Comedy",
          "Drama",
          "Thriller",
          "Fantasy",
          "Horror",
          "Mystery",
          "Historical",
          "Melodrama",
          "boylove",
          "girllove"
        ],
      },
    ],
    release_year: {
      type: Number,
    },
    country: {
      type: String,
      enum: ["korean", "chinese", "indian", "japanese"],
    },
    status: {
      type: String,
      enum: ["ongoing", "completed","upcomming"],
      default: "ongoing",
    },
    total_episodes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

showSchema.index({ title: "text", description: "text" });

showSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Show = mongoose.model("Show", showSchema);
export default Show;
