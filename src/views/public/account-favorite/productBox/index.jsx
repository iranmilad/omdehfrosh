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
import PriceText from "../../../../components/priceText";
import { useEffect, useState } from "react";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { useSend } from "../../../../Libs/api";
import { notifications } from "@mantine/notifications";
import { NavLink } from "react-router";
import ProductPrice from "../../../../components/ProductPrice";

// Default SVG Component
const DefaultImageSVG = ({ size = 100, color = "#C1C2C5" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m14 10 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ProductBox({
  id,
  skeleton,
  title,
  image,
  price,
}) {
  const { colors } = useMantineTheme();
  const { ref, width } = useElementSize();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if image is valid
  const isValidImage = (img) => {
    if (!img) return false;
    if (img === "") return false;
    if (Array.isArray(img) && (img.length === 0 || img[0] === "")) return false;
    return true;
  };

  const shouldShowDefaultImage = !isValidImage(image) || imageError;

  // Reset error state when image prop changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [image]);

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
            {shouldShowDefaultImage ? (
              // Default SVG Image
              <Flex
                justify="center"
                align="center"
                w="100%"
                h="150px"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gray[3]}`,
                }}
                className="hover:scale-105 transition-transform duration-300"
              >
                <DefaultImageSVG size={80} color={colors.gray[4]} />
              </Flex>
            ) : (
              // Actual Image
              <Image
                className="hover:scale-105 transition-transform duration-300"
                w="100%"
                h="150px"
                fit="contain"
                src={Array.isArray(image) ? image[0] : image}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                style={{
                  opacity: imageLoaded ? 1 : 0.7,
                  transition: 'opacity 0.3s ease'
                }}
                fallbackSrc={null} // Prevent Mantine's default fallback
              />
            )}
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
            <ProductPrice 
              regularPrice={price.regularPrice} 
              discountPercent={price.discountPercent} 
              discountedPrice={price.discountedPrice} 
            />
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

export default ProductBox;