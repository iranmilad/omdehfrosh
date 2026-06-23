import { Anchor, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight, IconPhoto } from "@tabler/icons-react";
import "./style.css";

const DefaultSlideImage = ({ index }) => (
  <div
    style={{
      width: "100%",
      height: "250px",
      minHeight: "250px",
      backgroundColor: "#f8f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px dashed #dee2e6",
      borderRadius: "0",
      transition: "transform 0.3s ease",
    }}
  >
    <div style={{ textAlign: "center", color: "#868e96" }}>
      <IconPhoto size={48} style={{ marginBottom: "8px" }} />
    </div>
  </div>
);

const SlideImage = ({ item, index }) => {
  const [imageErrors, setImageErrors] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
    fallback: false,
  });

  const isInvalidImage = (imagePath) => {
    return (
      !imagePath ||
      imagePath === "" ||
      imagePath === null ||
      imagePath === undefined ||
      (Array.isArray(imagePath) && (imagePath.length === 0 || imagePath[0] === ""))
    );
  };

  const allImagesInvalid =
    isInvalidImage(item.mobileImage) &&
    isInvalidImage(item.tabletImage) &&
    isInvalidImage(item.desktopImage);

  const shouldShowDefault =
    allImagesInvalid ||
    (imageErrors.mobile && imageErrors.tablet && imageErrors.desktop) ||
    imageErrors.fallback;

  const handleImageError = (imageType) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageType]: true,
    }));
  };

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
      {!isInvalidImage(item.mobileImage) && !imageErrors.mobile && (
        <source
          media="(max-width: 600px)"
          srcSet={`${item.mobileImage} 480w`}
          onError={() => handleImageError("mobile")}
        />
      )}

      {!isInvalidImage(item.tabletImage) && !imageErrors.tablet && (
        <source
          media="(max-width: 900px)"
          srcSet={`${item.tabletImage} 800w`}
          onError={() => handleImageError("tablet")}
        />
      )}

      {!isInvalidImage(item.desktopImage) && !imageErrors.desktop && (
        <source
          media="(min-width: 901px)"
          srcSet={`${item.desktopImage} 1200w`}
          onError={() => handleImageError("desktop")}
        />
      )}

      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={`Slide ${index + 1}`}
          className="wide-slide-image"
          onError={() => handleImageError("fallback")}
        />
      )}
    </picture>
  );
};

function WideSlider({ items }) {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const activeTouchesRef = useRef(0);
  const [touchArrowsVisible, setTouchArrowsVisible] = useState(false);
  const [hoverArrowsVisible, setHoverArrowsVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const validItems = items?.filter((item) => item && item.url) || [];
  const canLoop = validItems.length > 1;
  const arrowsVisible = hoverArrowsVisible || touchArrowsVisible;
  const arrowSize = isMobile ? 30 : 42;
  const arrowIconSize = isMobile ? 14 : 18;
  const arrowInset = isMobile ? 8 : 20;

  const arrowButtonStyle = useMemo(
    () => (side) => ({
      position: "absolute",
      top: "50%",
      [side]: arrowInset,
      transform: "translateY(-50%)",
      zIndex: 100,
      width: arrowSize,
      height: arrowSize,
      borderRadius: "50%",
      border: "1px solid #e9ecef",
      backgroundColor: "#fff",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      opacity: arrowsVisible ? 1 : 0,
      visibility: arrowsVisible ? "visible" : "hidden",
      pointerEvents: arrowsVisible ? "auto" : "none",
      transition: "opacity 0.2s ease, visibility 0.2s ease",
    }),
    [arrowsVisible, arrowSize, arrowInset]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      activeTouchesRef.current += 1;
      setTouchArrowsVisible(true);
    };

    const handleTouchEnd = (event) => {
      activeTouchesRef.current = Math.max(0, activeTouchesRef.current - 1);
      if (event.touches.length === 0) {
        activeTouchesRef.current = 0;
        setTouchArrowsVisible(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    container.addEventListener("touchend", handleTouchEnd, { capture: true, passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { capture: true, passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart, { capture: true });
      container.removeEventListener("touchend", handleTouchEnd, { capture: true });
      container.removeEventListener("touchcancel", handleTouchEnd, { capture: true });
    };
  }, []);

  const handlePrev = () => {
    sliderRef.current?.swiper?.slidePrev();
  };

  const handleNext = () => {
    sliderRef.current?.swiper?.slideNext();
  };

  const showHoverArrows = () => {
    if (activeTouchesRef.current > 0) return;
    setHoverArrowsVisible(true);
  };

  const hideHoverArrows = (event) => {
    if (activeTouchesRef.current > 0) return;
    if (event?.pointerType && event.pointerType !== "mouse") return;

    const related = event?.relatedTarget;
    if (related instanceof Node && containerRef.current?.contains(related)) {
      return;
    }
    setHoverArrowsVisible(false);
  };

  if (validItems.length === 0) {
    return (
      <Box
        w="100%"
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#868e96",
          height: "250px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconPhoto size={64} style={{ marginBottom: "16px" }} />
        <div>هیچ اسلایدی برای نمایش وجود ندارد</div>
      </Box>
    );
  }

  return (
    <div
      ref={containerRef}
      className="wide-slider"
      onMouseEnter={showHoverArrows}
      onMouseLeave={hideHoverArrows}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") hideHoverArrows(event);
      }}
    >
      <Swiper
        className="wide-slider-swiper"
        style={{ width: "100%" }}
        ref={sliderRef}
        modules={[Navigation]}
        loop={canLoop}
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

      <button
        type="button"
        onClick={handlePrev}
        onMouseLeave={hideHoverArrows}
        style={arrowButtonStyle("right")}
        aria-label="اسلاید قبلی"
      >
        <IconChevronRight size={arrowIconSize} />
      </button>
      <button
        type="button"
        onClick={handleNext}
        onMouseLeave={hideHoverArrows}
        style={arrowButtonStyle("left")}
        aria-label="اسلاید بعدی"
      >
        <IconChevronLeft size={arrowIconSize} />
      </button>
    </div>
  );
}

export default WideSlider;
