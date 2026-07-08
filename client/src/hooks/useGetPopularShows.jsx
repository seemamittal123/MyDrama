import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setPopular } from '../redux/showSlice';

const useGetPopularShows = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/popular`, { withCredentials: true });
        dispatch(setPopular(data.shows))
      } catch (error) {
        console.log(error.response);
      }
    }
      fetchUserWatchList();
  }, [dispatch])
}

export default useGetPopularShows;