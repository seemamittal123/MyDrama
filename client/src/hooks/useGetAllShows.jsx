import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setAllShows } from '../redux/showSlice';

const useGetAllShows = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllShows = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/shows/all/shows?page=1&limit=20`, { withCredentials: true });
        dispatch(setAllShows(data.shows));
      } catch (error) {
        console.log(error.response);
      }
    }
    fetchAllShows();
  }, [dispatch])
}

export default useGetAllShows