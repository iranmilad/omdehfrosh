import { Box, Flex, Group, Image, Indicator, Text } from '@mantine/core'
import React from 'react'
import { FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

function SlideCategory({ items, click,clickType,tab }) {
  const onClick = (id) => {
    click((val) => {
      // Check if the id already exists in the array
      if (val[clickType].includes(id)) {
        // If it exists, remove it
        return {
          ...val,
          [clickType]: val[clickType].filter((item) => item !== id),
        };
      } else {
        // If it doesn't exist, add it
        return {
          ...val,
          [clickType]: [...val[clickType], id],
        };
      }
    });
  };

  return (
    <Swiper modules={[FreeMode]} slidesPerView="auto">
      {items.map((item, index) => (
        <SwiperSlide key={index} style={{ width: "100px", textAlign: "right" }}>
          <SingleCategory {...item} onClick={() => onClick(item.id)} active={tab[clickType].includes(`${item?.id}`)}  />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}


function SingleCategory({ size = "md", image, title, badge, icon, onClick,active }) {
  return (
    <Flex align="center" justify="start" direction="column" onClick={onClick}>
      {badge && (
        <Indicator size={15} offset={13} label={badge}>
          <Box
            className={`border-2 border-solid rounded-full ${active ? 'border-[var(--mantine-primary-color-5)]' : 'border-gray-300'}`}
            h={size === "md" ? 70 : 50}
            w={size === "md" ? 70 : 50}
            p="4"
          >
            <Image
              className="rounded-full cursor-pointer"
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
          className={`border-2 border-solid rounded-full ${active ? 'border-[var(--mantine-primary-color-5)]' : 'border-gray-300'}`}
          h={size === "md" ? 70 : 50}
          w={size === "md" ? 70 : 50}
          p="4"
        >
          <Image
            className="rounded-full cursor-pointer"
            src={image}
            w="100%"
            h="100%"
            alt={title}
          />
        </Box>
      )}
      <Text component="span" size={size === "md" ? "sm" : "xs"} className='cursor-pointer'>
        {title}
      </Text>
    </Flex>
  );
}

export default SlideCategory