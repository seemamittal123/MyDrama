import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { FaThumbsUp } from "react-icons/fa";
import axios from 'axios';
import { server_Url } from '../App';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShowCard = ({ show, key }) => {
  const { user } = useSelector(state => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false)
  const menuRef = useRef(null);
  const navigate = useNavigate();
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
    } else {
      toast.error("You need to sign in")
    }
  }
  const goToResume = async (e) => {
    e.stopPropagation();
    if (user?._id) {

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    checkLike();
  }, [])

  return (
    <div className="show-card-wrapper" key={key}>
      <div className="show-card-poster">
        <img src={show.banner_url} alt={show.title} />
      </div>

      <div className="show-card-expanded">
        <div className="expanded-image-wrapper">
          <img src={show.banner_url} alt={show.title} />
        </div>

        <div className="expanded-content">
          <div className="expanded-meta-row">
            {show.completedEpisodesCount !== undefined ? (
              <>
                <span className="match-score">{show.completedEpisodesCount}/{show.totalEpisodesCount} Watched</span>
              </>
            ) : (
              <span className="match-score">{show.rating || '96%'} Match</span>
            )}
            <span className="hd-badge">HD</span>
            <span>{show.session} Session</span>
          </div>

          <div className="expanded-actions">
            <button className="action-btn play-btn" onClick={(e) => goToResume(e)}>
              <Play size={18} fill="black" />
            </button>
            <button className="action-btn circle-btn" onClick={(e) => goToAddWatchList(e, show._id)}>
              <Plus size={18} />
            </button>
            <button className="action-btn circle-btn" onClick={(e) => goToLike(e, show._id)}>
              {liked ? <FaThumbsUp size={18} /> : <ThumbsUp size={18} />}
            </button>
            <button
              className="action-btn circle-btn more-btn"

              onClick={(e) => { setMenuOpen((open) => !open), e.stopPropagation() }}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {menuOpen && (
            <div className="dropdown-menu" ref={menuRef}>
              <button className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                Add to watchlist
              </button>
              <button className="dropdown-item">
                Save for later
              </button>
              <button className="dropdown-item cancel-item" onClick={(e) => { setMenuOpen(false), e.stopPropagation() }}>
                Cancel
              </button>
            </div>
          )}

          <div className="expanded-genres">
            {show?.genre?.map((genre, index) => (
              <React.Fragment key={genre}>
                <span>{genre}</span>
                {index < show.genre.length - 1 && <span className="dot">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ShowCard;