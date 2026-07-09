import WatchHistory from "../models/watchHistory.js";
import Episode from "../models/episode.js";

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
      { new: true, upsert: true }, // agar record nahi hai to naya bana do
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

    // Sab history nikalo, latest pehle
    const allHistory = await WatchHistory.find({
      user_id,
      watched_duration: { $gt: 0 },
    })
      .populate("show_id")
      .populate("episode_id")
      .sort({ last_watched_at: -1 });

    // Show ke hisaab se group karo — priority: incomplete record > completed record
    const showMap = new Map();

    for (const record of allHistory) {
      const showId = record.show_id._id.toString();
      const existing = showMap.get(showId);

      if (!existing) {
        // Is show ka pehla record mila — rakh lo (chahe completed ho ya na ho)
        showMap.set(showId, record);
      } else if (existing.completed && !record.completed) {
        // Agar pehle wala completed tha, aur ye naya incomplete hai,
        // to incomplete wale ko priority do (ye hi "resume" karne wala episode hai)
        showMap.set(showId, record);
      }
      // Agar existing already incomplete hai, to usi ko rakho — kuch mat karo
    }

    // Ab har show ke liye total/completed episodes count karo
    const continueWatching = [];
    for (const [showId, record] of showMap) {
      const totalEpisodes = await Episode.countDocuments({
        show_id: record.show_id._id,
      });

      const completedEpisodes = await WatchHistory.countDocuments({
        user_id,
        show_id: record.show_id._id,
        completed: true,
      });

      // Sirf tab hatao jab SAB episodes complete ho chuke hon
      if (completedEpisodes < totalEpisodes) {
        continueWatching.push({
          ...record.toObject(),
          totalEpisodesCount: totalEpisodes,
          completedEpisodesCount: completedEpisodes,
        });
      }
    }

    // Sabse recent activity wala show upar rahe
    continueWatching.sort(
      (a, b) => new Date(b.last_watched_at) - new Date(a.last_watched_at)
    );

    return res
      .status(200)
      .json({ success: true, history: continueWatching.slice(0, limit) });
  } catch (error) {
    console.error("Get continue watching error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getResumeEpisode = async (req, res) => {
  try {
    const user_id = req.userId;
    const { show_id } = req.params;

    // Show ke sab episodes, order mein
    const episodes = await Episode.find({ show_id }).sort({ episode_number: 1 });

    if (!episodes.length) {
      return res.status(404).json({ message: "No episodes found for this show" });
    }

    // User ki is show ki poori watch history
    const historyRecords = await WatchHistory.find({ user_id, show_id });

    // episode_id => history record ka quick lookup banao
    const historyMap = new Map();
    historyRecords.forEach((h) => historyMap.set(h.episode_id.toString(), h));

    // Episode order mein dekho — jo pehla incomplete/undekha mile, wahi resume point hai
    for (const ep of episodes) {
      const record = historyMap.get(ep._id.toString());

      if (!record) {
        // Ye episode kabhi dekha hi nahi — yahi se start karo (0 second se)
        return res.status(200).json({
          success: true,
          episode_id: ep._id,
          watched_duration: 0,
        });
      }

      if (!record.completed) {
        // Ye episode adhura dekha hai — yahin se resume karo
        return res.status(200).json({
          success: true,
          episode_id: ep._id,
          watched_duration: record.watched_duration,
        });
      }
      // Agar completed hai, to agle episode pe loop continue hoga
    }

    // Agar yahan tak pahunch gaye, matlab SAB episodes complete ho chuke hain
    // Last episode ko dobara shuru se dikhao
    const lastEpisode = episodes[episodes.length - 1];
    return res.status(200).json({
      success: true,
      episode_id: lastEpisode._id,
      watched_duration: 0,
      allCompleted: true,
    });
  } catch (error) {
    console.error("Get resume episode error:", error.message);
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
      return res
        .status(200)
        .json({ success: true, message: "Removed from history" });
    }

    await WatchHistory.deleteMany({ user_id });
    return res
      .status(200)
      .json({ success: true, message: "Watch history cleared" });
  } catch (error) {
    console.error("Clear history error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};
