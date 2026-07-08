import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setHistory } from '../redux/userSlice';

const useGetHistory = () => {
  const { user } = useSelector(state => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserHitory = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/users/history`, { withCredentials: true });
        dispatch(setHistory(data.history));
        console.log(data);
        
      } catch (error) {
        console.log(error.response);
        dispatch(setHistory([]));
      }
    }
    if (user?._id) {
      fetchUserHitory();
    }
  }, [dispatch, user?._id])
}

export default useGetHistory;