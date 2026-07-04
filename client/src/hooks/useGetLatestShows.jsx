import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setLatest } from '../redux/showSlice';

const useGetLatestShows = () => {
  const { user } = useSelector(state => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/latest`, { withCredentials: true });
        dispatch(setLatest(data.shows))
      } catch (error) {
        console.log(error.response);
      }
    }
    if (user?._id) {
      fetchUserWatchList();
    }
  }, [dispatch, user?._id])
}

export default useGetLatestShows