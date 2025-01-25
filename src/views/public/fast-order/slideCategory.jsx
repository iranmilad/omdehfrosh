import { Box, Flex, Group, Image, Indicator, Text } from '@mantine/core'
import React from 'react'
import { FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

function SlideCategory({ items, onCategoryClick }) {
  return (
    <Swiper modules={[FreeMode]} slidesPerView="auto">
      {items.map((item, index) => (
        <SwiperSlide key={index} style={{ width: "150px", textAlign: "right" }}>
          <SingleCategory {...item} onClick={() => onCategoryClick?.(item.id)} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}


function SingleCategory({ size = "md", image, title, badge, icon, onClick }) {
  return (
    <Flex align="center" justify="start" direction="column" onClick={onClick} style={{ cursor: "pointer" }}>
      {badge && (
        <Indicator size={15} offset={13} label={badge}>
          <Box
            className="border-2 border-solid border-gray-300 rounded-full"
            h={size === "md" ? 90 : 80}
            w={size === "md" ? 90 : 80}
            p="4"
          >
            <Image
              className="rounded-full"
              src={image}
              w="100%"
              h="100%"
              alt={title}
            />
          </Box>
        </Indicator>
      )}
      {!badge && (
        <Box
          className="border-2 border-solid border-gray-300 rounded-full"
          h={size === "md" ? 90 : 80}
          w={size === "md" ? 90 : 80}
          p="4"
        >
          <Image
            className="rounded-full"
            src={image}
            w="100%"
            h="100%"
            alt={title}
          />
        </Box>
      )}
      <Text component="span" size={size === "md" ? "sm" : "xs"}>
        {title}
      </Text>
    </Flex>
  );
}

export default SlideCategory