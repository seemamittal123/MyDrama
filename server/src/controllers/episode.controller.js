import Episode from "../models/episode.js";
import Show from "../models/show.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";

export const createEpisode = async (req, res) => {
  try {
    const {
      show_id,
      episode_number,
      title,
      video_url,
      duration,
      release_date,
    } = req.body;

    if (!show_id) {
      return res.status(400).json({ message: "show_id is required" });
    }
    if (!episode_number) {
      return res.status(400).json({ message: "episode_number is required" });
    }

    let videoUrlValue = video_url;

    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      videoUrlValue = await uploadOnCloudinary(
        videoFile.buffer,
        videoFile.mimetype,
        "episodes/videos",
        "video",
      );
    }

    if (!videoUrlValue) {
      return res.status(400).json({ message: "video_url is required" });
    }

    const show = await Show.findById(show_id);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    let thumbnailUrl = "";
    if (req.files && req.files.thumbnail) {
      const thumbFile = req.files.thumbnail[0];
      thumbnailUrl = await uploadOnCloudinary(
        thumbFile.buffer,
        thumbFile.mimetype,
        "episodes/thumbnails",
      );
    }

    let subtitleUrl = "";
    if (req.files && req.files.subtitle) {
      const subFile = req.files.subtitle[0];
      subtitleUrl = await uploadOnCloudinary(
        subFile.buffer,
        subFile.mimetype,
        "episodes/subtitles",
      );
    }

    const episode = await Episode.create({
      show_id,
      episode_number,
      title,
      video_url: videoUrlValue,
      thumbnail_url: thumbnailUrl,
      subtitle_url: subtitleUrl,
      duration,
      release_date,
    });

    await Show.findByIdAndUpdate(show_id, {
      $inc: {
        total_episodes: 1,
      },
    });

    return res
      .status(201)
      .json({ success: true, episode, message: "episode created" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This episode number already exists for this show",
      });
    }

    return res
      .status(500)
      .json({ message: `Create episode error: ${error.message}` });
  }
};

export const editEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const { episode_number, title, video_url, duration, release_date } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Episode id is required" });
    }

    const existingEpisode = await Episode.findById(id);
    if (!existingEpisode) {
      return res.status(404).json({ message: "Episode not found" });
    }

    const updateData = {};
    if (episode_number) updateData.episode_number = episode_number;
    if (title) updateData.title = title;
    if (video_url) updateData.video_url = video_url;
    if (duration) updateData.duration = duration;
    if (release_date) updateData.release_date = release_date;

    const episode = await Episode.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json({ success: true, message: "Episode updated", episode });
  } catch (error) {
    console.error("Edit episode error:", error.message);
    return res
      .status(500)
      .json({ message: `Edit episode error: ${error.message}` });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "episode id is required" });
    }
    const episode = await Episode.findById(id);
    if (!episode) {
      return res.status(404).json({ message: "episode not found" });
    }
    await Episode.findByIdAndDelete(id);
    return res.status(201).json({ success: true, message: "Episode deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create episode error: ${error.message}` });
  }
};

export const getEpisodesByShow = async (req, res) => {
  try {
    const { show_id } = req.params;
    if (!show_id) {
      return res.status(400).json({ message: "show_id is required" });
    }
    const episodes = await Episode.find({ show_id });

    return res.status(201).json({ success: true, episodes });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get episodes error: ${error.message}` });
  }
};

export const getEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId =req.userId;
    const episode = await Episode.findById(id);

    const show = await Show.findById(episode.show_id);
    
    if (!show.viewedBy.includes(userId)) {
      show.views += 1;
      show.viewedBy.push(userId);
      await show.save();
    }

    return res.status(201).json({ success: true, episode });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get episode error: ${error.message}` });
  }
};
