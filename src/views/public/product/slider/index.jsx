import React, { useState, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import "./style.css"
import { ActionIcon, Image, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPhoto } from "@tabler/icons-react";

const Slider = (props) => {
  
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoaded, setImageLoaded] = useState({});
  const sliderRef = useRef(null);

  // Default image - you can replace this with your own default image path
  const defaultImage = "/uploads/default-product.jpg";
  
  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  const handleImageError = useCallback((imageIndex, src) => {
    setImageErrors(prev => ({ ...prev, [imageIndex]: true }));
  }, []);

  const handleImageLoad = useCallback((imageIndex, src) => {
    setImageLoaded(prev => ({ ...prev, [imageIndex]: true }));
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[imageIndex];
      return newErrors;
    });
  }, []);

  // Function to get full image path
  const getImagePath = (imagePath) => {
    if (imagePath && imagePath.startsWith('/')) {
      return imagePath;
    }
    return imagePath || defaultImage;
  };

  // Check if slides are empty or null
  const hasValidSlides = props.slides && Array.isArray(props.slides) && props.slides.length > 0;
  
  // Filter out null, undefined, and empty string values from slides
  const validSlides = hasValidSlides ? props.slides.filter(slide => 
    slide !== null && 
    slide !== undefined && 
    slide !== '' && 
    typeof slide === 'string' && 
    slide.trim() !== ''
  ) : [];
  
  // Check if we have any valid slides after filtering
  const hasAnyValidSlides = validSlides.length > 0;
  
  // Check if all images have failed to load (only count valid slides)
  const allImagesFailed = hasAnyValidSlides && 
    validSlides.every((_, slideIndex) => {
      const originalIndex = props.slides.findIndex(slide => slide === validSlides[slideIndex]);
      return imageErrors[originalIndex];
    }) && 
    Object.keys(imageErrors).length >= validSlides.length;

  // If no valid slides OR all images failed, show default image
  const shouldShowDefault = !hasAnyValidSlides || allImagesFailed;
  const slidesToShow = shouldShowDefault ? [defaultImage] : validSlides;

  // Default image component with Digikala-style design
  const DefaultImageSlide = () => (
    <div 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        flexDirection: 'column',
        // gap: '12px',
        // padding: '20px'
      }}
    >
      <IconPhoto size={48} color="#c5c5c5" strokeWidth={1.5} />
      <Text size="sm" style={{ color: '#a1a3a8', fontWeight: 400 }}>تصویری وجود ندارد</Text>
    </div>
  );

  // Render main slides with Digikala-style
  const renderMainSlides = () => {
    if (shouldShowDefault) {
      return (
        <SwiperSlide key="default-slide">
          <DefaultImageSlide />
        </SwiperSlide>
      );
    }

    return slidesToShow.map((item, slideIndex) => {
      // Find the original index in props.slides for error tracking
      const originalIndex = props.slides ? props.slides.findIndex(slide => slide === item) : slideIndex;
      
      return (
        <SwiperSlide key={`slide-${originalIndex}-${slideIndex}`}>
          {imageErrors[originalIndex] ? (
            // Individual image failed - show placeholder with Digikala-style
            <div 
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                flexDirection: 'column',
                // gap: '8px',
                // padding: '20px'
              }}
            >
              <IconPhoto size={40} color="#c5c5c5" strokeWidth={1.5} />
              <Text size="xs" style={{ color: '#ef4056' }}>تصویر یافت نشد</Text>
            </div>
          ) : (
            <picture style={{ width: '100%', height: '100%', display: 'block', lineHeight: 0 }}>
              <img
                src={getImagePath(item)}
                alt={`Product image ${slideIndex + 1}`}
                onError={() => handleImageError(originalIndex, item)}
                onLoad={() => handleImageLoad(originalIndex, item)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}
              />
            </picture>
          )}
        </SwiperSlide>
      );
    });
  };

  // Render thumbnails with Digikala-style
  const renderThumbnails = () => {
    return validSlides.map((item, thumbIndex) => {
      const originalIndex = props.slides.findIndex(slide => slide === item);
      return (
        <SwiperSlide key={`thumb-${originalIndex}-${thumbIndex}`}>
          <div style={{ 
            cursor: 'pointer', 
            border: '1px solid #e0e0e6', 
            borderRadius: '8px', 
            overflow: 'hidden',
            transition: 'border-color 0.2s ease',
            backgroundColor: '#ffffff',
            height: '88px',
            lineHeight: 0
          }}
          className="thumbnail-slide"
          >
            {imageErrors[originalIndex] ? (
              <div 
                style={{
                  width: '100%',
                  height: '88px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <IconPhoto size={24} color="#c5c5c5" strokeWidth={1.5} />
              </div>
            ) : (
              <picture style={{ width: '100%', height: '88px', display: 'block', lineHeight: 0 }}>
                <img 
                  src={getImagePath(item)}
                  alt={`Thumbnail ${thumbIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '88px',
                    objectFit: 'contain',
                    display: 'inline-block',
                    backgroundColor: '#ffffff'
                  }}
                  onError={() => handleImageError(originalIndex, item)}
                />
              </picture>
            )}
          </div>
        </SwiperSlide>
      );
    });
  };

  return (
    <div className="w-full" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
      <div className="relative" style={{ 
        // padding: '16px 16px 0 16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px 8px 0 0'
      }}>
        {/* Only show navigation if there are multiple slides */}
        {slidesToShow.length > 1 && (
          <>
            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: '#ffffff',
                color: '#3f4064',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                border: '1px solid #e0e0e6'
              }}
              className="slider-nav-btn"
            >
              <IconChevronLeft size={20} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: '#ffffff',
                color: '#3f4064',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                border: '1px solid #e0e0e6'
              }}
              className="slider-nav-btn"
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </>
        )}

        <Swiper 
          ref={sliderRef} 
          spaceBetween={10} 
          navigation={false} 
          thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}} 
          modules={[FreeMode, Thumbs, Navigation]}
          allowTouchMove={slidesToShow.length > 1}
          style={{ 
            height: '450px',
            borderRadius: '8px'
          }}
        >
          {renderMainSlides()}
        </Swiper>
      </div>

      {/* Only show thumbnails if there are valid slides and more than 1 image and not all failed */}
      {hasAnyValidSlides && validSlides.length > 1 && !shouldShowDefault && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="imagesPreview"
          style={{ 
            // marginTop: '12px',
            // padding: '0 16px 16px 16px',
            backgroundColor: '#ffffff',
            borderRadius: '0 0 8px 8px'
          }}
        >
          {renderThumbnails()}
        </Swiper>
      )}

      <style jsx>{`
        .slider-nav-btn:hover {
          background-color: #f5f5f5 !important;
        }
        
        .thumbnail-slide:hover {
          border-color: #19bfd3 !important;
        }
        
        .swiper-slide-thumb-active .thumbnail-slide {
          border-color: #ef394e !important;
          border-width: 2px !important;
        }
      `}</style>
    </div>
  );
};

export default Slider;