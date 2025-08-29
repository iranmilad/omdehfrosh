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
  IconPackage,
} from "@tabler/icons-react";
import PriceText from "../../components/priceText";
import { useEffect, useState } from "react";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { useSend } from "../../Libs/api";
import { notifications } from "@mantine/notifications";
import { NavLink } from "react-router";
import ProductPrice from "../ProductPrice";

function ProductBox({
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
}) {
  const { colors } = useMantineTheme();
  const { ref, width } = useElementSize();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Reset image error when image prop changes
  useEffect(() => {
    setImageError(false);
  }, [image]);

  const createProductPlaceholder = () => {
    // Array of green-based gradient backgrounds
    const gradients = [
      "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)", // Classic Green
      "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)", // Light Green
      "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)", // Medium Green
      "linear-gradient(135deg, #81C784 0%, #4CAF50 100%)", // Soft Green
      "linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)", // Pastel Green
      "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)", // Dark Green
      "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)", // Fresh Green
      "linear-gradient(135deg, #8BC34A 0%, #689F38 100%)", // Lime Green
    ];
    
    // Generate consistent gradient based on title or id
    const titleHash = (title || id || '').toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const selectedGradient = gradients[Math.abs(titleHash) % gradients.length];
    
    return (
      <Box
        w="100%"
        h="150px"
        style={{
          background: selectedGradient,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.3s ease",
        }}
        className="hover:scale-105"
      >
        {/* Subtle pattern overlay */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        {/* Product icon */}
        <IconPackage 
          size={48} 
          color="rgba(255, 255, 255, 0.8)" 
          style={{ zIndex: 2 }} 
        />
      </Box>
    );
  };

  const renderProductImage = () => {
    // Check if image is valid and hasn't failed
    const hasValidImage = image && 
                         image !== null && 
                         image !== "" && 
                         image.trim() !== "" &&
                         !imageError;

    if (!hasValidImage) {
      return createProductPlaceholder();
    }

    return (
      <Image
        className="hover:scale-105 transition-transform duration-300"
        w="100%"
        h="150px"
        fit="contain"
        src={image}
        alt={title || 'محصول'}
        onError={handleImageError}
        fallbackSrc="" // This will trigger onError if image fails
        style={{
          borderRadius: "8px",
          backgroundColor: "#f8f9fa", // Light background for transparent images
        }}
      />
    );
  };

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
          <Box component={slug ? NavLink : 'div'} to={slug ? `/product/${slug}` : undefined}>
            {renderProductImage()}
          </Box>
          <Box my="lg">
            <Text
              fw="600"
              size="sm"
              component={slug ? NavLink : 'div'}
              to={slug ? `/product/${slug}` : undefined}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                color: slug ? 'inherit' : 'var(--mantine-color-dimmed)',
                textDecoration: 'none',
                cursor: slug ? 'pointer' : 'default',
              }}
            >
              {title || 'عنوان محصول'}
            </Text>
          </Box>
          <Flex justify="space-between" align="end" mt="auto">
            {slug ? (
              <Button component={NavLink} to={`/product/${slug}`}>
                {width < 240 ? <IconEye size={14} /> : "مشاهده"}
              </Button>
            ) : (
              <Button disabled variant="light" color="gray">
                {width < 240 ? <IconEye size={20} /> : "غیر قابل مشاهده"}
              </Button>
            )}
            <ProductPrice 
              regularPrice={regularPrice} 
              discountPercent={discountPercent} 
              discountedPrice={discountedPrice} 
            />
          </Flex>
        </>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb="lg">
            <Skeleton h={40} w={40} circle />
            <Skeleton h={40} w={40} circle />
          </Flex>
          <Skeleton w="100%" h="150px" radius="md" />
          <Skeleton h="20" my="lg" />
          <Flex justify="space-between" align="end">
            <Skeleton w="100" h={50} radius="md" />
            <Flex direction="column" align="end" gap={6}>
              <Flex gap={5}>
                <Skeleton w={40} h={20} radius="sm" />
                <Skeleton w={40} h={20} radius="sm" />
              </Flex>
              <Skeleton h={20} w={60} radius="sm" />
            </Flex>
          </Flex>
        </>
      )}
    </Paper>
  );
}

export default ProductBox;