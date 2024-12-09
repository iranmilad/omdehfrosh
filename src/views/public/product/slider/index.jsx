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
    <div className="w-[450px]">
      <div className="relative">
      <Swiper ref={sliderRef} spaceBetween={10} navigation={false} thumbs={{swiper: thumbsSwiper}} modules={[FreeMode, Thumbs]}>
        <SwiperSlide >
          <ReactImageZoom zoomPosition="original" width={450} height={365} zoomWidth={500} img="https://cfarhad.ir/wp-content/uploads/2024/07/1707890770-hXIGlhO91BjL9Y4p.webp" />
        </SwiperSlide>
        <SwiperSlide >
          <ReactImageZoom zoomPosition="original" width={450} height={365} zoomWidth={500} img="https://cfarhad.ir/wp-content/uploads/2024/07/1707890770-hXIGlhO91BjL9Y4p.webp" />
        </SwiperSlide>
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
        <SwiperSlide>
          <img src="https://cfarhad.ir/wp-content/uploads/2024/07/1707890770-hXIGlhO91BjL9Y4p.webp" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://cfarhad.ir/wp-content/uploads/2024/07/1707890770-hXIGlhO91BjL9Y4p.webp" />
        </SwiperSlide>
      </Swiper>
    </div>
  )
};

export default Slider;
