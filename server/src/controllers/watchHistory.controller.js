import WatchHistory from "../models/WatchHistory.js";
import Episode from "../models/Episode.js";

export const updateProgress = async (req, res) => {
  try {
    const user_id = req.userId;
    const { episode_id, watched_duration, total_duration } = req.body;

    if (!episode_id) {
      return res.status(400).json({ message: "episode_id is required" });
    }
    if (watched_duration === undefined) {
      return res.status(400).json({ message: "watched_duration is required" });
    }

    // Episode se show_id nikalna zaroori hai
    const episode = await Episode.findById(episode_id);
    if (!episode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const completed =
      total_duration && watched_duration >= total_duration * 0.9;

    // Ye line sabse important hai — isi se continue watching kaam karta hai
    const history = await WatchHistory.findOneAndUpdate(
      { user_id, episode_id },
      {
        show_id: episode.show_id, // show_id yahin se aata hai
        watched_duration,
        total_duration,
        completed,
        last_watched_at: new Date(),
      },
      { new: true, upsert: true } // agar record nahi hai to naya bana do
    );

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Update progress error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getProgressByEpisode = async (req, res) => {
  try {
    const user_id = req.userId;
    const { episode_id } = req.params;

    const history = await WatchHistory.findOne({ user_id, episode_id });

    return res.status(200).json({ success: true, history: history || null });
  } catch (error) {
    console.error("Get progress error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getContinueWatching = async (req, res) => {
  try {
    const user_id = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const history = await WatchHistory.aggregate([
      {
        $match: {
          user_id: user_id,
          completed: false,
          watched_duration: { $gt: 0 },
        },
      },
      { $sort: { last_watched_at: -1 } },
      {
        $group: {
          _id: "$show_id",
          latestEntry: { $first: "$$ROOT" }, // ek show ka sirf latest episode
        },
      },
      { $replaceRoot: { newRoot: "$latestEntry" } },
      { $sort: { last_watched_at: -1 } },
      { $limit: limit },
    ]);

    const populated = await WatchHistory.populate(history, [
      { path: "show_id" },
      { path: "episode_id" },
    ]);

    return res.status(200).json({ success: true, history: populated });
  } catch (error) {
    console.error("Get continue watching error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getFullHistory = async (req, res) => {
  try {
    const user_id = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await WatchHistory.find({ user_id })
      .sort({ last_watched_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("show_id")
      .populate("episode_id");

    const total = await WatchHistory.countDocuments({ user_id });

    return res.status(200).json({
      success: true,
      history,
      pagination: { total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get full history error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const user_id = req.userId;
    const { episode_id } = req.body; 

    if (episode_id) {
      
      await WatchHistory.deleteOne({ user_id, episode_id });
      return res.status(200).json({ success: true, message: "Removed from history" });
    }

    await WatchHistory.deleteMany({ user_id });
    return res.status(200).json({ success: true, message: "Watch history cleared" });
  } catch (error) {
    console.error("Clear history error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};