import React, { useContext, useState } from 'react'
import axios from 'axios';
import { server_Url } from '../App';
import { FaSearch } from "react-icons/fa";
import ShowCard from './ShowCard';
import { IoIosArrowBack } from "react-icons/io";
import { showContext } from '../context/ShowProvider';
import { useSelector } from 'react-redux';
import loader from '../assets/loader.svg';
const Watchlist = () => {
  const { watchList, loading } = useSelector(state => state.user);
  const { handleShow } = useContext(showContext)

  return (
    <div className='inner-section'>
      <div className="explore-wrapper container">
        <h1>Watchlist</h1>
        {
          loading ?
            <div className='spinner'>
              <h1>You need to sign in</h1>
            </div>
            :
            watchList?.length == 0 ?
              <div className='empty'>No Shows</div>
              :
              <div className='shows-wrapper'>
                {
                  watchList?.map((show) => (
                    <div onClick={() => handleShow(show.show_id._id)}>
                      <ShowCard show={show.show_id} key={show.title || show._id} />
                    </div>
                  ))
                }
              </div>
        }
      </div>
    </div>
  )
}

export default Watchlist;