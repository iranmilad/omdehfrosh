import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  LoadingOverlay,
  NumberFormatter,
  Paper,
  Skeleton,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconEye,
  IconHeart,
  IconHeartOff,
  IconPercentage,
  IconSwitch3,
  IconPhoto,
} from "@tabler/icons-react";
import PriceText from "../../components/priceText";
import { useEffect, useState } from "react";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { useSend } from "../../Libs/api";
import { notifications } from "@mantine/notifications";
import { NavLink } from "react-router";
import ProductPrice from "../ProductPrice";
import { isTemplateExpression } from "typescript";

function MyAccountProductBox({
  id,
  favoriteAdded,
  skeleton,
  title,
  image,
  price,
  refetchParent,
}) {
  const { colors } = useMantineTheme();
  const { ref, width } = useElementSize();
  
  // Function to check if image is valid
  const isValidImage = (imageValue) => {
    if (!imageValue) return false;
    if (imageValue === null || imageValue === "") return false;
    if (Array.isArray(imageValue) && (imageValue.length === 0 || imageValue[0] === "")) return false;
    return true;
  };

  // Default SVG component
  const DefaultImageSVG = ({ size = 150 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill="#f8f9fa" rx="8"/>
      <rect x="50" y="50" width="100" height="100" fill="#e9ecef" rx="4"/>
      <circle cx="75" cy="75" r="8" fill="#dee2e6"/>
      <path
        d="M60 120L80 100L100 120L120 100L140 120V140H60V120Z"
        fill="#dee2e6"
      />
      <text
        x="100"
        y="170"
        textAnchor="middle"
        fontSize="12"
        fill="#6c757d"
        fontFamily="system-ui"
      >
        تصویر پیش‌فرض
      </text>
    </svg>
  );

  return (
    <Paper
      ref={ref}
      shadow="sm"
      px="25"
      pb="lg"
      pt="40"
      pos="relative"
      display="flex"
      style={{ flexDirection: "column" }}
      h="100%"
    >
      {!skeleton ? (
        <>
          <Box component={NavLink} to={`/product/${id}`}>
            {isValidImage(image) ? (
              <Image
                className="hover:scale-105 transition-transform duration-300"
                w="100%"
                h="150px"
                fit="contain"
                src={image}
                fallbackSrc={null}
                onError={(e) => {
                  // Replace with default SVG on error
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <Box
              style={{
                display: isValidImage(image) ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '150px',
                width: '100%'
              }}
            >
              <DefaultImageSVG />
            </Box>
          </Box>
          <Box my="lg">
            <Text
              fw="600"
              size="sm"
              component={NavLink}
              to={`/product/${id}`}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
            >
              {title}
            </Text>
          </Box>
          <Flex justify="space-between" align="end" mt="auto">
            <Button component={NavLink} to={`/product/${id}`}>
              {width < 240 ? <IconEye size={20} /> : "مشاهده محصول"}
            </Button>
            <ProductPrice regularPrice={price?.regularPrice} discountedPrice={price?.discountedPrice} />
          </Flex>
        </>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb="lg">
            <Skeleton h={40} w={40} circle />
            <Skeleton h={40} w={40} circle />
          </Flex>
          <Skeleton w="100%" h="150px" />
          <Skeleton h="20" my="lg" />
          <Flex justify="space-between" align="end">
            <Skeleton w="100" h={50} />
            <Flex direction="column" align="end" gap={6}>
              <Flex gap={5}>
                <Skeleton w={40} h={20} />
                <Skeleton w={40} h={20} />
              </Flex>
              <Skeleton h={20} w={60} />
            </Flex>
          </Flex>
        </>
      )}
    </Paper>
  );
}

export default MyAccountProductBox;