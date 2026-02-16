import { ActionIcon, Box, Flex, Group, Image, Text } from '@mantine/core';
import FeaturedPromos from "../../assets/FeaturedPromos.svg";
import BoxImage from "../../assets/box.webp";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import ProductBox from '../productBox';
import { useRef, useState } from 'react';
import "./style.css";
import { NavLink } from 'react-router';

function BadgedSlider({ items = [], checkalllink = "/incredible-offers", backgroundColor = "linear-gradient(to bottom left, #1e3a5f, #0a1628)" }) {


  
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

  // Handle empty items array - don't render anything
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box 
      p="sm" 
      style={{ 
        borderRadius: "15px",
        background: backgroundColor
      }} 
      pos="relative"
    >
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
        modules={[FreeMode, Navigation]}
        freeMode={true}
        onSliderMove={handleSlideChange}
        onSlideChange={handleSlideChange}
      >
        <SwiperSlide className='badged-slider-left-right'>
          <Flex justify="center" align="center" gap="xl" w="100%" h="100%" direction="column">
            <Image w={70} src={FeaturedPromos} />
            <Image w={70} src={BoxImage} />
          </Flex>
        </SwiperSlide>
        {items.map((item, index) => (
          <SwiperSlide key={index} style={{ width: "250px", height: "auto" }}>
            <ProductBox 
              {...item}
              compact
              defaultSellerId={item.sellerId || item.seller?.id}
              defaultCombinationId={item.combinationId || item.combinations?.[0]?.id}
              stock={item.stock}
              minOrder={item.minOrder}
              maxOrder={item.maxOrder}
            />
          </SwiperSlide>
        ))}
        <SwiperSlide className='badged-slider-left-right'>
          <Flex justify="center" align="center" gap="md" w="100%" h="100%" direction="column">
            <Group gap="xs" align="center">
              <Text c="white" component={NavLink} to={checkalllink}>مشاهده همه</Text>
              <ActionIcon size="lg" variant="white" component={NavLink} to={checkalllink}>
              <IconChevronLeft />
              </ActionIcon>
            </Group>
          </Flex>
        </SwiperSlide>
      </Swiper>
    </Box>
  );
}

BadgedSlider.craft = {
  props: {
    title: "دسته بندی ها",
    title_align: "center",
    items: [],
  },
}

export default BadgedSlider;