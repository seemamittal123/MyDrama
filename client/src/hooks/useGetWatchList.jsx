import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setWatchList } from '../redux/userSlice';

const useGetWatchList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserWatchList = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/users/watchlist`, { withCredentials: true });
        dispatch(setWatchList(data.watchlist))
      } catch (error) {
        console.log(error.response);
      }
    }
      fetchUserWatchList();
  }, [dispatch])
}

export default useGetWatchList