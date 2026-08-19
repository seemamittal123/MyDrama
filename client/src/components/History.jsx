import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import loader from '../assets/loader.svg'
import ShowCard from './ShowCard';
import { showContext } from '../context/ShowProvider';
import ShowCardSkeleton from './ShowCardSkeleton';
const History = () => {
  const { history, loading, user } = useSelector(state => state.user);

  const { handleShow } = useContext(showContext);

  const goToShow = (showId) => {
    handleShow(showId);
  }
  const continueWatchShows = history?.map(item => ({
    ...item.show_id,
    completedEpisodesCount: item.completedEpisodesCount,
    totalEpisodesCount: item.totalEpisodesCount,
    episode_id: item.episode_id,
  })) || [];

  return (
    <div className='inner-section'>
      <div className="explore-wrapper container">
        <h1>History </h1>
        {
          loading ?
            <div className="shows-wrapper">
              {Array.from({ length: 20 }, (_, index) => <ShowCardSkeleton key={index} />)}
            </div> :
            continueWatchShows.length > 0 ?
              <div className="shows-wrapper">
                {continueWatchShows.map((show) => (
                  <div onClick={() => goToShow(show._id)}>
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

export default History