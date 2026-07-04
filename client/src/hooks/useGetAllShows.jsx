import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setAllShows } from '../redux/showSlice';

const useGetAllShows = () => {
  const { user } = useSelector(state => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/all/shows`, { withCredentials: true });
        dispatch(setAllShows(data.shows));
        console.log(data)

      } catch (error) {
        console.log(error.response);
      }
    }
    if (user?._id) {
      fetchUserWatchList();
    }
  }, [dispatch, user?._id])
}

export default useGetAllShows