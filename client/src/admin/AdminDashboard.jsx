import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Eye, Film } from "lucide-react";

// Replace with real data fetched from your API (GET /api/shows)
const DUMMY_SHOWS = [
  {
    _id: "665f1a2b3c4d5e6f7a8b9c0d",
    title: "Business Proposal",
    poster_url: "https://image.tmdb.org/t/p/w300/9dCleZTAAxxNoCbmxa1zY5RAeYb.jpg",
    status: "completed",
    genre: ["Romance", "Comedy"],
    total_episodes: 12,
    views: 154302,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b9c0e",
    title: "Vincenzo",
    poster_url: "https://image.tmdb.org/t/p/w300/2S1cH8mUuXeeCJTFvR8VwOMTdcU.jpg",
    status: "completed",
    genre: ["Action", "Drama"],
    total_episodes: 20,
    views: 98211,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b9c0f",
    title: "Crash Landing on You",
    poster_url: "https://image.tmdb.org/t/p/w300/uK5wYaJoZmzwlaeIeGb9GO2Duy4.jpg",
    status: "ongoing",
    genre: ["Romance", "Drama"],
    total_episodes: 8,
    views: 210044,
  },
  {
    _id: "665f1a2b3c4d5e6f7a8b9c10",
    title: "The Untamed",
    poster_url: "https://image.tmdb.org/t/p/w300/40dCJvzsF1yhSXWXQnXFXgOjRnp.jpg",
    status: "upcomming",
    genre: ["Fantasy", "boylove"],
    total_episodes: 0,
    views: 0,
  },
];

const STATUS_FILTERS = ["all", "ongoing", "completed", "upcomming"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [shows] = useState(DUMMY_SHOWS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.total_episodes || 0), 0);
    const totalViews = shows.reduce((sum, s) => sum + (s.views || 0), 0);
    const ongoing = shows.filter((s) => s.status === "ongoing").length;
    return { totalShows: shows.length, totalEpisodes, totalViews, ongoing };
  }, [shows]);

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const matchesSearch = show.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || show.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shows, search, statusFilter]);

  const goToEpisodes = (showId) => {
    navigate(`/admin/shows/${showId}/episodes`);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Admin Dashboard</h1>
          <p className="admin-header__subtitle">
            Manage all series and shows in the catalog.
          </p>
        </div>
        <Link to="/admin/series/add" className="btn btn--primary">
          <Plus size={16} />
          Add New Series
        </Link>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-card__label">Total Shows</div>
          <div className="stat-card__value">{stats.totalShows}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Episodes</div>
          <div className="stat-card__value">{stats.totalEpisodes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Ongoing</div>
          <div className="stat-card__value">{stats.ongoing}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Views</div>
          <div className="stat-card__value">{stats.totalViews.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search shows by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === "all"
                ? "All Statuses"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredShows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No shows found</div>
          <p>Try a different search or filter, or add a new series.</p>
        </div>
      ) : (
        <div className="series-grid">
          {filteredShows.map((show) => (
            <button
              key={show._id}
              className="series-card"
              onClick={() => goToEpisodes(show._id)}
            >
              <div className="series-card__poster">
                <img src={show.poster_url} alt={show.title} />
                <span className={`series-card__status series-card__status--${show.status}`}>
                  {show.status}
                </span>
              </div>
              <div className="series-card__body">
                <h3 className="series-card__title">{show.title}</h3>
                <div className="series-card__meta">
                  <span>
                    <Film size={12} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                    {show.total_episodes} eps
                  </span>
                  <span>
                    <Eye size={12} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                    {show.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;