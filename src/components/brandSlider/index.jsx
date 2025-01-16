import { ActionIcon, Center, Image, Paper, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import { NavLink } from "react-router";
import { FreeMode, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function BrandSlider({ items }) {
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(items && items.length > 3 ? false : true);

  // Handler functions for custom navigation
  const handlePrev = () => {
    if (sliderRef.current && sliderRef.current.swiper) {
      sliderRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (sliderRef.current && sliderRef.current.swiper) {
      sliderRef.current.swiper.slideNext();
    }
  };

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };
  return (
    <Paper px={0} py="lg">
      <Center>
        <Title size="xl" fw="500">
          {items.title}
        </Title>
      </Center>
      <Swiper
        ref={sliderRef}
        slidesPerView="auto"
        spaceBetween={30}
        modules={[Navigation]}
        onSliderMove={handleSlideChange}
        onSlideChange={handleSlideChange}
        style={{ position: "relative",marginTop: "35px" }}
      >
        {!isBeginning && (
          <ActionIcon
            variant="white"
            radius={999}
            size="lg"
            onClick={handlePrev}
            className="product-highlight-card-carousel-prev border border-solid border-slate-300"
            styles={{ root: { transform: "none" } }}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        )}
        {!isEnd && (
          <ActionIcon
            variant="white"
            radius={999}
            size="lg"
            onClick={handleNext}
            className="product-highlight-card-carousel-next border border-solid border-slate-300"
            styles={{ root: { transform: "none" } }}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
        )}
        {items &&
          items.children.map((item, index) => (
            <SwiperSlide
              key={index}
              style={{ padding: "25px", width: "142px", height: "142px" }}
              className={index !== items.children.length -1 ? "border-l border-slate-200" : ""}
            >
              <NavLink to={item.url}>
                <Image w="100%" h="100%" fit="contain" src={item.image} alt={`برند ${index}`} />
              </NavLink>
            </SwiperSlide>
          ))}
      </Swiper>
    </Paper>
  );
}

export default BrandSlider;
