import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
  },
  { timestamps: true }
);

// Ek user same show ko watchlist mein do baar add na kar sake
watchlistSchema.index({ user_id: 1, show_id: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
export default Watchlist;