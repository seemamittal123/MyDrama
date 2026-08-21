import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ShowCard from './ShowCard';
import axios from 'axios';
import { server_Url } from '../App';
import { showContext } from '../context/ShowProvider';
import ShowCardSkeleton from './ShowCardSkeleton';
import { appendShows } from '../redux/showSlice';

const Explore = () => {
  const { allShows, allShowsTotalPages, loading } = useSelector(state => state.show);
  const { handleShow } = useContext(showContext);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasMore = page < allShowsTotalPages;

  const handleNextPage = async () => {
    const scrollPosition = window.scrollY;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { data } = await axios.get(`${server_Url}/api/shows/all/shows`, {
        params: { page: nextPage, limit: 20 },
        withCredentials: true,
      });
      dispatch(appendShows(data.shows));
      setPage(nextPage);
    } catch (error) {
      console.log(error?.response);
    } finally {
      setLoadingMore(false);
      window.requestAnimationFrame(() => window.scrollTo(0, scrollPosition));
    }
  };

  const goToShow = (e, showId) => {
    handleShow(showId);
  }
  return (
    <div>
      <div className="inner-section">
        <div className='explore-wrapper container'>
          <h1>All shows</h1>
          {
            loading ?
              <div className="shows-wrapper">
                {Array.from({ length: 20 }, (_, index) => <ShowCardSkeleton key={index} />)}
              </div>
              :
              <>
                <div className="shows-wrapper">
                  {
                    allShows?.map((show) => (
                      <div key={show._id} onClick={(e) => goToShow(e, show._id)}>
                        <ShowCard show={show} />
                      </div>
                    ))
                  }

                </div>
                {hasMore && !loading && (
                  <button onClick={handleNextPage} disabled={loadingMore} className="more-btn">
                    <p>{loadingMore ? 'Loading...' : 'Next'}</p>
                  </button>
                )}
              </>
          }
        </div>
      </div>
    </div>
  )
}

export default Explore