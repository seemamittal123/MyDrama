import React, { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { server_Url } from '../App';
import { FaSearch } from "react-icons/fa";
import ShowCard from './ShowCard';
import { IoIosArrowBack } from "react-icons/io";
import { showContext } from '../context/ShowProvider';
import loader from '../assets/loader.svg';
import { useSelector } from 'react-redux';
import ShowCardSkeleton from './ShowCardSkeleton';

const Search = ({ handleClose }) => {
  const { tranding } = useSelector(state => state.show)
  const [search, setSearch] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const resultsWrapperRef = useRef(null);
  const { handleShow } = useContext(showContext);

  const handleSearch = async (value) => {
    try {
      setLoading(true);
      setSearch(value);
      const { data } = await axios.get(`${server_Url}/api/shows/search/shows`, {
        params: { search: value, page: 1, limit: 20 },
      });
      if (data.success) {
        setShows(data.shows);
        setPage(1);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.log(error?.response);
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (search == "") {
      setShows(tranding)
      setPage(1);
      setHasMore(false);
    }
  }, [search])

  const handleNextPage = async () => {
    const scrollPosition = window.scrollY;
    const resultsScrollPosition = resultsWrapperRef.current?.scrollTop || 0;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { data } = await axios.get(`${server_Url}/api/shows/search/shows`, {
        params: { search, page: nextPage, limit: 20 },
      });
      if (data.success) {
        setShows((previousShows) => {
          const existingShowIds = new Set(previousShows.map((show) => show._id));
          return [...previousShows, ...data.shows.filter((show) => !existingShowIds.has(show._id))];
        });
        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.log(error?.response);
    } finally {
      setLoadingMore(false);
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
        if (resultsWrapperRef.current) {
          resultsWrapperRef.current.scrollTop = resultsScrollPosition;
        }
      });
    }
  };
  return (
    <div className='search-cover-box'>
      <div className="search-wrapper">
        <div className="input-wrapper">
          <button className="back-btn" onClick={handleClose}>
            <IoIosArrowBack size={22} />
          </button>
          <input type="text" placeholder='Enter title ' value={search} name='search' onChange={(e) => handleSearch(e.target.value)} />
          <button>
            <FaSearch size={22} />
          </button>
        </div>
        {
          loading ?
            <div className="shows-wrapper">
              {Array.from({ length: 20 }, (_, index) => <ShowCardSkeleton key={index} />)}
            </div> :
            shows?.length != 0 &&
            <div>
              <div ref={resultsWrapperRef} className='shows-wrapper'>
                {shows?.map((show) => (
                  <div key={show._id} onClick={() => handleShow(show._id)}>
                    <ShowCard show={show} key={show.title || show._id} />
                  </div>
                ))}
              </div>
              {hasMore && (
                <button onClick={handleNextPage} disabled={loadingMore} className="more-btn">
                  {loadingMore ? 'Loading...' : 'Next'}
                </button>
              )}
            </div>
        }
      </div>
    </div>
  )
}

export default Search