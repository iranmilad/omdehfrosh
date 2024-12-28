import React, { useState , useRef,useCallback} from "react";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import "./style.css"
import { ActionIcon, Image } from "@mantine/core";
import ReactImageZoom from "react-image-zoom";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";


const Slider = (props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const sliderRef = useRef(null);
  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);
  return (
    <div className="w-full">
      <div className="relative">
      <Swiper ref={sliderRef} spaceBetween={10} navigation={false} thumbs={{swiper: thumbsSwiper}} modules={[FreeMode, Thumbs]}>
        {props.slides.map((item,index) => (
          <SwiperSlide key={index} >
            <ReactImageZoom zoomPosition="original" width={450} height={365} zoomWidth={500} img={item.src} />
          </SwiperSlide>
        ))}
      </Swiper>

      </div>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="imagesPreview"
      >
        {props.slides.map((item,index) => (
          <SwiperSlide key={index}>
            <img src={item.src} />
          </SwiperSlide>
        ))}

      </Swiper>
    </div>
  )
};

export default Slider;
