import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { server_Url } from '../App';
import { FaSearch } from "react-icons/fa";
import ShowCard from './ShowCard';
import { IoIosArrowBack } from "react-icons/io";
import { showContext } from '../context/ShowProvider';
import loader from '../assets/loader.svg';
import { useSelector } from 'react-redux';

const Search = ({ handleClose }) => {
  const { tranding } = useSelector(state => state.show)
  const [search, setSearch] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleShow } = useContext(showContext);

  const handleSearch = async (value) => {
    try {
      setLoading(true);
      setSearch(value);
      const { data } = await axios.get(`${server_Url}/api/shows/search/shows?search=${value}`);
      if (data.success)
        setShows(data.shows);
    } catch (error) {
      console.log(error?.response);
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (search == "")
      setShows(tranding)
  }, [search])
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
            <div className='spinner'>
              <img src={loader} alt="" />
            </div> :
            shows?.length != 0 &&
              <div className='shows-wrapper'>
                {shows?.map((show) => (
                  <div onClick={() => handleShow(show._id)}>
                    <ShowCard show={show} key={show.title || show._id} />
                  </div>
                ))}
              </div>
        }
      </div>
    </div>
  )
}

export default Search