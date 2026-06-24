import { ActionIcon, Center, Image, Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPackage } from "@tabler/icons-react";
import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMediaQuery } from "@mantine/hooks";
import ImageIcon from '../../resources/defaultImageIcon'; // Adjust path as needed
import "./style.css";

function BrandSlider({ items }) {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  // Calculate if we need navigation based on actual content width vs container
  const itemCount = items?.children?.length || 0;
  const shouldShowNavigation = itemCount > 1;

  useEffect(() => {
    // Reset states when items change
    if (itemCount <= 1) {
      setIsBeginning(true);
      setIsEnd(true);
    } else {
      setIsBeginning(true);
      setIsEnd(itemCount <= 4); // If 4 or fewer items, we might reach the end quickly
    }
  }, [itemCount]);

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

  const handleSwiper = (swiper) => {
    // Update states when swiper is initialized
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleImageError = (index) => {
    setFailedImages(prev => new Set([...prev, index]));
  };

  // Helper function to validate image source
  const isValidImageSource = (src) => {
    if (!src) return false;
    if (Array.isArray(src)) {
      if (src.length === 0) return false;
      const firstItem = src[0];
      if (!firstItem || typeof firstItem !== 'string' || firstItem.trim() === '') return false;
      if (!firstItem.startsWith('/') && !firstItem.startsWith('http')) return false;
      return true;
    }
    if (typeof src !== 'string') return false;
    if (src.trim() === '') return false;
    if (!src.startsWith('/') && !src.startsWith('http')) return false;
    return true;
  };

  // Get valid image source
  const getValidImageSource = (src) => {
    if (!src) return null;
    if (Array.isArray(src)) {
      if (src.length === 0) return null;
      const firstItem = src[0];
      if (!firstItem || typeof firstItem !== 'string' || firstItem.trim() === '') return null;
      if (!firstItem.startsWith('/') && !firstItem.startsWith('http')) return null;
      return firstItem;
    }
    if (typeof src !== 'string' || src.trim() === '') return null;
    if (!src.startsWith('/') && !src.startsWith('http')) return null;
    return src;
  };

  const brandWidth = "100%";
  const placeholderIconSize = isMobile ? 28 : 48;

  const renderBrandImage = (item, index) => {
    const imageSrc = getValidImageSource(item.image);
    const hasValidImage = isValidImageSource(item.image) && !failedImages.has(index);

  if (!hasValidImage) {
    return (
      <Box 
        w={brandWidth}
        h="100%"
        className="brand-slide-image"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageIcon size={placeholderIconSize} color="#9ca3af" />
      </Box>
    );
  }

  return (
    <Box w={brandWidth} h="100%" className="brand-slide-image">
      <Image
        w="100%"
        h="100%"
        fit="contain" 
        src={imageSrc}
        alt={`برند ${index + 1}`}
        onError={() => handleImageError(index)}
        fallback={
          <Box
            w="100%"
            h="100%"
            className="brand-slide-image"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon size={placeholderIconSize} color="#9ca3af" />
          </Box>
        }
      />
    </Box>
  );
};

  // Early return if no items or invalid structure
  if (!items || !items.children || items.children.length === 0) {
    return (
      <Box px={{ base: "md", md: 0 }}>
        <Center>
          <Text c="dimmed" size="lg">هیچ برندی یافت نشد</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box px={{ base: "md", md: 0 }}>
      <Text 
        size="md" 
        fw="600"
        mb="lg"
        style={{ color: 'rgb(9, 54, 114)' }}
      >
        {items.title || 'برندها'}
      </Text>

      <Box pos="relative">
        {shouldShowNavigation && !isBeginning && !isMobile && (
          <ActionIcon
            variant="white"
            radius={999}
            size="lg"
            onClick={handlePrev}
            className="brand-carousel-prev border border-solid border-slate-300"
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        )}
        {shouldShowNavigation && !isEnd && !isMobile && (
          <ActionIcon
            variant="white"
            radius={999}
            size="lg"
            onClick={handleNext}
            className="brand-carousel-next border border-solid border-slate-300"
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
        )}
        <Swiper
          ref={sliderRef}
          className="brand-slider-swiper"
          slidesPerView={2.5}
          spaceBetween={8}
          loop={false}
          modules={[Navigation]}
          onSliderMove={handleSlideChange}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiper}
          breakpoints={{
            577: {
              slidesPerView: "auto",
              spaceBetween: 25,
            },
          }}
          style={{ marginTop: "0px", width: "100%" }}
        >
          {items.children.map((item, index) => (
            <SwiperSlide
              key={`brand-${index}-${item.url ?? item.name ?? item.id ?? ''}`}
              className="brand-slide"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                height: "auto",
              }}
            >
              {item.url ? (
                <NavLink 
                  to={`/brands/${item.url}`} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    textDecoration: "none",
                    borderRadius: "8px",
                    transition: "transform 0.3s ease",
                  }}
                  className="hover:scale-105"
                >
                  {renderBrandImage(item, index)}
                </NavLink>
              ) : (
                <Box 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    cursor: "default"
                  }}
                >
                  {renderBrandImage(item, index)}
                </Box>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}

export default BrandSlider;