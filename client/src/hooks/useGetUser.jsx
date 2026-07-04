import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios';
import { server_Url } from '../App';
import { setUser } from '../redux/userSlice';

const useGetUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${server_Url}/api/users/user`, { withCredentials: true });
        dispatch(setUser(data));
      } catch (error) {
        console.log(error.response);
      }
    }
    fetchUser();
  }, [dispatch])
}

export default useGetUser