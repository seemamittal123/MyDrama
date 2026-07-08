import React, { useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import ShowCard from './ShowCard';
import axios from 'axios';
import { server_Url } from '../App';
import Show from './Show';
import { showContext } from '../context/ShowProvider';
import loader from '../assets/loader.svg';

const Explore = () => {
  const { allShows, loading } = useSelector(state => state.show);
  const { handleShow } = useContext(showContext);

  const goToShow = (e, showId) => {
    handleShow(showId);
  }
  return (
    <div>
      <div className="inner-section">
        <div className='explore-wrapper container'>
          <h1>All shows</h1>
          <div className="shows-wrapper">
            {
              loading ?
                <div className='spinner'>
                  <div className="empty">
                    <img src={loader} alt="" />
                  </div>
                </div>
                : allShows?.map((show) => (
                  <div key={show?.id || show?.title} onClick={(e) => goToShow(e, show._id)}>
                    <ShowCard show={show} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore