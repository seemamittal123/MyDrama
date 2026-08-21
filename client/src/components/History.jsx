import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ShowCard from './ShowCard';
import { showContext } from '../context/ShowProvider';
import ShowCardSkeleton from './ShowCardSkeleton';
import { ImBin } from "react-icons/im";
import axios from 'axios';
import { server_Url } from '../App';
import toast from 'react-hot-toast';
import { setHistory } from '../redux/userSlice';

const History = () => {
  const { history, loading, user } = useSelector(state => state.user);
  const { handleShow } = useContext(showContext);
  const dispatch = useDispatch();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const goToShow = (show) => {
    handleShow(show);
  }

  const continueWatchShows = history?.map(item => ({
    ...item.show_id,
    completedEpisodesCount: item.completedEpisodesCount,
    totalEpisodesCount: item.totalEpisodesCount,
    episode_id: item.episode_id,
  })) || [];

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCardClick = (show) => {
    if (selectMode) {
      toggleSelect(show._id);
    } else {
      goToShow(show);
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`${server_Url}/api/users/clear-history`, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        dispatch(setHistory([]));
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.log(error.response);
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const { data } = await axios.delete(`${server_Url}/api/users/clear-history`, {
        withCredentials: true,
        data: { show_ids: [...selectedIds] },
      });
      if (data.success) {
        toast.success(data.message);
        dispatch(setHistory(history.filter((item) => !selectedIds.has(item.show_id?._id?.toString()))));
        setSelectedIds(new Set());
        setSelectMode(false);
      }
    } catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div className='inner-section'>
      <div className="explore-wrapper container">
        <div className="header">
          <h1>History</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectMode ? (
              <>
                <button className="clear-btn" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
                  <ImBin /><span>Delete Selected ({selectedIds.size})</span>
                </button>
                <button className="clear-btn" onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}>
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button className="clear-btn" onClick={() => setSelectMode(true)}>
                  <span>Select</span>
                </button>
                <button className="clear-btn" onClick={handleDelete}>
                  <ImBin /><span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>
        {
          loading ?
            <div className="shows-wrapper">
              {Array.from({ length: 20 }, (_, index) => <ShowCardSkeleton key={index} />)}
            </div> :
            continueWatchShows.length > 0 ?
              <div className="shows-wrapper">
                {continueWatchShows.map((show) => (
                  <div
                    key={show._id}
                    onClick={() => handleCardClick(show)}
                    style={{
                      position: 'relative',
                    }}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(show._id)}
                        onChange={() => toggleSelect(show._id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: "20px", position: 'absolute', top: "5px", left: "5px", zIndex: 2 }}
                      />
                    )}
                    <ShowCard show={show} />
                  </div>
                ))}
              </div>
              :
              <div className='empty'>No History</div>
        }
      </div>
    </div>
  )
}

export default History;