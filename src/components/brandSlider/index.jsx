import { Center, Image, Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import { NavLink } from "react-router";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMediaQuery } from "@mantine/hooks";
import ImageIcon from '../../resources/defaultImageIcon'; // Adjust path as needed
import "./style.css";

function BrandSlider({ items, title }) {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  // Calculate if we need navigation based on actual content width vs container
  const itemCount = items?.children?.length || 0;
  const shouldShowNavigation = itemCount > 1;
  const [isScrollable, setIsScrollable] = useState(false);

  const updateNavigation = (swiper) => {
    if (!swiper) return;
    const scrollable =
      swiper.slides.length > 1 &&
      (!swiper.isLocked || swiper.snapGrid.length > 1);
    setIsScrollable(scrollable);
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
      <Center>
        <Text c="dimmed" size="lg">هیچ برندی یافت نشد</Text>
      </Center>
    );
  }

  return (
    <>
      {title?.trim() && (
        <Text
          size="md"
          fw="600"
          mb="md"
          style={{ color: "rgb(9, 54, 114)" }}
        >
          {title}
        </Text>
      )}

      <Box pos="relative" className="brand-slider-wrap">
        {shouldShowNavigation && isScrollable && (
          <Box
            component="button"
            type="button"
            onClick={() => sliderRef.current?.swiper?.slidePrev()}
            className="brand-carousel-prev"
            aria-label="اسلاید قبلی"
            disabled={isBeginning}
            data-disabled={isBeginning || undefined}
          >
            <IconChevronRight size={16} />
          </Box>
        )}
        {shouldShowNavigation && isScrollable && (
          <Box
            component="button"
            type="button"
            onClick={() => sliderRef.current?.swiper?.slideNext()}
            className="brand-carousel-next"
            aria-label="اسلاید بعدی"
            disabled={isEnd}
            data-disabled={isEnd || undefined}
          >
            <IconChevronLeft size={16} />
          </Box>
        )}
        <Swiper
          ref={sliderRef}
          className="brand-slider-swiper"
          slidesPerView="auto"
          spaceBetween={4}
          loop={false}
          modules={[Navigation]}
          watchOverflow
          observer
          observeParents
          onSlideChange={updateNavigation}
          onInit={(swiper) => {
            updateNavigation(swiper);
            requestAnimationFrame(() => updateNavigation(swiper));
          }}
          onResize={updateNavigation}
          style={{ width: "100%" }}
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
                  to={item.url}
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
    </>
  );
}

export default BrandSlider;