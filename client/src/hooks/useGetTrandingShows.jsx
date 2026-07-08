import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setTranding } from '../redux/showSlice';

const useGetTrandingShows = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/trending`, { withCredentials: true });
        dispatch(setTranding(data.shows))
      } catch (error) {
        console.log(error.response);
      }
    }
      fetchUserWatchList();
  }, [dispatch])
}

export default useGetTrandingShows