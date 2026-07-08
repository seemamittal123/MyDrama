import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import axios from "axios";
import { server_Url } from "../App";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { setNewShows } from "../redux/showSlice";

const GENRE_OPTIONS = [
  "Romance",
  "Action",
  "Anime",
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

const COUNTRY_OPTIONS = ["korean", "chinese", "US", "indian", "japanese", "thailand"];

const STATUS_OPTIONS = ["ongoing", "completed", "upcomming"];

const EMPTY_FORM = {
  title: "",
  description: "",
  release_year: "",
  country: "",
  status: "ongoing",
  trailer_url: "",
  session: "",
  cast: "",
};

const AddSeries = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { allShows } = useSelector((state) => state.show);

  const [form, setForm] = useState(EMPTY_FORM);
  const [genre, setGenre] = useState([]);

  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [posterPreview, setPosterPreview] = useState(null);
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
    formData.append("session", form.session);
    formData.append("trailer_url", form.trailer_url);
    formData.append("cast", form.cast);
    genre.forEach((g) => formData.append("genre", g));

    if (posterFile instanceof File) formData.append("poster", posterFile);
    if (bannerFile instanceof File) formData.append("banner", bannerFile);

    try {
      const { data } = isEditMode
        ? await axios.post(`${server_Url}/api/shows/edit/${id}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        : await axios.post(`${server_Url}/api/shows/create`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

      toast.success(isEditMode ? "Show updated" : "Show added");
      dispatch(setNewShows(formData))
      if (isEditMode) {
        navigate("/admin");
      } else {
        setForm(EMPTY_FORM);
        setGenre([]);
        setPosterFile(null);
        setBannerFile(null);
        setPosterPreview(null);
        setBannerPreview(null);
      }
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode) return;
    const show = allShows.find((s) => s._id.toString() === id);
    if (!show) return;

    setForm({
      title: show.title || "",
      description: show.description || "",
      release_year: show.release_year || "",
      country: show.country || "",
      status: show.status || "ongoing",
      trailer_url: show.trailer_url || "",
      session: show.session || "",
      cast: show.cast || ""
    });
    setGenre(show.genre || []);
    setPosterPreview(show.poster_url || null);
    setBannerPreview(show.banner_url || null);
    setPosterFile(null);
    setBannerFile(null);
  }, [id, isEditMode, allShows]);

  return (
    <div className="add-series">
      <div className="add-series__container">
        <div className="add-series__header">
          <h1 className="add-series__title">
            {isEditMode ? "Edit Series / Show" : "Add New Series / Show"}
          </h1>
          <p className="add-series__subtitle">
            {isEditMode
              ? "Update the details below and save your changes."
              : "Fill in the details below to add a new title to the catalog."}
          </p>
        </div>

        <div className="add-series__card">
          <form onSubmit={handleSubmit}>
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
                <label className="field__label">Session</label>
                <input
                  type="number"
                  name="session"
                  value={form.session}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="e.g 1"
                  className="field__input"
                  required
                />
              </div>
              <div className="field">
                <label className="field__label">Cast</label>
                <input
                  type="text"
                  name="cast"
                  value={form.cast}
                  onChange={handleChange}
                  placeholder="Enter cast (comma separated)"
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
                    onWheel={(e) => e.preventDefault()}
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
                  Poster Image {!isEditMode && <span className="field__required">*</span>}
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
                <span className="field__hint">
                  {isEditMode ? "Leave empty to keep the current poster" : "Required — maps to poster_url"}
                </span>
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
                {isEditMode && (
                  <span className="field__hint">Leave empty to keep the current banner</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => navigate("/admin")}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Save Changes" : "Add Series"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSeries;