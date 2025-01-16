import {
    ActionIcon,
  Anchor,
  Box,
  Flex,
  Image,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Navigation } from "swiper/modules";
import { useRef, useState } from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import "./style.css"

function ProductHighlightCard({ items }) {
  const { primaryColor } = useMantineTheme();
  const sliderRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(items && items.length > 3 ? false : true);

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
  let stopIndex = 1;
  return (
    <Paper p="xl" withBorder shadow="0" radius="lg" pos="relative">
      {!isBeginning && (
        <ActionIcon
          variant="white"
          radius={999}
          size="lg"
          onClick={handlePrev}
          className="product-highlight-card-carousel-prev border border-solid border-slate-300"
          styles={{root: {transform: 'none'}}}
        >
          <IconChevronRight size={18} />
        </ActionIcon>
      )}
      {!isEnd && (
        <ActionIcon
          variant="white"
          radius={999}
          size="lg"
          onClick={handleNext}
          className="product-highlight-card-carousel-next border border-solid border-slate-300"
          styles={{root: {transform: 'none'}}}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
      )}
      <Flex justify="space-between" mb="lg">
        <Box visibleFrom="sm"></Box>
        <Title size="xl" fw="500">
          پرفروش‌ترین کالاها
        </Title>
        <Anchor size="sm" underline="never" component={NavLink} to="/category">
          مشاهده همه
        </Anchor>
      </Flex>
      <Swiper
      ref={sliderRef}
      breakpoints={{
        // Define breakpoints for different screen sizes
        320: { slidesPerView: 1, spaceBetween: 10 },  // Mobile portrait
        480: { slidesPerView: 2, spaceBetween: 10 }, // Mobile landscape
        1024: { slidesPerView: 3, spaceBetween: 30 }, // Small desktop
    }}
        spaceBetween={30}
        modules={[Navigation]}
        onSliderMove={handleSlideChange}
        onSlideChange={handleSlideChange}
      >
        {items &&
          items.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="divide-y">
                {item &&
                  item.map((child, index2) => {
                    return (
                      <Flex key={index2} py="md" align="center" gap="md">
                        <NavLink to={child.url}>
                          <Image
                            src={child.image}
                            fit="contain"
                            w={86}
                            h={86}
                          />
                        </NavLink>
                        <Text
                          fw="bold"
                          size="30px"
                          c={primaryColor}
                          component={NavLink}
                          to={child.url}
                        >
                          {stopIndex++}
                        </Text>
                        <Text
                          lh={1.7}
                          size="xs"
                          c="gray.8"
                          component={NavLink}
                          to={child.url}
                          style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",
                          }}
                        >
                          {child.title}
                        </Text>
                      </Flex>
                    );
                  })}
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </Paper>
  );
}

export default ProductHighlightCard;
