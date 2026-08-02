import { useState } from "react";
import ShowCard from "./ShowCard";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { showContext } from "../context/ShowProvider";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import axios from 'axios';
import { server_Url } from "../App";
import loader from '../assets/loader.svg'
const ListShows = () => {
  const { heading } = useParams();
  const { handleShow } = useContext(showContext);
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(false);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server_Url}/api/shows/${heading}`, { withCredentials: true });
      setShows(data.shows)
    } catch (error) {
      console.log("error:", error.response);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShows();
  }, [])

  return (
    <section className="inner-section">
      <div className="explore-wrapper container">
        <h1 className="continue-watching__title">{heading}</h1>
        <div className="shows-wrapper">
          {
            loading ?
              <div className="spinner2">
                <img src={loader} alt="" />
              </div>
              :
              shows.length == 0 ?
                <div className="empty">No Shows</div>
                :
                shows.map((item) => {
                  return (
                    <div onClick={() => handleShow(item._id)} key={item._id}>
                      <ShowCard show={item} key={item._id} />
                    </div>
                  )
                })
          }
        </div>
      </div>
    </section>
  );
}
export default ListShows;