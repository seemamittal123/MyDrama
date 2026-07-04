import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import { useSelector } from 'react-redux';

const TopSlider = () => {
  const { popular, allShows } = useSelector(state => state.show)
  return (
    <div className="swipper-wrapper">
      <Swiper modules={[EffectFade]} effect="fade">
        {allShows.map((i, el) => (
          <SwiperSlide>
            <div className="banner_image">
              <img src={i.banner_url} alt={i.title} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default TopSlider;