import { Grid, GridCol, Image, Box, Flex, Text, Paper, Title, Anchor, Group } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { 
  IconChevronLeft,
  IconPackage
} from "@tabler/icons-react";

function ProductHighlightCard({ items = [] }) {
  
  // Track which images have failed to load
  const [failedImages, setFailedImages] = useState(new Set());

  // Check if items is the category structure from your JSON
  const isCategories = items.length > 0 && items[0].title && items[0].children;

  // Early return if no items
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
    setFailedImages(prev => new Set([...prev, key]));
  };

  const createProductPlaceholder = (title) => {
    // Array of green-based gradient backgrounds matching ProductBox
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
    
    // Generate consistent gradient based on title hash
    const titleHash = (title || '').toString().split('').reduce((a, b) => {
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
        }}
        className="hover:scale-105 transition-transform duration-300"
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

  const renderProductImage = (item, categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const displayTitle = item.title || 'محصول';
    
    // Check if this image has failed to load or doesn't exist
    const hasValidImage = item.image && 
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
        w="100%"
        h="150px"
        fit="contain"
        src={item.image}
        alt={displayTitle}
        onError={() => handleImageError(categoryIndex, itemIndex)}
        fallbackSrc="" // This will trigger onError if image fails
        style={{
          borderRadius: "8px",
          backgroundColor: "#f8f9fa", // Light background for transparent images
        }}
      />
    );
  };

  const renderProductCard = (item, categoryIndex, itemIndex) => {
    const displayTitle = item.title || 'عنوان محصول';
    
    return (
      <Paper
        shadow="sm"
        px="25"
        pb="lg"
        pt="40"
        pos="relative"
        display="flex"
        style={{ 
          flexDirection: "column",
          border: "1px solid rgba(1, 1, 1, 0.5)",
        }}
        h="100%"
      >
        <Box component={item.url ? NavLink : 'div'} to={item.url ? `/product/${item.url}` : undefined}>
          {renderProductImage(item, categoryIndex, itemIndex)}
        </Box>
        
        <Box my="lg" w="100%" minh="42px">
          <Text
            fw="500"
            size="14px"
            component={item.url ? NavLink : 'div'}
            to={item.url ? `/product/${item.url}` : undefined}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              lineHeight: "1.2",
              color: item.url ? 'inherit' : 'var(--mantine-color-dimmed)',
              textDecoration: 'none',
              cursor: item.url ? 'pointer' : 'default',
            }}
          >
            {displayTitle}
          </Text>
        </Box>
      </Paper>
    );
  };

  // Handle both data structures: categories with children OR rows of items
  if (isCategories) {
    // Handle category structure from your JSON
    const validCategories = items.filter(category => 
      category.children && category.children.length > 0
    );

    return (
      <EditorContainer>
        <Box dir="rtl">
          {validCategories.map((category, categoryIndex) => (
            <Box key={category.url || categoryIndex} mb="3xl">
              <Group justify="space-between" align="center" mb="xl">
                <Title order={2} size="1.5rem" fw={600} c="dark.8">
                  {category.title}
                </Title>
                {category.url && (
                  <Anchor 
                    component={NavLink}
                    to={`/category/${category.url}`}
                    c="blue.6"
                    fw={500}
                    size="sm"
                    style={{
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          color: 'var(--mantine-color-blue-8)',
                        }
                      }
                    }}
                  >
                    <Group gap="xs" align="center">
                      <Text>مشاهده همه</Text>
                      <IconChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </Group>
                  </Anchor>
                )}
              </Group>
              
              <Flex justify="center" w="100%">
                <Grid gutter="md" style={{ maxWidth: '100%' }}>
                  {category.children.map((item, itemIndex) => (
                    <GridCol key={item.url || `${categoryIndex}-${itemIndex}`} span={{ base: 6, xs: 6, sm: 4, md: 3, lg: 3 }}>
                      {renderProductCard(item, categoryIndex, itemIndex)}
                    </GridCol>
                  ))}
                </Grid>
              </Flex>
            </Box>
          ))}
        </Box>
      </EditorContainer>
    );
  }

  // Handle original row structure
  return (
    <EditorContainer>
      {items.map((row, rowIndex) => (
        <Box key={rowIndex} mb="lg">
          <Flex justify="center" w="100%">
            <Grid gutter="md" style={{ maxWidth: '100%' }}>
              {row.map((item, itemIndex) => (
                <GridCol key={item.url || `${rowIndex}-${itemIndex}`} span={{ base: 6, xs: 6, sm: 4, md: 3, lg: 3 }}>
                  {renderProductCard(item, rowIndex, itemIndex)}
                </GridCol>
              ))}
            </Grid>
          </Flex>
        </Box>
      ))}
    </EditorContainer>
  );
}

ProductHighlightCard.craft = {
  props: {
    items: [
      [
        {
          url: "",
          image: "",
          title: ""
        }
      ]
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
            fields={[{
              name: "row",
              type: "repeater",
              label: "محصولات",
              fields: fields
            }]}
          />
        </div>
      );
    },
  },
}

export default ProductHighlightCard;