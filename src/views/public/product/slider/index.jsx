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
import ReactImageZoom from "react-image-zoom";
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

  // Default image component
  const DefaultImageSlide = () => (
    <div 
      style={{
        width: '100%',
        height: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <IconPhoto size={64} color="#adb5bd" />
      <Text size="lg" color="gray" weight={500}>تصویری وجود ندارد</Text>
      <Text size="sm" color="gray">تصویر محصول در اینجا نمایش داده می‌شود</Text>
    </div>
  );

  // Render main slides
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
            // Individual image failed - show placeholder for this specific image
            <div 
              style={{
                width: '100%',
                height: '450px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <IconPhoto size={48} color="#adb5bd" />
              <Text size="sm" color="red">تصویر یافت نشد</Text>
              <Text size="xs" color="gray" style={{ wordBreak: 'break-all', textAlign: 'center', maxWidth: '300px' }}>
                {item}
              </Text>
              <Text size="xs" color="gray" style={{ textAlign: 'center' }}>
                فایل تصویر در این مسیر وجود ندارد
              </Text>
            </div>
          ) : (
            <img
              src={getImagePath(item)}
              alt={`Product image ${slideIndex + 1}`}
              onError={() => handleImageError(originalIndex, item)}
              onLoad={() => handleImageLoad(originalIndex, item)}
              style={{
                width: '100%',
                height: '450px',
                objectFit: 'contain',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}
            />
          )}
        </SwiperSlide>
      );
    });
  };

  // Render thumbnails
  const renderThumbnails = () => {
    return validSlides.map((item, thumbIndex) => {
      const originalIndex = props.slides.findIndex(slide => slide === item);
      return (
        <SwiperSlide key={`thumb-${originalIndex}-${thumbIndex}`}>
          <div style={{ 
            cursor: 'pointer', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            overflow: 'hidden',
            transition: 'border-color 0.2s ease'
          }}>
            {imageErrors[originalIndex] ? (
              <div 
                style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  fontSize: '12px',
                  color: '#999'
                }}
              >
                <IconPhoto size={24} />
              </div>
            ) : (
              <img 
                src={getImagePath(item)}
                alt={`Thumbnail ${thumbIndex + 1}`}
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover'
                }}
                onError={() => handleImageError(originalIndex, item)}
              />
            )}
          </div>
        </SwiperSlide>
      );
    });
  };

  return (
    <div className="w-full">
      <div className="relative">
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
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white'
              }}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white'
              }}
            >
              <IconChevronRight size={18} />
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
        >
          {renderMainSlides()}
        </Swiper>
      </div>

      {/* Only show thumbnails if there are valid slides and more than 1 image and not all failed */}
      {hasAnyValidSlides && validSlides.length > 1 && !shouldShowDefault && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="imagesPreview"
          style={{ marginTop: '10px' }}
        >
          {renderThumbnails()}
        </Swiper>
      )}


    </div>
  );
};

export default Slider;