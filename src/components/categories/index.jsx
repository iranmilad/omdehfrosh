import { Box, Flex, Image, Text } from "@mantine/core";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import React, { useState, useRef } from "react";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { shallowEqual } from "@mantine/hooks";
import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconCategory } from "@tabler/icons-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import "swiper/css";
import "./style.css";

const CATEGORY_ICON_SIZE = 44;
const CATEGORY_SLIDE_WIDTH = 62;

function Categories({ items, title, title_align }) {
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  const createCategoryPlaceholder = (item) => {
    // Array of gradient backgrounds
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    ];
    
    // Generate consistent gradient based on title
    const titleHash = (item.title || '').toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const selectedGradient = gradients[Math.abs(titleHash) % gradients.length];
    
    return (
      <Flex
        w={CATEGORY_ICON_SIZE}
        h={CATEGORY_ICON_SIZE}
        justify="center"
        align="center"
        style={{
          background: selectedGradient,
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
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
            background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        <IconCategory 
          size={21} 
          color="rgba(255, 255, 255, 0.9)" 
          style={{ zIndex: 2 }} 
        />
      </Flex>
    );
  };

  const renderCategoryImage = (item) => {
    const [imageError, setImageError] = useState(false);
    
    const hasValidImage = item.image && 
                         item.image !== null && 
                         item.image !== "" && 
                         item.image.trim() !== "" &&
                         !imageError;

    if (!hasValidImage) {
      return createCategoryPlaceholder(item);
    }

    return (
      <Flex
        w={CATEGORY_ICON_SIZE}
        h={CATEGORY_ICON_SIZE}
        justify="center"
        align="center"
        style={{
          borderRadius: "50%",
          backgroundColor: "#f3f4f6",
          overflow: "hidden",
        }}
      >
        <Image
          w={CATEGORY_ICON_SIZE}
          h={CATEGORY_ICON_SIZE}
          fit="contain"
          src={item.image}
          alt={item.title || 'دسته بندی'}
          onError={() => setImageError(true)}
          fallbackSrc=""
          style={{
            objectFit: "contain",
          }}
        />
      </Flex>
    );
  };

  return (
    <EditorContainer>
      <Box pos="relative" px={{ base: "xs", md: 0 }} style={{ overflow: "hidden" }}>
      {/* Header with title and view all button */}
      <Flex
        justify="space-between"
        align="center"
        w="100%"
        py={0}
        mb={title?.trim() ? 8 : 0}
      >
        {title?.trim() ? (
          <Text 
            size="md" 
            fw="600"
            style={{ color: 'rgb(9, 54, 114)' }}
          >
            {title}
          </Text>
        ) : (
          <Box />
        )}
        
        {/* View All Button */}
        <Box
          component={NavLink}
          to="/fastorder/category"
          style={{
            textDecoration: 'none',
          }}
        >
          <Flex
            align="center"
            gap={4}
            px="xs"
            py={2}
            h={28}
            style={{
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              backgroundColor: "transparent",
              color: "inherit",
            }}
            className="hover:bg-gray-100"
          >
            <Text size="sm" fw="500">
              مشاهده همه
            </Text>
            <svg 
              style={{ width: '16px', height: '16px', fill: 'currentColor' }}
              viewBox="0 0 24 24"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </Flex>
        </Box>
      </Flex>
      
        <Swiper
          ref={sliderRef}
          modules={[FreeMode, Navigation]}
          spaceBetween={6}
          slidesPerView="auto"
          freeMode={true}
          onSlideChange={handleSlideChange}
          onInit={handleSlideChange}
          className="categories-swiper"
        >
          {items?.map((item, index) => (
            <SwiperSlide key={index} style={{ width: CATEGORY_SLIDE_WIDTH }}>
              <Flex
                direction="column"
                align="center"
                gap={0}
                component={item.display ? NavLink : 'div'}
                to={item.display ? `/fastorder/category/${item.url}` : undefined}
                opacity={item.display ? 1 : 0.4}
                py={4}
                style={{
                  pointerEvents: item.display ? "auto" : "none",
                  textDecoration: 'none',
                  cursor: item.display ? 'pointer' : 'default',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Circular image container */}
                {renderCategoryImage(item)}

                {/* Title */}
                <Text
                  size="xs"
                  fw="400"
                  ta="center"
                  c={item.display ? 'dimmed' : 'gray.5'}
                  style={{
                    lineHeight: "1.2",
                    maxWidth: `${CATEGORY_SLIDE_WIDTH}px`,
                    wordBreak: "break-word",
                    marginTop: 4,
                    fontSize: 12,
                  }}
                >
                  {item.title}
                </Text>

                {/* Subscription message */}
                {!item.display && item.subscriptionModel && (
                  <Text size="10px" c="red" ta="center" style={{ maxWidth: "80px" }}>
                    {item.subscriptionModel.modelId === "pro" 
                      ? "نیاز به اشتراک ویژه"
                      : item.subscriptionModel.modelId === "gold"
                      ? "نیاز به اشتراک حرفه ای"
                      : null}
                  </Text>
                )}
              </Flex>
            </SwiperSlide>
          ))}
        </Swiper>
        {!isBeginning && (
          <Box
            component="button"
            type="button"
            onClick={() => sliderRef.current?.swiper?.slidePrev()}
            className="categories-carousel-prev"
            aria-label="اسلاید قبلی"
          >
            <IconChevronRight size={16} />
          </Box>
        )}
        {!isEnd && (
          <Box
            component="button"
            type="button"
            onClick={() => sliderRef.current?.swiper?.slideNext()}
            className="categories-carousel-next"
            aria-label="اسلاید بعدی"
          >
            <IconChevronLeft size={16} />
          </Box>
        )}
      </Box>
    </EditorContainer>
  );
}

Categories.craft = {
  props: {
    title: "دسته بندی ها",
    title_align: "center",
    items: [],
  },
  related: {
    settings: () => {
      const fields = [
        {
          name: "title",
          type: "text",
          label: "عنوان",
        },
        {
          name: "url",
          type: "advancedSearch",
          label: "جستجوی دسته بندی",
        },
        {
          name: "image",
          type: "image",
          label: "تصویر",
        },
      ];
      return (
        <div>
          <ToolbarItem type="text" propKey="title" label="عنوان" />
          <ToolbarItem
            type="segmented"
            propKey="title_align"
            label="جهت نمایش عنوان"
            data={[
              {label: <IconAlignRight size={16} />, value: "right"},
              {label: <IconAlignCenter size={16} />, value: "center"},
              {label: <IconAlignLeft size={16} />, value: "left"},
            ]}
          />
          <ToolbarItem
            type="repeater"
            propKey="items"
            label="آیتم ها"
            fields={fields}
          />
        </div>
      );
    },
  },
};

const MemoizedCategories = React.memo(
  Categories,
  (prev, next) => !shallowEqual(prev, next)
);

export default MemoizedCategories;