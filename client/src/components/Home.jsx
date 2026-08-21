import React, { useContext, useEffect, useState } from 'react'
import TopSlider from './TopSlider';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server_Url } from '../App';
import Show from './Show';
import { showContext } from '../context/ShowProvider';
import Scroll from './Scroll';
const Home = () => {
  const { allShows, popular, latest, tranding, loading, trandingLoading } = useSelector(state => state.show);
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
    fetchDramas("upcoming");
    fetchDramas("US");
    fetchDramas("anime");
    fetchDramas("movie")
  }, []);


  return (
    <div className=''>
      <div className="inner-section">
        <div className="swipper-wrapper">
          <TopSlider data={tranding} handleShow={handleShow} loading={trandingLoading} />
        </div>
        <div className="container">
          <div className="slider-wrapper">

            <Scroll items={continueWatchShows} title={"continue-watching"} loading={loading} />
          </div>
          <div className="slider-wrapper">
          </div>
          <Scroll items={latest} title={"latest-show"} loading={loading} />
          <div className="slider-wrapper">
            <Scroll items={tranding} title={"tranding-show"} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Scroll items={dramas.korean} title={"korean-drama"} loading={loading} />
          </div> <div className="slider-wrapper">
            <Scroll items={dramas.chinese} title={"chinese-drama"} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Scroll items={dramas.movie} title={"movies"} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Scroll items={dramas.anime} title={"anime"} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Scroll items={dramas.US} title={"united-states"} loading={loading} />
          </div>
          <div className="slider-wrapper">
            <Scroll items={dramas.upcoming} title={"upcoming-show"} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home