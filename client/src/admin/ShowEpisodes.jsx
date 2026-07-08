import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Play, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import axios from "axios";
import { server_Url } from "../App";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

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
  const { allShows } = useSelector(state => state.show)
  const navigate = useNavigate();
  const [show, setShow] = useState({});
  const [episodes, setEpisodes] = useState([]);

  const fetchEpisodes = async () => {
    try {
      const { data } = await axios.get(`${server_Url}/api/episodes/show/${showId}/all/episodes`, { withCredentials: true });
      if (data.success)
        setEpisodes(data.episodes);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  const handleEdit = (epId) => {
     navigate(`/admin/episodes/edit/${epId}`) 
  };

  const handleDelete = async (episodeId) => {
    try {
      const { data } = await axios.delete(`${server_Url}/api/episodes/delete/${episodeId}`, { withCredentials: true });
      if (data.success)
        toast.success(data.message);
    } catch (error) {
      console.log(error.response);;
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    fetchEpisodes();
  }, [showId])

  useEffect(() => {
    const filterShow = allShows.find((show) => show._id.toString() == showId.toString())
    setShow(filterShow);
  }, [allShows, showId])


  return (
    <>
      {!show ?
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
        :
        <div className="show-episodes">
          <button className="back-link" onClick={() => navigate("/admin")}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="show-summary">
            <div className="show-summary__poster">
              <img src={show?.poster_url} alt={show?.title} />
            </div>

            <div className="show-summary__info">
              <h1 className="show-summary__title">{show?.title}</h1>
              <div className="show-summary__tags">
                <span className="show-summary__tag show-summary__tag--status">
                  {show?.status}
                </span>
                {
                  show?.genre?.map((g) => (
                    <span className="show-summary__tag" key={g}>
                      {g}
                    </span>
                  ))
                }
              </div>
              <div className="show-summary__meta">
                <span>{show?.release_year}</span>
                <span style={{ textTransform: "capitalize" }}>{show?.country}</span>
                <span>{episodes?.length} episodes</span>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-header__title">Episodes</h2>
            <Link to={`/admin/episodes/add?show_id=${show?._id}`} className="btn btn--primary">
              <Plus size={16} />
              Add Episode
            </Link>
          </div>

          {episodes?.length === 0 ? (
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
                    <div className="episode-row__title title" >
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
                    <button className="btn btn--icon" title="Edit episode" onClick={() => handleEdit(ep._id)}>
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
      }  </>
  );
};

export default ShowEpisodes;