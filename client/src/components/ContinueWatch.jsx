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
const ContinueWatch = () => {
  const { handleShow } = useContext(showContext);
  const { continueWatch, user } = useSelector(state => state.user)
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="empty">You need to sign In</div>
    )
  }

  return (
    <section className="inner-section">
      <div className="explore-wrapper container">
        <h1 className="continue-watching__title">Continue Watching</h1>
        {
          continueWatch.length == 0 ?
            <div className="empty">No Shows</div>
            :
            <div className="shows-wrapper">
              {continueWatch.map((item) => {
                return (
                  <div onClick={() => handleShow(item.show_id._id)} key={item._id}>
                    <ShowCard show={item.show_id} key={item._id} />
                  </div>
                )
              })}
            </div>
        }
      </div>
    </section>
  );
}
export default ContinueWatch;