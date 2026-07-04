import { useState } from "react";
import { UploadCloud, Film, Captions } from "lucide-react";

const DUMMY_SHOWS = [
  { id: "665f1a2b3c4d5e6f7a8b9c0d", title: "Business Proposal" },
  { id: "665f1a2b3c4d5e6f7a8b9c0e", title: "Vincenzo" },
  { id: "665f1a2b3c4d5e6f7a8b9c0f", title: "Crash Landing on You" },
];

const AddEpisode = () => {
  const [form, setForm] = useState({
    show_id: "",
    episode_number: "",
    title: "",
    release_date: "",
    durationMinutes: "",
    durationSeconds: "",
  });

  const [videoSource, setVideoSource] = useState("upload"); // "upload" | "url"
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [subtitleFile, setSubtitleFile] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // duration is stored in seconds on the schema, so convert mm:ss -> total seconds
    const minutes = parseInt(form.durationMinutes || "0", 10);
    const seconds = parseInt(form.durationSeconds || "0", 10);
    const totalDurationSeconds = minutes * 60 + seconds;

    const formData = new FormData();
    formData.append("show_id", form.show_id);
    formData.append("episode_number", form.episode_number);
    formData.append("title", form.title);
    formData.append("release_date", form.release_date);
    formData.append("duration", totalDurationSeconds);

    // video_url is required by the schema — either the uploaded file or the pasted URL
    if (videoSource === "upload" && videoFile) {
      formData.append("video", videoFile);
    } else if (videoSource === "url") {
      formData.append("video_url", videoUrl);
    }

    if (subtitleFile) formData.append("subtitle", subtitleFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    // TODO: wire up to backend, e.g.
    // await axios.post(`${server_Url}/api/episodes`, formData, {
    //   withCredentials: true,
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    console.log("New episode payload:", Object.fromEntries(formData));

    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="add-episode">
      <div className="add-episode__container">
        <div className="add-episode__header">
          <h1 className="add-episode__title">Add New Episode</h1>
          <p className="add-episode__subtitle">
            Attach a new episode to an existing show.
          </p>
        </div>

        <div className="add-episode__card">
          <form onSubmit={handleSubmit}>
            {/* Show & Position */}
            <div className="form-section">
              <h3 className="form-section__title">Show Details</h3>

              <div className="field">
                <label className="field__label">
                  Show <span className="field__required">*</span>
                </label>
                <select
                  name="show_id"
                  value={form.show_id}
                  onChange={handleChange}
                  className="field__select"
                  required
                >
                  <option value="">Select a show</option>
                  {DUMMY_SHOWS.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label">
                  Episode Number <span className="field__required">*</span>
                </label>
                <input
                  type="number"
                  name="episode_number"
                  min="1"
                  value={form.episode_number}
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

            {/* Episode Info */}
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

            {/* Media */}
            <div className="form-section">
              <h3 className="form-section__title">Media</h3>

              <div className="field">
                <label className="field__label">
                  Video <span className="field__required">*</span>
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
                        <span>Upload episode video file</span>
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
                    required
                  />
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
              <button type="button" className="btn btn--ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? "Saving..." : "Add Episode"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEpisode;