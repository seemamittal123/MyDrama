import React from 'react'
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useGetHistory from './hooks/useGetHistory';
import useGetWatchList from './hooks/useGetWatchList';
import useGetUser from './hooks/useGetUser';
import useGetLatestShows from './hooks/useGetLatestShows';
import useGetTrandingShows from './hooks/useGetTrandingShows';
import useGetPopularShows from './hooks/useGetPopularShows';
import './style/index.scss';
import useGetAllShows from './hooks/useGetAllShows';
import useGetUpcommingShows from './hooks/useGetUpcommingShows';
export const server_Url = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const App = () => {

  useGetUser();
  useGetHistory();
  useGetWatchList();
  useGetLatestShows();
  useGetTrandingShows();
  useGetPopularShows();
  useGetAllShows();
  useGetUpcommingShows();
  
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

export default App