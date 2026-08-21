import React, { useContext, useState } from 'react'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
import Show from '../components/Show';
import { showContext } from '../context/ShowProvider';
import Search from '../components/Search';
import Footer from '../components/Footer';


const Layout = () => {
  const [searchToggle, setSearchToggle] = useState(false);
  const { toggle, showDetails, episodes, onClose, handleShow, loading1,loading2,related } = useContext(showContext);
  const handleClose = () => {
    setSearchToggle(false)
  }
  return (
    <>
      <Header setSearchToggle={setSearchToggle} />
      <Outlet />
      <Footer />
      {toggle && <Show show={showDetails} episodes={episodes} onClose={onClose} handleShow={handleShow} loading1={loading1} loading2={loading2} related={related} />}
      {searchToggle && <Search handleClose={handleClose} />}
    </>
  )
}

export default Layout