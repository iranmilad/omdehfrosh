import { ActionIcon, Center, Image, Paper, Title, Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPackage } from "@tabler/icons-react";
import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { FreeMode, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ImageIcon from '../../resources/defaultImageIcon'; // Adjust path as needed
import "./style.css";

function BrandSlider({ items }) {
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  // Calculate if we need navigation based on actual content width vs container
  const itemCount = items?.children?.length || 0;
  const shouldShowNavigation = itemCount > 1; // Show navigation if more than 1 item
  const shouldLoop = itemCount > 4; // Only loop if we have more than 4 items

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

  const renderBrandImage = (item, index) => {
    const imageSrc = getValidImageSource(item.image);
    const hasValidImage = isValidImageSource(item.image) && !failedImages.has(index);

  if (!hasValidImage) {
    return (
      <Box 
        w="120px"
        h="80px"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
        }}
      >
        <ImageIcon size={48} color="#9ca3af" />
      </Box>
    );
  }

  return (
    <Box w="120px" h="80px">
      <Image
        w="100%"
        h="100%"
        fit="contain" 
        src={imageSrc}
        alt={`برند ${index + 1}`}
        onError={() => handleImageError(index)}
        style={{
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
        }}
        fallback={
          <Box
            w="120px"
            h="80px"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
            }}
          >
            <ImageIcon size={48} color="#9ca3af" />
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
      {/* Header outside white background */}
      <Text 
        size="md" 
        fw="600"
        mb="lg"
        style={{ color: 'rgb(9, 54, 114)' }}
      >
        {items.title || 'برندها'}
      </Text>

      {/* White Paper containing only the slider */}
      <Paper px={0} py="lg" pos="relative">
        {shouldShowNavigation && !isBeginning && (
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
        {shouldShowNavigation && !isEnd && (
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
          slidesPerView="auto"
          spaceBetween={30}
          loop={shouldLoop}
          modules={[Navigation]}
          onSliderMove={handleSlideChange}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiper}
          breakpoints={{
            // Responsive breakpoints
            320: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            480: {
              slidesPerView: 3,
              spaceBetween: 25,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          }}
          style={{ marginTop: "0px" }}
        >
          {items.children.map((item, index) => (
            <SwiperSlide
              key={`brand-${index}-${item.url ?? item.name ?? item.id ?? ''}`}
              style={{
                padding: "25px",
                paddingRight: 0,
                width: "120px",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
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
      </Paper>
    </Box>
  );
}

export default BrandSlider;