import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    episode_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true,
    },
    show_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true, // direct reference, taaki "continue watching" query fast ho
    },
    watched_duration: {
      type: Number, // seconds mein — kahan tak dekha
      default: 0,
    },
    total_duration: {
      type: Number, // episode ki poori length seconds mein
    },
    completed: {
      type: Boolean,
      default: false,
    },
    last_watched_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ek user ek episode ka sirf ek hi history record rakhega (update hota rahega)
watchHistorySchema.index({ user_id: 1, episode_id: 1 }, { unique: true });

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);
export default WatchHistory;