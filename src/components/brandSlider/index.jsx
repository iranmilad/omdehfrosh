import { ActionIcon, Center, Image, Paper, Title, Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconBuildingStore } from "@tabler/icons-react";
import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { FreeMode, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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

  const createBrandPlaceholder = (index, url) => {
    // Array of green-based gradient backgrounds for brands
    const brandGradients = [
      "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)", // Classic Green
      "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)", // Light Green
      "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)", // Medium Green
      "linear-gradient(135deg, #81C784 0%, #4CAF50 100%)", // Soft Green
      "linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)", // Pastel Green
      "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)", // Dark Green
      "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)", // Fresh Green
      "linear-gradient(135deg, #8BC34A 0%, #689F38 100%)", // Lime Green
    ];
    
    // Generate consistent gradient based on URL or index
    const urlHash = url ? url.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : index;
    
    const selectedGradient = brandGradients[Math.abs(urlHash) % brandGradients.length];
    
    return (
      <Box
        w="120px"
        h="80px"
        style={{
          background: selectedGradient,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "4px",
          position: "relative",
          overflow: "hidden",
          minHeight: "80px",
        }}
      >
        {/* Subtle pattern overlay */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='16' height='14' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='3' cy='13' r='1'/%3E%3Ccircle cx='13' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.6
          }}
        />
        
        {/* Store icon */}
        <IconBuildingStore 
          size={28} 
          color="rgba(255, 255, 255, 0.9)" 
          style={{ zIndex: 2 }} 
        />
      </Box>
    );
  };

  const renderBrandImage = (item, index) => {
    const hasValidImage = item.image && 
                         item.image !== null && 
                         item.image !== "" && 
                         item.image.trim() !== "" &&
                         !failedImages.has(index);

    if (!hasValidImage) {
      return createBrandPlaceholder(index, item.url);
    }

    return (
      <Image 
        w="100%" 
        h="100%" 
        fit="contain" 
        src={item.image} 
        alt={`برند ${index + 1}`}
        onError={() => handleImageError(index)}
        fallbackSrc="" // This will trigger onError if image fails
        style={{
          borderRadius: "8px",
          backgroundColor: "#f8f9fa", // Light background for transparent images
        }}
      />
    );
  };

  // Early return if no items or invalid structure
  if (!items || !items.children || items.children.length === 0) {
    return (
      <Paper px={0} py="lg">
        <Center>
          <Text c="dimmed" size="lg">هیچ برندی یافت نشد</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper px={0} py="lg">
      <Center>
        <Title size="xl" fw="500">
          {items.title || 'برندها'}
        </Title>
      </Center>
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
        style={{ position: "relative", marginTop: "35px" }}
      >
        {shouldShowNavigation && !isBeginning && (
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
        {shouldShowNavigation && !isEnd && (
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
        {items.children.map((item, index) => (
          <SwiperSlide
            key={item.url || index}
            style={{
              padding: "25px",
              paddingRight: 0,
              width: "120px", // Fixed width instead of 100px for better consistency
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
            className="border-l"
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
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
  );
}

export default BrandSlider;