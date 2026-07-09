import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setContinueWatch, setHistory } from '../redux/userSlice';

const useGetContinueWatch = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserContinueWatch = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/users/continue-watching`, { withCredentials: true });
        dispatch(setContinueWatch(data.history))
      } catch (error) {
        console.log("Continue watching error:", error.response);
        dispatch(setContinueWatch([])); 
      }
    }
    fetchUserContinueWatch();
  }, [dispatch])
}

export default useGetContinueWatch;