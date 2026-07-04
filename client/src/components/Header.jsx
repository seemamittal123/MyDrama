import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { FaRegUserCircle } from "react-icons/fa";
import axios from 'axios';
import { server_Url } from '../App';
import toast from 'react-hot-toast';
const Header = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const { data } = await axios.get(`${server_Url}/api/auth/log-out`, { withCredentials: true });
      toast.success(data.message);
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
        <ul type="none" className="navbar__list">
          <li className="navbar__item">
            <Link to="/">Home</Link>
          </li>
          <li className="navbar__item">
            <Link to="/explore">Explore</Link>
          </li>
          {user?.role === "admin" && (
            <Link to="/admin" className="navbar__admin-link">Admin</Link>
          )}
          <li className="navbar__item">
            <button className="navbar__search-btn">
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
      </div>
    </div>
  )
}

export default Header

