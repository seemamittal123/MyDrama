import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema(
  {
    show_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    episode_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    video_url: {
      type: String,
      required: true,
    },
    subtitle_url: {
      type: String,
    },
    thumbnail_url: {
      type: String,
    },
    duration: {
      type: Number, // seconds mein rakhna best practice hai
    },
    release_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Ek show mein same episode number do baar na ho, isliye compound unique index
episodeSchema.index({ show_id: 1, episode_number: 1 }, { unique: true });

const Episode = mongoose.models.Episode || mongoose.model("Episode", episodeSchema);
export default Episode;