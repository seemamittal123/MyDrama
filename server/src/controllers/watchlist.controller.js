import Watchlist from "../models/watchlist.js";

export const createOrDeleteWatchList = async (req, res) => {
  try {
    const { show_id } = req.body;
    const userId = req.userId;
    if (!show_id) {
      return res.status(400).json({ message: "SHow id is required" });
    }
    const aleradyInWatchlist = await Watchlist.findOne({ show_id });
    if (aleradyInWatchlist) {
      await Watchlist.findByIdAndDelete(aleradyInWatchlist._id);
      return res
        .status(201)
        .json({ success: true, message: "Remove from watchlist" });
    }
    const watchShow = await Watchlist.create({
      user_id: userId,
      show_id,
    });
    return res
      .status(201)
      .json({ success: true, message: "Added in watchlist" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create Watch list error ${error}` });
  }
};

export const getWatchList = async (req, res) => {
  try {
    const userId = req.userId;
    const watchlist = await Watchlist.find({ user_id: userId }).populate("show_id");
    return res.status(201).json({ success: true, watchlist});
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create Watch list error ${error}` });
  }
};
