import { useEffect, useState } from "react";
import { Play, Plus, ThumbsUp, X, ChevronDown } from "lucide-react";
import axios from "axios";
import { server_Url } from "../App";
import { RxCross1 } from "react-icons/rx";
import { FaPlay, FaPlus, FaThumbsUp } from "react-icons/fa";
import toast from "react-hot-toast";
import loader from '../assets/loader.svg';
import VideoPlayer from "./VideoPlayer";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Show = ({ show, episodes, onClose, handleShow }) => {
  const { user } = useSelector(state => state.user);
  const [episodesOpen, setEpisodesOpen] = useState(true);
  const [related, setRelated] = useState([]);
  const [liked, setLiked] = useState(false)
  const [loading, setloading] = useState(false)
  const navigate = useNavigate();


  const goToResume = async () => {
    if (user?.id) {
      try {
        const { data } = await axios.get(
          `${server_Url}/api/users/watch-history/resume/${show._id}`,
          { withCredentials: true }
        );

        if (data.success) {
          navigate(`/Drama/${show.slug}/episode/${data.episode_id}`);
        }
      } catch (error) {
        console.log(error?.response);
      }
    }
    else {
      toast.error("You need to sign in")
    }
  };
  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  };
  const fetchRelatedShows = async () => {
    try {
      setloading(true);
      const { data } = await axios.get(`${server_Url}/api/shows/filter/shows?q=${show?.genre.join("&")}&limit=6`)
      if (data.success) {
        const filterData = data.shows.filter((s) => s._id.toString() != show._id.toString())
        setRelated(filterData);
      }
    } catch (error) {
      console.log(error.response);
    }
    finally {
      setloading(false);
    }
  }
  const goToAddWatchList = async (e, showId) => {
    e.stopPropagation();
    if (user?._id) {

      try {
        const { data } = await axios.post(`${server_Url}/api/users/create/watchlist`, { show_id: showId }, { withCredentials: true })
        if (data.success)
          toast.success(data.message);
      } catch (error) {
        console.log(error?.response);
      }
    }
    else {
      toast.error("You need to sign in")
    }
  }

  const goToLike = async (e, showId) => {
    e.stopPropagation();
    if (user?._id) {
      try {
        const { data } = await axios.post(`${server_Url}/api/shows/like-dislike`, { show_id: showId }, { withCredentials: true })
        if (data.success) {
          toast.success(data.message);
          setLiked(data.liked)
        }
      } catch (error) {
        console.log(error?.response);
      }
    }
    else {
      toast.error("You need to sign in")
    }
  }

  useEffect(() => {
    fetchRelatedShows();
  }, [])

  useEffect(() => {
    const checkLike = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/check-like/${show._id}`, { withCredentials: true })
        if (data.success)
          setLiked(data.liked);
      } catch (error) {
        console.log(error?.response);
      }
    }
    if (user?._id)
      checkLike();
  }, [])


  return (
    <>
      <div className="cover-box">
        <div className="show">
          <div className="show__hero">
            <div className="show__banner">
              <img
                src={show?.poster_url || show?.banner_url}
                alt={show?.title}
                className="show__banner-img"
              />
              <div className="show__banner-overlay" />

              <div className="show__title">{show?.title}</div>

              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="show__close"
                >
                  <RxCross1 size={18} />
                </button>
              )}

              <div className="show__banner-fade" />
            </div>

            <div className="show__actions">
              <button className="show__play-btn" onClick={goToResume}>
                <Play size={20} fill="black" />
                Play
              </button>
              <Link className="show__play-btn" target="_blank" to={`${show.trailer_url}`}>Trailer</Link>
              <button aria-label="Add to My List" className="show__icon-btn" onClick={(e) => goToAddWatchList(e, show?._id)}>
                <Plus size={20} />
              </button>
              <button aria-label="Rate this title" className="show__icon-btn" onClick={(e) => goToLike(e, show?._id)}>
                {liked ? <FaThumbsUp size={18} /> : <ThumbsUp size={18} />}
              </button>
            </div>
          </div>

          <div className="show__meta">
            <div>
              <div className="show__meta-row">
                <span className="show__muted">{show?.release_year}</span>
                <span className="show__muted">{show?.session} Session </span>
                <span className="show__tag show__tag--rounded">
                  {show?.hd ? "HD" : "SD"}
                </span>
                <span className="show__tag">{show?.views}</span>
              </div>
              <p className="show__description">{show?.description}</p>
            </div>

            <div className="show__info">
              <div>
                <span className="show__info-label">Cast: </span>
                {show?.cast.join(" , ")}
              </div>
              <div>
                <span className="show__info-label">Genres: </span>
                {show?.genre.join(" , ")}
              </div>
            </div>
          </div>
          <div className="show__section">
            <div className="show__section-header">
              <h2 className="show__section-title">Episodes</h2>
              <button
                onClick={() => setEpisodesOpen((o) => !o)}
                className="show__season-btn"
              >
                Season 1 ({episodes?.length} EP)
                <ChevronDown
                  size={16}
                  className={`show__chevron ${episodesOpen ? "show__chevron--open" : ""
                    }`}
                />
              </button>
            </div>

            {episodesOpen && (
              <ul className="show__episode-list">
                {
                  episodes?.map((ep) => (
                    <li key={ep.number} className="show__episode" onClick={() => navigate(`/Drama/${show.slug}/episode/${ep._id}`)}>
                      <span className="show__episode-number">{ep.episode_number}</span>
                      <div className="show__episode-thumb">
                        {ep.thumbnail_url && (
                          <img src={ep.thumbnail_url} alt={ep.title} />
                        )}
                        <div className="show__episode-thumb-overlay">
                          <Play size={22} fill="white" />
                        </div>
                      </div>
                      <div className="show__episode-body">
                        <div className="show__episode-top">
                          <h3 className="show__episode-title">{ep.episode_number} {ep.title}</h3>
                          <span className="show__episode-duration">
                            {formatDuration(ep.duration)}
                          </span>
                        </div>
                        <p className="show__episode-desc">{ep.description}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="show__section">
            <h2 className="show__section-title" style={{ marginBottom: "1rem" }}>
              More Like This
            </h2>
            <div className="show__related-grid">
              {
                loading ?
                  <div className='spinner'>
                    <img src={loader} alt="" />
                  </div> :
                  related?.map((item) => (
                    <div className="show-card" onClick={() => handleShow(item._id)}>
                      <div className="show-card__image">
                        <img
                          src={item.poster_url || item.banner_url} alt={item.title} />
                        <div className="show-card__overlay">
                          <button className="play-btn">
                            <FaPlay />
                          </button>
                        </div>

                        <div className="season-tag">{item.session} Seasons</div>
                      </div>

                      <div className="show-card__content">
                        <div className="show-card__top">
                          <div className="left">
                            <span className="match">65% Match</span>

                            <div className="meta">
                              <span className="rating">U/A 16+</span>
                              <span className="year">{item.release_year}</span>
                            </div>
                          </div>

                          <button className="add-btn">
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="show__footer">
            <div>
              <span className="show__footer-label">Cast: </span>
              {show?.cast}
            </div>
            <div>
              <span className="show__footer-label">Genres: </span>
              {show?.genre.join(" , ")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Show;
