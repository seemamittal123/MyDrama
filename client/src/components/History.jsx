import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import loader from '../assets/loader.svg'
import ShowCard from './ShowCard';
import { showContext } from '../context/ShowProvider';
const History = () => {
  const { history, loading } = useSelector(state => state.user);

  const { handleShow } = useContext(showContext);

  const goToShow = (showId) => {
    handleShow(showId);
  }

  return (
    <div className='inner-section'>
      <div className="explore-wrapper container">
        {
          loading ?
            <div className='spinner'>
              <div className="empty">
                <img src={loader} alt="" />
              </div>
            </div> :
            history.length > 0 ?
              history.map((show) => (
                <div onClick={() => goToShow(show._id)}>
                  <ShowCard show={show} />
                </div>
              ))
              :
              <div className='empty'>No History</div>
        }
      </div>
    </div>
  )
}

export default History