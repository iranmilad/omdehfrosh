import React, { useEffect, useState } from "react";
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
  Group,
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
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { useSend } from "../../Libs/api";
import { notifications } from "@mantine/notifications";
import { NavLink } from "react-router";
import ProductPrice from "../ProductPrice";
import CounterHomePage from "../counterhomepage";

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
  defaultSellerId,
  defaultCombinationId,
  attributes,
  stock,
  minOrder,
  maxOrder,
  compact = false,
  hideCounter = false,
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
    if (compact) {
      return (
        <Box
          w="100%"
          h="120px"
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
          }}
          className="hover:scale-105 transition-transform duration-300"
        >
          <IconPackage size={40} color="#999" />
        </Box>
      );
    }
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
        h={compact ? "120px" : "150px"}
        fit="contain"
        src={image}
        alt={title || 'محصول'}
        onError={handleImageError}
        fallbackSrc="" // This will trigger onError if image fails
        style={{
          borderRadius: "8px",
          backgroundColor: compact ? "#ffffff" : "#f8f9fa",
          padding: compact ? "8px" : undefined,
        }}
      />
    );
  };

  const renderAttributes = () => {
    if (!attributes || attributes.length === 0) return null;
    
    // Show only first 2 attributes
    const displayAttributes = attributes.slice(0, 2);
    
    return (
      <Box 
        mt="xs"
        w="fit-content"
        h="18px"
        bg="white"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflow: 'visible',
        }}
      >
        {displayAttributes.map((attr, index) => (
          <React.Fragment key={attr.nameEng ?? attr.value ?? index}>
            <Flex
              align="center"
              gap={4}
              component="span"
              style={{
                whiteSpace: '',
                overflow: 'visible',
              }}
            >
              {attr.nameEng === 'color' && attr.colorCode && (
                <Box
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: attr.colorCode,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    flexShrink: 0,
                  }}
                />
              )}
              <Text
                size="12px"
                fw={400}
                c="dimmed"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'unset',
                }}
              >
                {attr.value}
              </Text>
            </Flex>
            {index < displayAttributes.length - 1 && (
              <Box
                component="span"
                style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: 'gray',
                  opacity: 0.3,
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  return (
    <Paper
      ref={ref}
      shadow="sm"
      px="25"
      pb="lg"
      pt={compact ? "sm" : "40"}
      pos="relative"
      display="flex"
      style={{ 
        flexDirection: "column",
        border: "1px solid rgba(1, 1, 1, 0.5)",
        
      }}
      h="100%"
    >
      {!skeleton ? (
        <>
          {/* Counter in top-right corner */}
          {id && (
            <Box 
              pos="absolute" 
              top={10} 
              right={10} 
              style={{ zIndex: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
            </Box>
          )}
          
          <Box component={id ? NavLink : 'div'} to={id ? `/product/${id}` : undefined}>
            {renderProductImage()}
          </Box>
          
          <Box my="lg" w="177px" minh="42px">
          <Text
            fw="500"
            size="14px"
            component={id ? NavLink : 'div'}
            to={id ? `/product/${id}` : undefined}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              lineHeight: "1.2",
              color: slug ? 'inherit' : 'var(--mantine-color-dimmed)',
              textDecoration: 'none',
              cursor: slug ? 'pointer' : 'default',
            }}
          >
            {title || 'عنوان محصول'}
          </Text>

            
            {renderAttributes()}
          </Box>
          
          <Flex justify="space-between" align="center" mt="auto" gap="md">
            <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <ProductPrice 
                regularPrice={regularPrice} 
                discountPercent={discountPercent} 
                discountedPrice={discountedPrice} 
              />
            </Box>
            
            {!hideCounter && (
              <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <CounterHomePage 
                  productId={id} 
                  defaultSellerId={defaultSellerId}
                  defaultCombinationId={defaultCombinationId}
                  stock={stock}
                  minOrder={minOrder}
                  maxOrder={maxOrder}
                />
              </Box>
            )}
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
          <Group gap="xs" mt="xs">
            <Skeleton h={20} w={60} radius="sm" />
            <Skeleton h={20} w={80} radius="sm" />
          </Group>
          <Flex justify="space-between" align="end" mt="auto">
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