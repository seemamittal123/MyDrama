import ShowCard from './ShowCard';
import { useNavigate } from 'react-router-dom';
import loader from '../assets/loader.svg';
const Slider = ({ data = [], heading, handleShow, loading }) => {

  const naviagte = useNavigate();
  const goToShow = (e, showId) => {
    e.stopPropagation();
    handleShow(showId);
  }

  return (
    <>
      <h2 className="section-title">{heading}</h2>
      {loading ?
        <div className='slider-spinner'>
          <img src={loader} alt="" />
        </div> :
        data?.length == 0 ?
          <div className='empty'>
            No {heading}
          </div>
          :
          <div className="slider-section">
            {data?.map((item, index) => (
              <div className="show-card-slide" key={item?.id || item?.title || index} onClick={(e) => goToShow(e, item._id)}>
                <ShowCard show={item} />
              </div>
            ))}
          </div>
      }
    </>
  );
};

export default Slider;


