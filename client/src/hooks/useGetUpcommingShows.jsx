import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setUpcomming } from '../redux/showSlice';

const useGetUpcommingShows = () => {
  const { user } = useSelector(state => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/upcomming`, { withCredentials: true });
        dispatch(setUpcomming(data.shows))
      } catch (error) {
        console.log(error.response);
      }
    }
    if (user?._id) {
      fetchUserWatchList();
    }
  }, [dispatch, user?._id])
}

export default useGetUpcommingShows