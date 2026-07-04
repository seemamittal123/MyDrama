import Show from "../models/show.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import Episode from "../models/Episode.js";
import Like from "../models/likes.js";

export const createShow = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      country,
      status,
      total_episodes,
      release_year,
      trailer_url,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.files || !req.files.poster) {
      return res.status(400).json({ message: "Poster image is required" });
    }

    const posterFile = req.files.poster[0];
    const posterUrl = await uploadOnCloudinary(
      posterFile.buffer,
      posterFile.mimetype,
      "shows/posters",
    );

    let bannerUrl = "";
    if (req.files.banner) {
      const bannerFile = req.files.banner[0];
      bannerUrl = await uploadOnCloudinary(
        bannerFile.buffer,
        bannerFile.mimetype,
        "shows/banners",
      );
    }

    const show = await Show.create({
      title,
      description,
      genre,
      country,
      status,
      total_episodes,
      release_year,
      poster_url: posterUrl,
      banner_url: bannerUrl,
      trailer_url,
    });

    return res.status(201).json(show);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Add show error: ${error.message}` });
  }
};

export const editShow = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      title,
      description,
      genre,
      country,
      status,
      total_episodes,
      release_year,
      trailer_url,
    } = req.body;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const existingShow = await Show.findOne({ slug });
    if (!existingShow) {
      return res.status(404).json({ message: "Show not found" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (genre) updateData.genre = genre;
    if (country) updateData.country = country;
    if (status) updateData.status = status;
    if (total_episodes) updateData.total_episodes = total_episodes;
    if (release_year) updateData.release_year = release_year;
    if (trailer_url) updateData.trailer_url = trailer_url;

    if (req.files && req.files.poster) {
      const posterFile = req.files.poster[0];
      updateData.poster_url = await uploadOnCloudinary(
        posterFile.buffer,
        posterFile.mimetype,
        "shows/posters",
      );
    }

    if (req.files && req.files.banner) {
      const bannerFile = req.files.banner[0];
      updateData.banner_url = await uploadOnCloudinary(
        bannerFile.buffer,
        bannerFile.mimetype,
        "shows/banners",
      );
    }

    const show = await Show.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ message: "Show updated successfully", show });
  } catch (error) {
    console.error("Edit show error:", error.message);
    return res
      .status(500)
      .json({ message: `Edit show error: ${error.message}` });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "show id is required" });
    }

    const show = await Show.findById(id);

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    await Episode.deleteMany({ show_id: show._id });

    await Show.findByIdAndDelete(show._id);

    return res
      .status(200)
      .json({ message: "Show and its episodes deleted successfully" });
  } catch (error) {
    console.error("Delete show error:", error.message);
    return res
      .status(500)
      .json({ message: `Delete show error: ${error.message}` });
  }
};

export const getAllShow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const shows = await Show.find()
      .populate("genre")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Show.countDocuments();

    return res.status(200).json({
      success: true,
      shows,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all show error:", error.message);
    return res
      .status(500)
      .json({ message: `Get all show error: ${error.message}` });
  }
};

export const searchShow = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const shows = await Show.find({ $text: { $search: search } });

    return res.status(200).json({
      success: true,
      shows,
    });
  } catch (error) {
    return res.status(500).json({ message: `Search error: ${error.message}` });
  }
};

export const filterShows = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const shows = await Show.find({
      $or: [
        { genre: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      shows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLatestShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const shows = await Show.find().sort({ createdAt: -1 }).limit(limit);

    return res.status(200).json({ success: true, shows });
  } catch (error) {
    console.error("Get latest shows error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getPopularShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularShows = await Like.aggregate([
      {
        $group: {
          _id: "$show_id",
          likeCount: { $sum: 1 },
        },
      },
      { $sort: { likeCount: -1 } },
      { $limit: limit },
    ]);

    const showIds = popularShows.map((item) => item._id);
    const shows = await Show.find({ _id: { $in: showIds } });

    const result = showIds
      .map((id) => {
        const show = shows.find((s) => s._id.toString() === id.toString());
        const matched = popularShows.find(
          (item) => item._id.toString() === id.toString(),
        );
        return show
          ? { ...show.toObject(), likeCount: matched.likeCount }
          : null;
      })
      .filter(Boolean); // agar show delete ho chuka ho to null hata do

    return res.status(200).json({ success: true, shows: result });
  } catch (error) {
    console.error("Get popular shows error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getTrendingShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const shows = await Show.find().sort({ views: -1 }).limit(limit);

    return res.status(200).json({ success: true, shows });
  } catch (error) {
    console.error("Get trending shows error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { show_id } = req.body;
    const user_id = req.userId;

    if (!show_id) {
      return res.status(400).json({ message: "show_id is required" });
    }

    const show = await Show.findById(show_id);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    const existingLike = await Like.findOne({ user_id, show_id });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Show.findByIdAndUpdate(show_id, { $inc: { likesCount: -1 } });

      return res
        .status(200)
        .json({ success: true, liked: false, message: "Unliked" });
    } else {
      await Like.create({ user_id, show_id });
      await Show.findByIdAndUpdate(show_id, { $inc: { likesCount: 1 } });

      return res
        .status(200)
        .json({ success: true, liked: true, message: "Liked" });
    }
  } catch (error) {
    console.error("Toggle like error:", error.message);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const checkLikeStatus = async (req, res) => {
  try {
    const { show_id } = req.params;
    const user_id = req.user._id;

    const liked = await Like.findOne({ user_id, show_id });

    return res.status(200).json({ success: true, liked: !!liked });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getUpcommingShow = async (req, res) => {
  try {
    const shows = await Show.find();
    const upcommingShow = shows.filter((show) => show.status == "upcomming");
    return res.status(200).json({ success: true, shows: upcommingShow });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};
