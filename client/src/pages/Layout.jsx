import React, { useContext, useState } from 'react'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
import Show from '../components/Show';
import { showContext } from '../context/ShowProvider';
import Search from '../components/Search';
import Footer from '../components/Footer';


const Layout = () => {
  const [searchToggle, setSearchToggle] = useState(false);
  const { toggle, showDetails, episodes, onClose, handleShow } = useContext(showContext);
  const handleClose = () => {
    setSearchToggle(false)
  }
  return (
    <>
      <Header setSearchToggle={setSearchToggle} />
      <Outlet />
      <Footer/>
      {toggle && <Show show={showDetails} episodes={episodes} onClose={onClose} handleShow={handleShow} />}
      {searchToggle && <Search handleClose={handleClose} />}
    </>
  )
}

export default Layout