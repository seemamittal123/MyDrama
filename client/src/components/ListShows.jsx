import { useState, useContext, useEffect } from "react";
import ShowCard from "./ShowCard";
import { showContext } from "../context/ShowProvider";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { server_Url } from "../App";
import loader from '../assets/loader.svg'

const apiPaths = {
  latest: "/api/shows/latest-show",
  tranding: "/api/shows/tranding-show",
  popular: "/api/shows/popular-show",
  korean: "/api/shows/filter/shows?q=korean",
  chinese: "/api/shows/filter/shows?q=chinese",
  anime: "/api/shows/filter/shows?q=anime",
  upcoming: "/api/shows/filter/shows?q=upcoming",
};

const ListShows = () => {
  const { heading } = useParams();
  const { handleShow } = useContext(showContext);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShows = async () => {
    const filterKey = heading?.replace(/-show$|-drama$/, "") || "";
    const path = apiPaths[filterKey];

    if (!path) {
      setShows([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${server_Url}${path}`, { withCredentials: true });
      setShows(data.shows || []);
    } catch (error) {
      console.log("error:", error.response || error.message);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!heading) return;
    fetchShows();
  }, [heading]);

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
                shows?.map((item) => {
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