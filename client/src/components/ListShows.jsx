import { useState, useContext, useEffect } from "react";
import ShowCard from "./ShowCard";
import { showContext } from "../context/ShowProvider";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { server_Url } from "../App";
import ShowCardSkeleton from "./ShowCardSkeleton";

const apiPaths = {
  latest: "/api/shows/latest-show",
  tranding: "/api/shows/tranding-show",
  popular: "/api/shows/popular-show",
  korean: "/api/shows/filter/shows?q=korean",
  chinese: "/api/shows/filter/shows?q=chinese",
  anime: "/api/shows/filter/shows?q=anime",
  united: "/api/shows/filter/shows?q=US",
  movies: "/api/shows/filter/shows?q=movie",
  upcoming: "/api/shows/filter/shows?q=upcoming",
};


const ListShows = () => {
  const { heading } = useParams();
  const { handleShow } = useContext(showContext);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchShows = async (pageNum) => {
    const filterKey = heading?.replace(/-show$|-drama$|-states$/, "") || "";
    const path = apiPaths[filterKey];

    if (!path) {
      setShows([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${server_Url}${path}`, {
        params: { page: pageNum, limit: 12 },
      }, { withCredentials: true });
      if (data.success) {
        setShows((prev) => [...prev, ...data.shows]);
        setHasMore(data.hasMore);
        console.log(data);

      }
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

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchShows(nextPage);
  };

  return (
    <section className="inner-section">
      <div className="explore-wrapper container">
        <h1 className="continue-watching__title">{heading}</h1>
        {
          loading ?
            <div className="shows-wrapper">
              {Array.from({ length: 20 }, (_, index) => <ShowCardSkeleton key={index} />)}
            </div>
            :
            shows.length == 0 ?
              <div className="empty">No Shows</div>
              :
              <div>
                <div className="shows-wrapper">
                  {shows?.map((item) => {
                    return (
                      <div onClick={() => handleShow(item._id)} key={item._id}>
                        <ShowCard show={item} key={item._id} />
                      </div>
                    )
                  })}
                </div>
                {hasMore && (
                  <button onClick={handleLoadMore} disabled={loading} className="more-btn">
                    <p> {loading ? <span> <img src={loader} /> Loading... </span> : "More"}</p>
                  </button>
                )}
              </div>
        }
      </div>
    </section>
  );
}
export default ListShows;