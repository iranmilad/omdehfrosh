import { ActionIcon, Anchor, Box, Container, Image } from "@mantine/core";
import React, { useRef } from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import Swiper styles
import { Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import "./style.css";

function WideSlider({ items }) {
  const sliderRef = useRef(null);
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
  return (
    <Container fluid>
      <Box w="100%" pos="relative">
        <ActionIcon
          variant="white"
          radius={999}
          size="lg"
          onClick={handlePrev}
          className="wide-carousel-prev"
          styles={{ root: { transform: "none" } }}
        >
          <IconChevronRight size={18} />
        </ActionIcon>
        <ActionIcon
          variant="white"
          radius={999}
          size="lg"
          onClick={handleNext}
          className="wide-carousel-next"
          styles={{ root: { transform: "none" } }}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Swiper
          style={{ width: "100%" }}
          ref={sliderRef}
          modules={[Navigation]} // Include Navigation module if needed
          loop={true}
          spaceBetween={10}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <Anchor
                h="auto"
                underline="never"
                component={NavLink}
                to={item.url}
              >
                <picture>
                  {/* JPEG/PNG برای دستگاه‌های موبایل */}
                  <source
                    media="(max-width: 600px)"
                    srcSet={`${item.mobileImage} 480w`}
                  />
                  {/* JPEG/PNG برای دستگاه‌های تبلت */}
                  <source
                    media="(max-width: 900px)"
                    srcSet={`${item.tabletImage} 800w`}
                  />
                  {/* JPEG/PNG برای دستگاه‌های دسکتاپ */}
                  <source
                    media="(min-width: 901px)"
                    srcSet={`${item.desktopImage} 1200w`}
                  />
                  {/* تصویر پیش‌فرض (JPEG/PNG) */}
                  <img
                    src={item.mobileImage}
                    alt={`Slide ${index + 1}`}
                    className="wide-slide-image"
                    style={{ width: "100%", height: "auto" }}
                  />
                </picture>
              </Anchor>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Container>
  );
}

export default WideSlider;
