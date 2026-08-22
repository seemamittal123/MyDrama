import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Eye, Film, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { server_Url } from "../App";
import { ImBin } from "react-icons/im";
import toast from "react-hot-toast";
import { removeShow } from "../redux/showSlice";

const STATUS_FILTERS = ["all", "ongoing", "completed", "upcoming"];

const StatsSkeleton = () => (
  <div className="admin-stats admin-stats-skeleton" aria-hidden="true">
    {[1, 2, 3, 4].map((stat) => (
      <div className="stat-card" key={stat}>
        <div className="skeleton-line skeleton-stat-label" />
        <div className="skeleton-line skeleton-stat-value" />
      </div>
    ))}
  </div>
);

const SeriesSkeleton = () => (
  <div className="series-grid series-grid-skeleton" aria-label="Loading shows">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => (
      <div className="series-card" key={card}>
        <div className="series-card__poster skeleton-shimmer" />
        <div className="series-card__body">
          <div className="skeleton-line skeleton-show-title" />
          <div className="skeleton-line skeleton-show-meta" />
        </div>
      </div>
    ))}
  </div>
);

const AdminDashboard = () => {

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shows, setShows] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const stats = useMemo(() => {
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.total_episodes || 0), 0);
    const totalViews = shows.reduce((sum, s) => sum + (s.views || 0), 0);
    const ongoing = shows.filter((s) => s.status === "ongoing").length;
    return { totalShows: shows.length, totalEpisodes, totalViews, ongoing };
  }, [shows]);

  const searchShow = async () => {
    setLoading(true);
    try {
      if (!search) return;
      setPage(1);
      const { data } = await axios.get(`${server_Url}/api/shows/search/shows?search=${search}`, { withCredentials: true })
      console.log(data);
      setShows(data.shows)
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };
  const filteredShows = async () => {
    setLoading(true);
    try {
      if (!statusFilter) return;
      setPage(1);

      if (statusFilter === "all") {
        await fetchShows();
        return;
      }

      const { data } = await axios.get(`${server_Url}/api/shows/filter/shows?q=${statusFilter}`, { withCredentials: true })
      setShows(data.shows)
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  const goToEpisodes = (showId) => {
    navigate(`/admin/shows/${showId}`);
  };

  const goToEdit = (e, showId) => {
    e.stopPropagation();
    navigate(`/admin/series/edit/${showId}`);
  };

  const handleDelete = async (e, showId) => {
    e.stopPropagation();
    try {
      const { data } = await axios.delete(`${server_Url}/api/shows/show/delete/${showId}`, { withCredentials: true });
      toast.success(data.message);
      setShows((prevShows) => prevShows.filter((show) => show._id !== showId));
      dispatch(removeShow(showId));
    } catch (error) {
      console.log(error.response);
    }
  }

  const handleNextPage = () => {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
  }


  const fetchShows = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
      });
      const { data } = await axios.get(`${server_Url}/api/shows/all/shows?${params}`, { withCredentials: true });
      setPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages);
      setShows((previousShows) => {
        if (pageNum === 1) return data.shows;

        const existingShowIds = new Set(previousShows.map((show) => show._id));
        const newShows = data.shows.filter((show) => !existingShowIds.has(show._id));
        return [...previousShows, ...newShows];
      });
    } catch (error) {
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (search.trim()) {
      searchShow();
      return;
    }

    if (statusFilter !== "all") {
      filteredShows();
      return;
    }

    fetchShows(page);
  }, [page, search, statusFilter]);

  return (
    <div className="admin-dashboard container">
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

      {loading ? <StatsSkeleton /> : (
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
      )}

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

      {loading ? (
        <SeriesSkeleton />
      ) : shows?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No shows found</div>
          <p>Try a different search or filter, or add a new series.</p>
        </div>
      ) : (
        <>
          <div className="series-grid">
            {shows?.map((show) => (
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
                  title="Delete show"
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
          </div>

          {page < totalPages && (
            <div className="pagination">
              <button onClick={handleNextPage} className="next-btn">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;