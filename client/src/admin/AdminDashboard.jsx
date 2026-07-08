import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Eye, Film, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { server_Url } from "../App";
import { ImBin } from "react-icons/im";
import toast from "react-hot-toast";

const STATUS_FILTERS = ["all", "ongoing", "completed", "upcomming"];

const AdminDashboard = () => {

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shows, setShows] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const stats = useMemo(() => {
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.total_episodes || 0), 0);
    const totalViews = shows.reduce((sum, s) => sum + (s.views || 0), 0);
    const ongoing = shows.filter((s) => s.status === "ongoing").length;
    return { totalShows: shows.length, totalEpisodes, totalViews, ongoing };
  }, [shows]);

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const matchesSearch = show.title?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || show.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shows, search, statusFilter]);

  const goToEpisodes = (showId) => {
    navigate(`/admin/shows/${showId}/episodes`);
  };

  const goToEdit = (e, showId) => {
    e.stopPropagation();
    navigate(`/admin/series/edit/${showId}`);
  };

  const handleDelete = async (e, showId) => {
    e.stopPropagation();
    try {
      const { data } = await axios.delete(`${server_Url}/api/shows/show/delete/${showId}`, { withCredentials: true });
      if (data.success)
        toast.success(data.message);
    } catch (error) {
      console.log(error.response);
    }
  }


  const fetchShows = async () => {
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 20,
      });
      const { data } = await axios.get(`${server_Url}/api/shows/all/shows?${params}`, { withCredentials: true });
      setPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages);
      setShows(data.shows);
    } catch (error) {
      console.log(error?.response);
    }
  }

  useEffect(() => {
    fetchShows();
  }, [page])

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
            <div
              key={show._id}
              className="series-card"
              onClick={() => goToEpisodes(show._id)}
              role="button"
              tabIndex={0}
            >
              <button
                className="series-card__edit-btn"
                title="Edit show"
                onClick={(e) => goToEdit(e, show._id)}
              >
                <Pencil size={14} />
              </button>
              <button
                className="series-card__bin-btn"
                title="Edit show"
                onClick={(e) => handleDelete(e, show._id)}
              >
                <ImBin size={14} />
              </button>

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
            </div>
          ))}
          {filteredShows.length == 20 &&
            <button onClick={() => setPage(page + 1)} className="next-btn">
              Next
            </button>}
        </div>
      )
      }
    </div >
  );
};

export default AdminDashboard;