import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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

// Ek user same show ko do baar like na kar sake
likeSchema.index({ user_id: 1, show_id: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;