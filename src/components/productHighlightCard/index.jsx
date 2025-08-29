import { Grid, GridCol, Image, Box, Flex, Text, Card, Overlay, Title, Anchor, Group } from "@mantine/core";
import React, { useState } from "react";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { 
  IconChevronLeft,
  IconPhoto
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

  const createDefaultImagePlaceholder = (title) => {
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
      "linear-gradient(135deg, #9CCC65 0%, #7CB342 100%)", // Yellow Green
      "linear-gradient(135deg, #C8E6C9 0%, #81C784 100%)", // Very Light Green
    ];
    
    // Generate a consistent gradient based on title hash for consistent colors
    const titleHash = title ? title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : 0;
    
    const selectedGradient = gradients[Math.abs(titleHash) % gradients.length];
    
    return (
      <Box
        h={180}
        style={{
          background: selectedGradient,
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--mantine-radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "var(--mantine-spacing-xs)",
        }}
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
        
        {/* Photo icon as placeholder */}
        <IconPhoto 
          size={48} 
          color="rgba(255, 255, 255, 0.8)" 
          style={{ zIndex: 2 }} 
        />
        
        {/* Title if available */}
        {title && (
          <Text 
            c="white" 
            fw={500} 
            size="xs" 
            ta="center"
            px="sm"
            style={{ 
              zIndex: 2,
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              lineHeight: 1.2,
              maxWidth: "100%",
              wordBreak: "break-word"
            }}
          >
            {title}
          </Text>
        )}
      </Box>
    );
  };

  const renderProductImage = (item, categoryIndex, itemIndex, categoryTitle) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const displayTitle = categoryTitle || item.title || 'محصول';
    
    // Check if this image has failed to load or doesn't exist
    const hasValidImage = item.image && 
                         item.image !== null && 
                         item.image !== "" && 
                         item.image.trim() !== "" &&
                         !failedImages.has(key);

    return (
      <Card
        radius="lg"
        style={{ 
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        styles={{
          root: {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            }
          }
        }}
      >
        {hasValidImage ? (
          <>
            <Image 
              h={180}
              fit="cover" 
              src={item.image}
              alt={displayTitle}
              onError={() => handleImageError(categoryIndex, itemIndex)}
              style={{ borderRadius: "inherit" }}
              fallbackSrc="" // This will trigger onError if image fails
            />
            
            {/* Product title overlay for real images */}
            <Overlay
              gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .85) 100%)"
              opacity={0.7}
              zIndex={1}
            />
            
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                padding: "var(--mantine-spacing-xs)"
              }}
            >
              <Text 
                c="white" 
                fw={600} 
                size="xs" 
                ta="center"
                style={{ 
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  lineHeight: 1.2
                }}
              >
                {displayTitle}
              </Text>
            </Box>
          </>
        ) : (
          // Use default placeholder when no valid image
          createDefaultImagePlaceholder(displayTitle)
        )}
      </Card>
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
              
              <Grid gutter="md">
                {category.children.map((item, itemIndex) => (
                  <GridCol key={item.url || `${categoryIndex}-${itemIndex}`} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                    {item.url ? (
                      <NavLink 
                        to={`/product/${item.url}`} 
                        style={{ textDecoration: "none" }}
                      >
                        {renderProductImage(item, categoryIndex, itemIndex, category.title)}
                      </NavLink>
                    ) : (
                      <Box style={{ cursor: 'default' }}>
                        {renderProductImage(item, categoryIndex, itemIndex, category.title)}
                      </Box>
                    )}
                  </GridCol>
                ))}
              </Grid>
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
          <Grid gutter="md">
            {row.map((item, itemIndex) => (
              <GridCol key={item.url || `${rowIndex}-${itemIndex}`} span={{ base: 12, sm: 6, md: 4 }}>
                {item.url ? (
                  <NavLink 
                    to={`/product/${item.url}`} 
                    style={{ textDecoration: "none" }}
                  >
                    {renderProductImage(item, rowIndex, itemIndex)}
                  </NavLink>
                ) : (
                  <Box style={{ cursor: 'default' }}>
                    {renderProductImage(item, rowIndex, itemIndex)}
                  </Box>
                )}
              </GridCol>
            ))}
          </Grid>
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