import { useState } from "react";
import { UploadCloud } from "lucide-react";
import axios from "axios";
import { server_Url } from "../App";

// Mirrors the `genre` enum in the Show schema
const GENRE_OPTIONS = [
  "Romance",
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Fantasy",
  "Horror",
  "Mystery",
  "Historical",
  "Melodrama",
  "boylove",
  "girllove",
];

const COUNTRY_OPTIONS = ["korean", "chinese", "indian", "japanese"];

const STATUS_OPTIONS = ["ongoing", "completed", "upcomming"];

const AddSeries = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    release_year: "",
    country: "",
    status: "ongoing",
    trailer_url: "",
  });

  const [genre, setGenre] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleGenre = (option) => {
    setGenre((prev) =>
      prev.includes(option) ? prev.filter((g) => g !== option) : [...prev, option]
    );
  };

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("release_year", form.release_year);
    formData.append("country", form.country);
    formData.append("status", form.status);
    formData.append("trailer_url", form.trailer_url);
    genre.forEach((g) => formData.append("genre", g));
    if (posterFile) formData.append("poster", posterFile);
    if (bannerFile) formData.append("banner", bannerFile);

    try {
      const { data } = await axios.post(`${server_Url}/api/shows/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("New show payload:", Object.fromEntries(formData));
      console.log(data);
    } catch (error) {
      console.log(error.response);
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <div className="add-series">
      <div className="add-series__container">
        <div className="add-series__header">
          <h1 className="add-series__title">Add New Series / Show</h1>
          <p className="add-series__subtitle">
            Fill in the details below to add a new title to the catalog.
          </p>
        </div>

        <div className="add-series__card">
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="form-section">
              <h3 className="form-section__title">Basic Information</h3>

              <div className="field">
                <label className="field__label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Business Proposal"
                  className="field__input"
                  required
                />
              </div>

              <div className="field">
                <label className="field__label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short synopsis of the show..."
                  className="field__textarea"
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label className="field__label">Release Year</label>
                  <input
                    type="number"
                    name="release_year"
                    value={form.release_year}
                    onChange={handleChange}
                    placeholder="2026"
                    className="field__input"
                  />
                </div>

                <div className="field">
                  <label className="field__label">Country</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="field__select"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="field__label">Trailer URL</label>
                <input
                  type="url"
                  name="trailer_url"
                  value={form.trailer_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="field__input"
                />
              </div>
            </div>

            {/* Classification */}
            <div className="form-section">
              <h3 className="form-section__title">Classification</h3>

              <div className="field">
                <label className="field__label">Genre</label>
                <div className="genre-grid">
                  {GENRE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`genre-pill ${genre.includes(option) ? "genre-pill--active" : ""
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={genre.includes(option)}
                        onChange={() => toggleGenre(option)}
                        className="genre-pill__input"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field__label">Status</label>
                <div className="status-group">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status}>
                      <input
                        type="radio"
                        id={`status-${status}`}
                        name="status"
                        value={status}
                        checked={form.status === status}
                        onChange={handleChange}
                        className="status-group__option"
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="status-group__label"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="form-section">
              <h3 className="form-section__title">Media</h3>

              <div className="field">
                <label className="field__label">
                  Poster Image <span className="field__required">*</span>
                </label>
                <label className="upload-box upload-box--poster">
                  <input
                    type="file"
                    accept="image/*"
                    className="upload-box__input"
                    onChange={(e) =>
                      handleImageChange(e, setPosterFile, setPosterPreview)
                    }
                  />
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="upload-box__preview"
                    />
                  ) : (
                    <div className="upload-box__placeholder">
                      <UploadCloud size={22} />
                      <span>Upload poster (2:3)</span>
                    </div>
                  )}
                </label>
                <span className="field__hint">Required — maps to poster_url</span>
              </div>

              <div className="field">
                <label className="field__label">Banner Image</label>
                <label className="upload-box upload-box--banner">
                  <input
                    type="file"
                    accept="image/*"
                    className="upload-box__input"
                    onChange={(e) =>
                      handleImageChange(e, setBannerFile, setBannerPreview)
                    }
                  />
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="upload-box__preview"
                    />
                  ) : (
                    <div className="upload-box__placeholder">
                      <UploadCloud size={22} />
                      <span>Upload banner (16:6)</span>
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
                {loading ? "Saving..." : "Add Series"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSeries;