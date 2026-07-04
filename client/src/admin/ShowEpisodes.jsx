import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Play, Pencil, Trash2, Clock, Calendar } from "lucide-react";

// Replace with real data fetched from your API (GET /api/shows/:id)
const DUMMY_SHOWS = {
  "665f1a2b3c4d5e6f7a8b9c0d": {
    _id: "665f1a2b3c4d5e6f7a8b9c0d",
    title: "Business Proposal",
    poster_url: "https://image.tmdb.org/t/p/w300/9dCleZTAAxxNoCbmxa1zY5RAeYb.jpg",
    status: "completed",
    genre: ["Romance", "Comedy"],
    country: "korean",
    release_year: 2022,
  },
  "665f1a2b3c4d5e6f7a8b9c0e": {
    _id: "665f1a2b3c4d5e6f7a8b9c0e",
    title: "Vincenzo",
    poster_url: "https://image.tmdb.org/t/p/w300/2S1cH8mUuXeeCJTFvR8VwOMTdcU.jpg",
    status: "completed",
    genre: ["Action", "Drama"],
    country: "korean",
    release_year: 2021,
  },
};

// Replace with real data fetched from your API (GET /api/episodes?show_id=...)
const DUMMY_EPISODES = {
  "665f1a2b3c4d5e6f7a8b9c0d": [
    {
      _id: "e1",
      episode_number: 1,
      title: "Shin Ha-ri Quits",
      thumbnail_url: "https://image.tmdb.org/t/p/w300/9dCleZTAAxxNoCbmxa1zY5RAeYb.jpg",
      duration: 3780,
      release_date: "2022-02-28",
    },
    {
      _id: "e2",
      episode_number: 2,
      title: "The Blind Date",
      thumbnail_url: null,
      duration: 3660,
      release_date: "2022-02-28",
    },
    {
      _id: "e3",
      episode_number: 3,
      title: "First Encounter",
      thumbnail_url: null,
      duration: 3720,
      release_date: "2022-03-06",
    },
  ],
  "665f1a2b3c4d5e6f7a8b9c0e": [],
};

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ShowEpisodes = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const show = DUMMY_SHOWS[showId];
  const episodes = useMemo(() => {
    const list = DUMMY_EPISODES[showId] || [];
    return [...list].sort((a, b) => a.episode_number - b.episode_number);
  }, [showId]);

  const handleDelete = (episodeId) => {
    // TODO: await axios.delete(`${server_Url}/api/episodes/${episodeId}`, { withCredentials: true });
    console.log("Delete episode:", episodeId);
  };

  if (!show) {
    return (
      <div className="show-episodes">
        <button className="back-link" onClick={() => navigate("/admin")}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="empty-state">
          <div className="empty-state__title">Show not found</div>
          <p>This show may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="show-episodes">
      <button className="back-link" onClick={() => navigate("/admin")}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="show-summary">
        <div className="show-summary__poster">
          <img src={show.poster_url} alt={show.title} />
        </div>

        <div className="show-summary__info">
          <h1 className="show-summary__title">{show.title}</h1>
          <div className="show-summary__tags">
            <span className="show-summary__tag show-summary__tag--status">
              {show.status}
            </span>
            {show.genre.map((g) => (
              <span className="show-summary__tag" key={g}>
                {g}
              </span>
            ))}
          </div>
          <div className="show-summary__meta">
            <span>{show.release_year}</span>
            <span style={{ textTransform: "capitalize" }}>{show.country}</span>
            <span>{episodes.length} episodes</span>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-header__title">Episodes</h2>
        <Link to={`/admin/episodes/add?show_id=${show._id}`} className="btn btn--primary">
          <Plus size={16} />
          Add Episode
        </Link>
      </div>

      {episodes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No episodes yet</div>
          <p>Add the first episode to get this show started.</p>
        </div>
      ) : (
        <div className="episode-list">
          {episodes.map((ep) => (
            <div className="episode-row" key={ep._id}>
              <div className="episode-row__number">{ep.episode_number}</div>

              <div className="episode-row__thumb">
                {ep.thumbnail_url ? (
                  <img src={ep.thumbnail_url} alt={ep.title} />
                ) : (
                  <Play size={18} />
                )}
              </div>

              <div className="episode-row__info">
                <div className="episode-row__title">
                  Ep {ep.episode_number}: {ep.title || "Untitled"}
                </div>
                <div className="episode-row__meta">
                  <span>
                    <Clock size={12} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                    {formatDuration(ep.duration)}
                  </span>
                  <span>
                    <Calendar size={12} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                    {formatDate(ep.release_date)}
                  </span>
                </div>
              </div>

              <div className="episode-row__actions">
                <button className="btn btn--icon" title="Edit episode">
                  <Pencil size={15} />
                </button>
                <button
                  className="btn btn--icon btn--icon--danger"
                  title="Delete episode"
                  onClick={() => handleDelete(ep._id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowEpisodes;