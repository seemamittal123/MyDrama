import { useEffect, useState } from "react";
import { UploadCloud, Film, Captions, Loader } from "lucide-react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server_Url } from "../App";
import toast from "react-hot-toast";
import loader from '../assets/loader.svg';

// Cloudinary se signature lo (backend se, secure)
const getSignature = async (folder) => {
  const { data } = await axios.post(
    `${server_Url}/api/cloudinary/signature`,
    { folder },
    { withCredentials: true }
  );
   console.log("Signature response:", data);
  return data;
};

// File ko seedha Cloudinary ko upload karo (server ko bypass karke)
const uploadToCloudinaryDirect = async (file, folder, resourceType, onProgress) => {
  const { signature, timestamp, cloudName, apiKey } = await getSignature(folder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    formData,
    {
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    }
  );

  return data.secure_url;
};

const AddEpisode = () => {
  const { epId } = useParams();
  const isEditMode = Boolean(epId);

  const [searchParams] = useSearchParams();
  const showId = searchParams.get("show_id");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    show_id: showId || "",
    episode_number: "",
    title: "",
    release_date: "",
    durationMinutes: "",
    durationSeconds: "",
  });

  const [videoSource, setVideoSource] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [subtitleFile, setSubtitleFile] = useState(null);
  const [existingSubtitleUrl, setExistingSubtitleUrl] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [uploadProgress, setUploadProgress] = useState(0); // video ka progress dikhane ke liye

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleSubtitleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSubtitleFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isEditMode) return;

    const fetchEpisodeData = async () => {
      try {
        setFetching(true);
        const { data } = await axios.get(
          `${server_Url}/api/episodes/episode/${epId}`,
          { withCredentials: true }
        );

        const ep = data.episode;
        const minutes = Math.floor((ep.duration || 0) / 60);
        const seconds = (ep.duration || 0) % 60;

        setForm({
          show_id: ep.show_id,
          episode_number: ep.episode_number || "",
          title: ep.title || "",
          release_date: ep.release_date ? ep.release_date.slice(0, 10) : "",
          durationMinutes: minutes || "",
          durationSeconds: seconds || "",
        });

        setVideoUrl(ep.video_url || "");
        setVideoSource("url");
        setThumbnailPreview(ep.thumbnail_url || null);
        setExistingSubtitleUrl(ep.subtitle_url || "");
      } catch (error) {
        console.log("Fetch episode error:", error.response);
        toast.error("Failed to load episode data");
      } finally {
        setFetching(false);
      }
    };

    fetchEpisodeData();
  }, [epId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && showId) {
      setForm((prev) => ({ ...prev, show_id: showId }));
    }
  }, [showId, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const minutes = parseInt(form.durationMinutes || "0", 10);
      const seconds = parseInt(form.durationSeconds || "0", 10);
      const totalDurationSeconds = minutes * 60 + seconds;

      // Step 1: Video URL decide karo (upload ya direct URL)
      let finalVideoUrl = videoUrl;
      if (videoSource === "upload" && videoFile) {
        toast.loading("Uploading video...", { id: "upload-toast" });
        finalVideoUrl = await uploadToCloudinaryDirect(
          videoFile,
          "episodes/videos",
          "video",
          setUploadProgress
        );
      }

      if (!finalVideoUrl && !isEditMode) {
        toast.error("Video is required");
        setLoading(false);
        return;
      }

      // Step 2: Thumbnail aur subtitle PARALLEL me upload karo (agar diye gaye hain)
      const [finalThumbnailUrl, finalSubtitleUrl] = await Promise.all([
        thumbnailFile
          ? uploadToCloudinaryDirect(thumbnailFile, "episodes/thumbnails", "image")
          : Promise.resolve(undefined),
        subtitleFile
          ? uploadToCloudinaryDirect(subtitleFile, "episodes/subtitles", "raw")
          : Promise.resolve(undefined),
      ]);

      toast.dismiss("upload-toast");

      // Step 3: Ab sirf URLs backend ko bhejo - ye instant hoga
      const payload = {
        show_id: form.show_id,
        episode_number: form.episode_number,
        title: form.title,
        release_date: form.release_date,
        duration: totalDurationSeconds,
        video_url: finalVideoUrl,
        ...(finalThumbnailUrl && { thumbnail_url: finalThumbnailUrl }),
        ...(finalSubtitleUrl && { subtitle_url: finalSubtitleUrl }),
      };

      const endpoint = isEditMode
        ? `${server_Url}/api/episodes/edit/${epId}`
        : `${server_Url}/api/episodes/create`;

      const { data } = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        if (!isEditMode) {
          navigate(`/admin/shows/${form.show_id}`);
        }
      }
    } catch (error) {
      console.log(error.response || error);
      toast.dismiss("upload-toast");
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (fetching) {
    return (
      <div className="add-episode spinner">
        <p>
          <img src={loader} alt="" />
        </p>
      </div>
    );
  }

  return (
    <div className="add-episode">
      <div className="add-episode__container">
        <div className="add-episode__header">
          <h1 className="add-episode__title">
            {isEditMode ? "Edit Episode" : "Add New Episode"}
          </h1>
          <p className="add-episode__subtitle">
            {isEditMode
              ? "Update this episode's details."
              : "Attach a new episode to an existing show."}
          </p>
        </div>

        <div className="add-episode__card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section__title">Show Details</h3>
              <div className="field">
                <label className="field__label">
                  Episode Number <span className="field__required">*</span>
                </label>
                <input
                  type="number"
                  name="episode_number"
                  min="1"
                  value={form.episode_number}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="1"
                  className="field__input"
                  required
                />
                <span className="field__hint">
                  Must be unique per show — duplicate numbers will be rejected.
                </span>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Episode Information</h3>

              <div className="field">
                <label className="field__label">Episode Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Episode 1: The Beginning"
                  className="field__input"
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label className="field__label">Duration</label>
                  <div className="duration-inputs">
                    <input
                      type="number"
                      name="durationMinutes"
                      min="0"
                      value={form.durationMinutes}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleChange}
                      placeholder="45"
                      className="field__input"
                    />
                    <span className="duration-inputs__label">min</span>
                    <input
                      type="number"
                      name="durationSeconds"
                      min="0"
                      max="59"
                      value={form.durationSeconds}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleChange}
                      placeholder="00"
                      className="field__input"
                    />
                    <span className="duration-inputs__label">sec</span>
                  </div>
                  <span className="field__hint">Stored as total seconds</span>
                </div>

                <div className="field">
                  <label className="field__label">Release Date</label>
                  <input
                    type="date"
                    name="release_date"
                    value={form.release_date}
                    onChange={handleChange}
                    className="field__input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Media</h3>

              <div className="field">
                <label className="field__label">
                  Video {!isEditMode && <span className="field__required">*</span>}
                </label>
                <div className="source-toggle">
                  <button
                    type="button"
                    className={`source-toggle__option ${
                      videoSource === "upload" ? "source-toggle__option--active" : ""
                    }`}
                    onClick={() => setVideoSource("upload")}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`source-toggle__option ${
                      videoSource === "url" ? "source-toggle__option--active" : ""
                    }`}
                    onClick={() => setVideoSource("url")}
                  >
                    Video URL
                  </button>
                </div>

                {videoSource === "upload" ? (
                  <label className="upload-box">
                    <input
                      type="file"
                      accept="video/*"
                      className="upload-box__input"
                      onChange={handleVideoFileChange}
                    />
                    {videoFile ? (
                      <div className="upload-box__filename">
                        <Film size={18} style={{ marginBottom: "0.4rem" }} />
                        <div>{videoFile.name}</div>
                      </div>
                    ) : (
                      <div className="upload-box__placeholder">
                        <UploadCloud size={22} />
                        <span>
                          {isEditMode
                            ? "Upload a new video to replace the current one"
                            : "Upload episode video file"}
                        </span>
                      </div>
                    )}
                  </label>
                ) : (
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://cdn.example.com/episode.mp4"
                    className="field__input"
                    required={!isEditMode}
                  />
                )}

                {/* Video upload progress bar */}
                {loading && videoSource === "upload" && videoFile && (
                  <div className="upload-progress">
                    <div
                      className="upload-progress__bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <span className="upload-progress__label">
                      {uploadProgress}% uploaded
                    </span>
                  </div>
                )}
              </div>

              <div className="field">
                <label className="field__label">Subtitle File (optional)</label>
                <label className="upload-box upload-box--subtitle">
                  <input
                    type="file"
                    accept=".srt,.vtt"
                    className="upload-box__input"
                    onChange={handleSubtitleFileChange}
                  />
                  {subtitleFile ? (
                    <div className="upload-box__filename">
                      <Captions size={18} style={{ marginBottom: "0.4rem" }} />
                      <div>{subtitleFile.name}</div>
                    </div>
                  ) : existingSubtitleUrl ? (
                    <div className="upload-box__filename">
                      <Captions size={18} style={{ marginBottom: "0.4rem" }} />
                      <div>Current subtitle attached</div>
                    </div>
                  ) : (
                    <div className="upload-box__placeholder">
                      <UploadCloud size={20} />
                      <span>Upload .srt or .vtt file</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="field">
                <label className="field__label">Thumbnail</label>
                <label className="upload-box upload-box--thumbnail">
                  <input
                    type="file"
                    accept="image/*"
                    className="upload-box__input"
                    onChange={handleThumbnailChange}
                  />
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="upload-box__preview"
                    />
                  ) : (
                    <div className="upload-box__placeholder">
                      <UploadCloud size={22} />
                      <span>Upload thumbnail (16:9)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading
                  ? uploadProgress > 0
                    ? `Uploading ${uploadProgress}%...`
                    : "Saving..."
                  : isEditMode
                  ? "Update Episode"
                  : "Add Episode"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEpisode;