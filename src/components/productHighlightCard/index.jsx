import { Image, Box, Text, Paper, Title, Anchor, Group } from "@mantine/core";
import React, { useState, useRef } from "react";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import ProductBox from "../productBox";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight, IconPackage } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import "swiper/css";
import "./style.css";

const DESKTOP_SLIDE_WIDTH = 200;
const MOBILE_SLIDE_WIDTH = 150;
const SPACE_BETWEEN = 4;

function ProductRowSlider({ children, slideWidth }) {
  const sliderRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 576px)");
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
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

  const slides = React.Children.toArray(children);
  if (slides.length === 0) return null;

  const showArrows = slides.length > 1 && isScrollable;

  return (
    <Box pos="relative" className="product-highlight-slider-wrap">
      {showArrows && (
        <Box
          component="button"
          type="button"
          onClick={() => sliderRef.current?.swiper?.slidePrev()}
          className="product-highlight-card-carousel-prev"
          aria-label="اسلاید قبلی"
          disabled={isBeginning}
          data-disabled={isBeginning || undefined}
        >
          <IconChevronRight size={16} />
        </Box>
      )}
      {showArrows && (
        <Box
          component="button"
          type="button"
          onClick={() => sliderRef.current?.swiper?.slideNext()}
          className="product-highlight-card-carousel-next"
          aria-label="اسلاید بعدی"
          disabled={isEnd}
          data-disabled={isEnd || undefined}
        >
          <IconChevronLeft size={16} />
        </Box>
      )}
      <Swiper
        ref={sliderRef}
        className="product-highlight-swiper"
        slidesPerView="auto"
        spaceBetween={SPACE_BETWEEN}
        loop={false}
        modules={[FreeMode, Navigation]}
        freeMode={!isMobile}
        watchOverflow
        observer
        observeParents
        onSlideChange={updateNavigation}
        onInit={(swiper) => {
          updateNavigation(swiper);
          requestAnimationFrame(() => updateNavigation(swiper));
        }}
        onResize={updateNavigation}
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.key || index}
            className="product-highlight-slide"
            style={{
              width: slideWidth,
              height: "auto",
              display: "flex",
            }}
          >
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

function TrendProductsSlider({ items = [] }) {
  const isMobile = useMediaQuery("(max-width: 576px)");
  const slideWidth = isMobile ? MOBILE_SLIDE_WIDTH : DESKTOP_SLIDE_WIDTH;

  if (!items || items.length === 0) return null;

  return (
    <ProductRowSlider slideWidth={slideWidth}>
      {items.map((item, index) => (
        <ProductBox
          key={item.url || item.id || index}
          id={item.url || item.id}
          title={item.title}
          image={item.image}
          slug={item.url}
          regularPrice={item.regularPrice}
          discountedPrice={item.discountedPrice}
          discountPercent={item.discountPercent}
          compact
          dense={isMobile}
          hideCounter
        />
      ))}
    </ProductRowSlider>
  );
}

function ProductHighlightCard({ items = [], title }) {
  const [failedImages, setFailedImages] = useState(new Set());
  const isMobile = useMediaQuery("(max-width: 576px)");
  const isSmall = useMediaQuery("(min-width: 577px) and (max-width: 768px)");

  const isCategories = items.length > 0 && items[0].title && items[0].children;
  const isTrendProducts =
    items.length > 0 &&
    !isCategories &&
    !Array.isArray(items[0]) &&
    !items[0]?.children;

  if (!items || items.length === 0) {
    return (
      <EditorContainer>
        <Box ta="center" py={48}>
          <Text c="dimmed" size="lg">هیچ محصولی یافت نشد</Text>
        </Box>
      </EditorContainer>
    );
  }

  const handleImageError = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setFailedImages((prev) => new Set([...prev, key]));
  };

  const CARD_WIDTH = isMobile ? MOBILE_SLIDE_WIDTH : isSmall ? 180 : DESKTOP_SLIDE_WIDTH;
  const IMAGE_HEIGHT = isMobile ? 120 : isSmall ? 140 : 150;

  const createProductPlaceholder = (itemTitle) => {
    const gradients = [
      "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
      "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)",
      "linear-gradient(135deg, #81C784 0%, #4CAF50 100%)",
      "linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)",
      "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
      "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)",
      "linear-gradient(135deg, #8BC34A 0%, #689F38 100%)",
    ];

    const titleHash = (itemTitle || "").toString().split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const selectedGradient = gradients[Math.abs(titleHash) % gradients.length];

    return (
      <Box
        style={{
          width: "100%",
          height: `${IMAGE_HEIGHT}px`,
          background: selectedGradient,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
        className="hover:scale-105 transition-transform duration-300"
      >
        <IconPackage
          size={isMobile ? 40 : 48}
          color="rgba(255, 255, 255, 0.8)"
          style={{ zIndex: 2 }}
        />
      </Box>
    );
  };

  const renderProductImage = (item, categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const displayTitle = item.title || "محصول";

    const hasValidImage =
      item.image &&
      item.image !== null &&
      item.image !== "" &&
      item.image.trim() !== "" &&
      !failedImages.has(key);

    if (!hasValidImage) {
      return createProductPlaceholder(displayTitle);
    }

    return (
      <Image
        className="hover:scale-105 transition-transform duration-300"
        src={item.image}
        alt={displayTitle}
        onError={() => handleImageError(categoryIndex, itemIndex)}
        fallbackSrc=""
        fit="contain"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    );
  };

  const renderProductCard = (item, categoryIndex, itemIndex) => {
    const displayTitle = item.title || "عنوان محصول";

    return (
      <Paper
        shadow="sm"
        px="sm"
        pb="sm"
        pt="sm"
        pos="relative"
        w="100%"
        style={{
          border: "1px solid rgb(1 1 1 / 15%)",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          component={item.url ? NavLink : "div"}
          to={item.url ? `/product/${item.url}` : undefined}
          style={{
            width: "100%",
            height: `${IMAGE_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          {renderProductImage(item, categoryIndex, itemIndex)}
        </Box>

        <Box my="xs" w="100%" style={{ minHeight: 36 }}>
          <Text
            fw="500"
            size={isMobile ? "12px" : "13px"}
            component={item.url ? NavLink : "div"}
            to={item.url ? `/product/${item.url}` : undefined}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              lineHeight: "1.3",
              color: item.url ? "inherit" : "var(--mantine-color-dimmed)",
              textDecoration: "none",
              cursor: item.url ? "pointer" : "default",
            }}
          >
            {displayTitle}
          </Text>
        </Box>
      </Paper>
    );
  };

  if (isTrendProducts) {
    return <TrendProductsSlider items={items} />;
  }

  if (isCategories) {
    const validCategories = items.filter(
      (category) => category.children && category.children.length > 0
    );

    return (
      <EditorContainer>
        <Box dir="rtl">
          {validCategories.map((category, categoryIndex) => (
            <Box key={category.url || categoryIndex} mb="xl">
              <Group justify="space-between" align="center" mb="md">
                <Title order={2} size="1.25rem" fw={600} c="dark.8">
                  {category.title}
                </Title>
                {category.url && (
                  <Anchor
                    component={NavLink}
                    to={`/category/${category.url}`}
                    c="blue.6"
                    fw={500}
                    size="sm"
                    style={{ textDecoration: "none" }}
                  >
                    <Group gap="xs" align="center">
                      <Text>مشاهده همه</Text>
                      <IconChevronLeft size={16} />
                    </Group>
                  </Anchor>
                )}
              </Group>

              <ProductRowSlider slideWidth={CARD_WIDTH}>
                {category.children.map((item, itemIndex) => (
                  <React.Fragment key={item.url || `${categoryIndex}-${itemIndex}`}>
                    {renderProductCard(item, categoryIndex, itemIndex)}
                  </React.Fragment>
                ))}
              </ProductRowSlider>
            </Box>
          ))}
        </Box>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
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
      {items.map((row, rowIndex) => (
        <Box key={rowIndex} mb={rowIndex < items.length - 1 ? "md" : 0}>
          <ProductRowSlider slideWidth={CARD_WIDTH}>
            {(Array.isArray(row) ? row : [row]).map((item, itemIndex) => (
              <React.Fragment key={item.url || `${rowIndex}-${itemIndex}`}>
                {renderProductCard(item, rowIndex, itemIndex)}
              </React.Fragment>
            ))}
          </ProductRowSlider>
        </Box>
      ))}
    </EditorContainer>
  );
}

ProductHighlightCard.craft = {
  props: {
    title: "محصولات پرفروش",
    items: [
      [
        {
          url: "",
          image: "",
          title: "",
        },
      ],
    ],
  },
  related: {
    settings: () => {
      const fields = [
        {
          name: "url",
          type: "text",
          label: "لینک محصول",
        },
        {
          name: "image",
          type: "image",
          label: "تصویر محصول",
        },
        {
          name: "title",
          type: "text",
          label: "عنوان محصول",
        },
      ];
      return (
        <div>
          <ToolbarItem
            type="repeater"
            propKey="items"
            label="ردیف محصولات"
            fields={[
              {
                name: "row",
                type: "repeater",
                label: "محصولات",
                fields: fields,
              },
            ]}
          />
        </div>
      );
    },
  },
};

export default ProductHighlightCard;
