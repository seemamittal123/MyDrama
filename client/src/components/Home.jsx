import React, { useContext, useEffect, useState } from 'react'
import TopSlider from './TopSlider';
import Slider from './Slider';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server_Url } from '../App';
import Show from './Show';
import { showContext } from '../context/ShowProvider';
const Home = () => {
  const { allShows, popular, latest, tranding, loading } = useSelector(state => state.show);
  const { continueWatch, history } = useSelector(state => state.user);
  const [dramas, setDramas] = useState({});

  const { handleShow } = useContext(showContext);

  const continueWatchShows = continueWatch?.map(item => ({
    ...item.show_id,
    completedEpisodesCount: item.completedEpisodesCount,
    totalEpisodesCount: item.totalEpisodesCount,
    episode_id: item.episode_id,
  })) || [];


  const fetchDramas = async (value) => {
    try {
      const { data } = await axios.get(`${server_Url}/api/shows/filter/shows?q=${value}`);
      setDramas(prev => ({ ...prev, [value]: data.shows }));
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchDramas("korean");
    fetchDramas("chinese");
    fetchDramas("upcomming");
  }, []);


  return (
    <div className=''>
      <div className="inner-section">
        <div className="swipper-wrapper">
          <TopSlider data={tranding} handleShow={handleShow} />
        </div>
        <div className="container">
          <div className="slider-wrapper">
            <Slider data={continueWatchShows} heading={"continue-watching"} handleShow={handleShow} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Slider data={latest} heading={"Latest-show"} handleShow={handleShow} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Slider data={tranding} heading={"tranding-show"} handleShow={handleShow} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Slider data={dramas.korean} heading={"korean-drama"} handleShow={handleShow} loading={loading} />
          </div> <div className="slider-wrapper">
            <Slider data={dramas.chinese} heading={"chinese-drama"} handleShow={handleShow} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Slider data={dramas.upcomming} heading={"upcoming-show"} handleShow={handleShow} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home