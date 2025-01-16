import { ActionIcon, Box, Flex, Image, Text } from '@mantine/core';
import FeaturedPromos from "../../assets/FeaturedPromos.svg";
import BoxImage from "../../assets/box.webp";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode,Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import ProductBox from '../productBox';
import { useRef, useState } from 'react';
import "./style.css";

function BadgedSlider({ items }) {
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Handler functions for custom navigation
  const handlePrev = () => {
    console.log(sliderRef)
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
    <Box p="sm" className='bg-red-500' style={{ borderRadius: "15px" }} pos="relative">
      {!isBeginning && (
        <ActionIcon
          variant="white"
          radius={999}
          size="lg"
          onClick={handlePrev}
          className="badged-carousel-prev border border-solid border-slate-300"
          styles={{root: {transform: 'none'}}}
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
          className="badged-carousel-next border border-solid border-slate-300"
          styles={{root: {transform: 'none'}}}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
      )}
      <Swiper
      ref={sliderRef}
        slidesPerView="auto"
        spaceBetween={10}
        loop={false}
        modules={[FreeMode,Navigation]}
        freeMode={true}
        onSliderMove={handleSlideChange}
        onSlideChange={handleSlideChange}
      >
        <SwiperSlide className='badged-slider-left-right' >
          <Flex justify="center" align="center" gap="xl" w="100%" h="100%" direction="column">
            <Image w={70} src={FeaturedPromos} />
            <Image w={70} src={BoxImage} />
          </Flex>
        </SwiperSlide>
        {items.map((item, index) => (
          <SwiperSlide key={index} style={{ width: "250px", height: "auto" }}>
            <ProductBox {...item} />
          </SwiperSlide>
        ))}
        <SwiperSlide className='badged-slider-left-right'>
          <Flex justify="center" align="center" gap="md" w="100%" h="100%" direction="column">
            <Text c="white">مشاهده همه</Text>
            <ActionIcon size="lg" variant='white'>
              <IconChevronLeft />
            </ActionIcon>
          </Flex>
        </SwiperSlide>
      </Swiper>
    </Box>
  );
}

export default BadgedSlider;