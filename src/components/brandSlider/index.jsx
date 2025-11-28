import { ActionIcon, Center, Image, Paper, Title, Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPackage } from "@tabler/icons-react";
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

  const createBrandPlaceholder = (url) => {
    // Array of gray and blue gradient backgrounds
    const brandGradients = [
      "linear-gradient(135deg, #607D8B 0%, #37474F 100%)", // Blue Gray
      "linear-gradient(135deg, #546E7A 0%, #263238 100%)", // Dark Blue Gray
      "linear-gradient(135deg, #78909C 0%, #455A64 100%)", // Light Blue Gray
      "linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)", // Blue
      "linear-gradient(135deg, #42A5F5 0%, #1565C0 100%)", // Light Blue
      "linear-gradient(135deg, #5C6BC0 0%, #283593 100%)", // Indigo
      "linear-gradient(135deg, #757575 0%, #424242 100%)", // Gray
      "linear-gradient(135deg, #90A4AE 0%, #546E7A 100%)", // Soft Blue Gray
    ];
    
    // Generate consistent gradient based on URL
    const urlHash = url ? url.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : 0;
    
    const selectedGradient = brandGradients[Math.abs(urlHash) % brandGradients.length];
    
    return (
      <Box
        w="100%"
        h="100%"
        style={{
          background: selectedGradient,
          borderRadius: "8px",
          border: "1px solid rgba(1, 1, 1, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle pattern overlay matching ProductBox */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        {/* Package icon matching ProductBox */}
        <IconPackage 
          size={32} 
          color="rgba(255, 255, 255, 0.8)" 
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
      return (
        <Box w="120px" h="80px">
          {createBrandPlaceholder(item.url)}
        </Box>
      );
    }

    return (
      <Box w="120px" h="80px">
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
            border: "1px solid rgba(1, 1, 1, 0.5)",
            backgroundColor: "#f8f9fa", // Light background matching ProductBox
          }}
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
      <Paper px={0} py="lg">
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
          style={{ position: "relative", marginTop: "0px" }}
        >
          {shouldShowNavigation && !isBeginning && (
            <ActionIcon
              variant="white"
              radius={999}
              size="lg"
              onClick={handlePrev}
              className="product-highlight-card-carousel-prev border border-solid border-slate-300"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
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
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
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
                width: "120px",
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