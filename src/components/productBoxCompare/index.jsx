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
} from "@tabler/icons-react";
import PriceText from "../priceText";
import { useEffect, useState } from "react";
import { useDisclosure, useElementSize, useMediaQuery } from "@mantine/hooks";
import { useSend } from "../../Libs/api";
import { notifications } from "@mantine/notifications";
import { NavLink } from "react-router";
import ProductPrice from "../ProductPrice";
import { useSelector } from "react-redux";
import ImageIcon from "../../resources/defaultImageIcon";

function ProductBoxCompare({
  id,
  favoriteAdded,
  skeleton,
  title,
  slug,
  image,
  regularPrice,
  discountedPrice,
  discountPercent,
  refetchParent,
  onSelectProduct
}) {

  const compare = useSelector((state) => state.compare.items);

  const isProductInCompare = compare.some(group => group.items.includes(id));
  
  const { colors } = useMantineTheme();
  const { ref, width } = useElementSize();
  const [imageError, setImageError] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const isMediumScreen = useMediaQuery('(max-width: 768px)');
  
  // Calculate responsive icon size
  const getIconSize = () => {
    if (isSmallScreen) return 36;
    if (isMediumScreen) return 42;
    return 48;
  };

  // Check if image is valid
  const isImageValid = () => {
    if (!image || 
        image === "" || 
        image === null || 
        image === undefined ||
        (Array.isArray(image) && image.length === 0) ||
        (Array.isArray(image) && image.every(img => !img || img === ""))) {
      return false;
    }
    // If it's an array, check if the first element is valid
    if (Array.isArray(image)) {
      return image[0] && image[0] !== "";
    }
    return true;
  };

  // Get valid image source
  const getValidImageSrc = () => {
    if (!isImageValid()) {
      return null;
    }
    // If it's an array, use the first valid image
    if (Array.isArray(image)) {
      return image.find(img => img && img !== "") || null;
    }
    return image;
  };

  // Reset image error when image changes
  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <Paper
      ref={ref}
      shadow="sm"
      px={{ base: "xs", sm: "md", md: "lg", lg: "xl" }}
      pb={{ base: "sm", md: "lg" }}
      pt={{ base: "md", sm: "lg", md: "xl" }}
      pos="relative"
      display="flex"
      style={{ flexDirection: "column" }}
      h="100%"
    >
      {!skeleton ? (
        <>
          <Box component={NavLink} to={`/product/${slug}`}>
            {getValidImageSrc() && !imageError ? (
              <Image
                className="hover:scale-105 transition-transform duration-300"
                w="100%"
                h={{ base: "120px", sm: "140px", md: "150px", lg: "160px" }}
                fit="contain"
                src={getValidImageSrc()}
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <Box
                w="100%"
                h={{ base: "120px", sm: "140px", md: "150px", lg: "160px" }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px'
                }}
              >
                <ImageIcon size={getIconSize()} color="#6B7280" />
              </Box>
            )}
          </Box>
          <Box my={{ base: "sm", md: "lg" }}>
            <Text
              fw="600"
              fz={{ base: "xs", sm: "sm", md: "sm" }}
              component={NavLink}
              to={`/product/${slug}`}
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
          <Flex 
            justify="space-between" 
            align="end" 
            mt="auto"
            direction={{ base: "column", sm: "row" }}
            gap={{ base: "sm", sm: "md" }}
          >
            <Button 
              component={NavLink} 
              to={`/product/${slug}`}
              size={isSmallScreen ? "xs" : "sm"}
              fullWidth={{ base: true, sm: false }}
            >
              {width < 240 ? <IconEye size={18} /> : "مشاهده محصول"}
            </Button>
            <Box style={{ flexShrink: 0 }}>
              <ProductPrice 
                regularPrice={regularPrice} 
                discountPercent={discountPercent} 
                discountedPrice={discountedPrice} 
              />
            </Box>
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
      <Button 
        mt={{ base: "sm", md: "md" }}
        onClick={() => onSelectProduct(id)} 
        color={isProductInCompare ? "red" : "blue"}
        size={isSmallScreen ? "xs" : "sm"}
        fullWidth
      >
        {isProductInCompare ? "حذف" : "افزودن به مقایسه"}
      </Button>

    </Paper>
  );
}

export default ProductBoxCompare;
