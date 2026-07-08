import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
const TopSlider = ({ data, handleShow }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!data || data.length === 0) return null;

  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        loop={true}
        className="imgSection"
      >
        {
          
          data.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <div className="info-section">
                <h1 className="title">{item.title}</h1>
                <h3>{item.description}</h3>
                <div className="btn-wrapper">
                  <button className='play' onClick={() => handleShow(item._id)}>
                    <span>
                      <FaPlay />
                    </span>
                    Play
                  </button>
                  <button className='more-info' onClick={() => handleShow(item._id)}>
                    <span>
                      <IoInformationCircleOutline />
                    </span>
                    More Info
                  </button>
                </div>
              </div>
              <div className="banner_image">
                <img src={item.banner_url} alt={item.title} />
              </div>
            </SwiperSlide>
          ))
        }
      </Swiper>

      <button ref={prevRef} className="custom-prev-btn">
        <ChevronLeft size={24} />
      </button>

      <button ref={nextRef} className="custom-next-btn">
        <ChevronRight size={24} />
      </button>
    </>
  );
};

export default TopSlider;