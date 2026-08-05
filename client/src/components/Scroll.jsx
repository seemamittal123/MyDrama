import { useContext, useRef, useState } from "react";
import ShowCard from "./ShowCard";
import loader from '../assets/loader.svg'
import { showContext } from '../context/ShowProvider';
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
const Scroll = ({ title, items = [], loading }) => {
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const navigate = useNavigate();
  const { handleShow } = useContext(showContext);
  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(updateEdges, 400);
  };

  return (
    <section className="scroll-row">
      <h2 className="scroll-row__title section-title" onClick={() => navigate(`/${title}`)}>{title}</h2>
      <div className="scroll-row__viewport">
        {!edge.start && (
          <button
            className="scroll-row__nav scroll-row__nav--prev"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
          >
            <MdKeyboardDoubleArrowLeft size={25} />
          </button>
        )}

        <div
          className="scroll-row__track"
          ref={trackRef}
          onScroll={updateEdges}
        >
          {
            loading ?
              <div className='slider-spinner'>
                < img src={loader} alt="" />
              </div> :
              items?.length == 0 ?
                <div className='empty'>
                  No {title}
                </div>
                :
                items?.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleShow(item._id)}
                  >

                    <ShowCard show={item} />
                  </div>
                ))}
        </div>

        {!edge.end && (
          <button
            className="scroll-row__nav scroll-row__nav--next"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
          >
            <MdKeyboardDoubleArrowRight size={25} />
          </button>
        )}
      </div>
    </section >
  );
}

export default Scroll;


