import { ActionIcon, Anchor, Box, Container, Image } from "@mantine/core";
import React, { useRef, useState } from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import Swiper styles
import { Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight, IconPhoto } from "@tabler/icons-react";
import "./style.css";

// Default placeholder component
const DefaultSlideImage = ({ index }) => (
  <div
    style={{
      width: "100%",
      height: "200px",
      backgroundColor: "#f8f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px dashed #dee2e6",
      borderRadius: "8px",
      transform: "scale(0.9)",
      transition: "transform 0.3s ease"
    }}
  >
    <div style={{ textAlign: "center", color: "#868e96" }}>
      <IconPhoto size={48} style={{ marginBottom: "8px" }} />
    </div>
  </div>
);

// Component to handle individual slide image with error handling
const SlideImage = ({ item, index }) => {

  const [imageErrors, setImageErrors] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
    fallback: false // Add fallback error tracking
  });

  // Check if image path is invalid
  const isInvalidImage = (imagePath) => {
    return !imagePath || 
           imagePath === "" || 
           imagePath === null || 
           imagePath === undefined ||
           (Array.isArray(imagePath) && (imagePath.length === 0 || imagePath[0] === ""));
  };

  // Check if all images are invalid
  const allImagesInvalid = isInvalidImage(item.mobileImage) && 
                          isInvalidImage(item.tabletImage) && 
                          isInvalidImage(item.desktopImage);

  // Check if all images have errors or are invalid
  const shouldShowDefault = allImagesInvalid || 
                           (imageErrors.mobile && imageErrors.tablet && imageErrors.desktop) ||
                           imageErrors.fallback; // Include fallback error

  const handleImageError = (imageType) => {
    setImageErrors(prev => ({
      ...prev,
      [imageType]: true
    }));
  };

  // Determine the best available image for fallback
  const getFallbackImage = () => {
    if (!isInvalidImage(item.desktopImage)) return item.desktopImage;
    if (!isInvalidImage(item.tabletImage)) return item.tabletImage;
    if (!isInvalidImage(item.mobileImage)) return item.mobileImage;
    return null;
  };

  if (shouldShowDefault) {
    return <DefaultSlideImage index={index} />;
  }

  const fallbackImage = getFallbackImage();

  return (
    <picture>
      {/* Mobile image */}
      {!isInvalidImage(item.mobileImage) && !imageErrors.mobile && (
        <source
          media="(max-width: 600px)"
          srcSet={`${item.mobileImage} 480w`}
          onError={() => handleImageError('mobile')}
        />
      )}
      
      {/* Tablet image */}
      {!isInvalidImage(item.tabletImage) && !imageErrors.tablet && (
        <source
          media="(max-width: 900px)"
          srcSet={`${item.tabletImage} 800w`}
          onError={() => handleImageError('tablet')}
        />
      )}
      
      {/* Desktop image */}
      {!isInvalidImage(item.desktopImage) && !imageErrors.desktop && (
        <source
          media="(min-width: 901px)"
          srcSet={`${item.desktopImage} 1200w`}
          onError={() => handleImageError('desktop')}
        />
      )}
      
      {/* Fallback image */}
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={`Slide ${index + 1}`}
          className="wide-slide-image"
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            transform: "scale(0.9)",
            transition: "transform 0.3s ease"
          }}
          onError={() => handleImageError('fallback')}
          // onLoad={() => console.log(`Image loaded successfully: ${fallbackImage}`)}
        />
      )}
    </picture>
  );
};

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

  // Filter out items that don't have valid URLs
  const validItems = items?.filter(item => item && item.url) || [];

  if (validItems.length === 0) {
    return (
      <Container fluid>
        <Box w="100%" style={{ textAlign: "center", padding: "40px", color: "#868e96" }}>
          <IconPhoto size={64} style={{ marginBottom: "16px" }} />
          <div>هیچ اسلایدی برای نمایش وجود ندارد</div>
        </Box>
      </Container>
    );
  }

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
          modules={[Navigation]}
          loop={validItems.length > 1} // Only enable loop if there's more than one slide
          spaceBetween={10}
        >
          {validItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Anchor
                h="auto"
                underline="never"
                component={NavLink}
                to={item.url}
              >
                <SlideImage item={item} index={index} />
              </Anchor>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Container>
  );
}

export default WideSlider;