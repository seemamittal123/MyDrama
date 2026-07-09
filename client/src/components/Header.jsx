import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { FaRegUserCircle } from "react-icons/fa";
import axios from 'axios';
import { server_Url } from '../App';
import toast from 'react-hot-toast';
import { RxCross2, RxDotsVertical } from "react-icons/rx";
import { setUser } from '../redux/userSlice';
const Header = ({ setSearchToggle }) => {
  const { user } = useSelector(state => state.user);
  const [toggle, setToggle] = useState('')
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const { data } = await axios.get(`${server_Url}/api/auth/log-out`, { withCredentials: true });
      toast.success(data.message);
      dispatch(setUser(null))
    } catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div className="navbar">
      <div className="navbar__container">
        <div className="navbar__logo" onClick={() => navigate('/')}>
          <img src={logo} alt="" />
        </div>
        <ul type="none" className={toggle ? "navbar__list navbar__open" : "navbar__list"}>
          <li className="navbar__item">
            <Link to="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link to="/explore">Explore</Link>
          </li>
          {user && (
            <>
              {
                user?.role =="admin" &&
                <li className="navbar__item"><Link to="/admin" className="navbar__admin-link">Admin</Link>
                </li>
              }
              <li className="navbar__item"><Link to="/watch-list" className="navbar__admin-link">Watch list</Link>
              </li>
              <li className="navbar__item"><Link to="/history" className="navbar__admin-link">History</Link>
              </li>
            </>
          )}
          <li className="navbar__item">
            <button className="navbar__search-btn" onClick={() => setSearchToggle(true)}>
              <FaSearch />
              Search
            </button>
          </li>
          {user ? (
            <button className="navbar__logout-btn" onClick={handleLogOut}>Logout</button>
          ) : (
            <Link to="/auth" className="navbar__signin-btn">
              Sign-in
            </Link>
          )}
        </ul>

        <button onClick={() => setToggle(!toggle)} className='sm_btn'>
          {toggle ? <RxCross2 /> : <RxDotsVertical />}
        </button>
      </div>
    </div>
  )
}

export default Header

