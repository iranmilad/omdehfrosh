import { Box, Flex, Image, SimpleGrid, Text } from "@mantine/core";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import React, { useState } from "react";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { shallowEqual } from "@mantine/hooks";
import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconCategory } from "@tabler/icons-react";

function Categories({ items, title, title_align }) {
  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  const createCategoryPlaceholder = (item) => {
    // Array of gradient backgrounds
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    ];
    
    // Generate consistent gradient based on title
    const titleHash = (item.title || '').toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const selectedGradient = gradients[Math.abs(titleHash) % gradients.length];
    
    return (
      <Flex
        w={64}
        h={64}
        justify="center"
        align="center"
        style={{
          background: selectedGradient,
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
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
            background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        <IconCategory 
          size={32} 
          color="rgba(255, 255, 255, 0.9)" 
          style={{ zIndex: 2 }} 
        />
      </Flex>
    );
  };

  const renderCategoryImage = (item) => {
    const [imageError, setImageError] = useState(false);
    
    const hasValidImage = item.image && 
                         item.image !== null && 
                         item.image !== "" && 
                         item.image.trim() !== "" &&
                         !imageError;

    if (!hasValidImage) {
      return createCategoryPlaceholder(item);
    }

    return (
      <Flex
        w={64}
        h={64}
        justify="center"
        align="center"
        style={{
          borderRadius: "50%",
          backgroundColor: "#f3f4f6",
          overflow: "hidden",
        }}
      >
        <Image
          w={64}
          h={64}
          fit="contain"
          src={item.image}
          alt={item.title || 'دسته بندی'}
          onError={() => setImageError(true)}
          fallbackSrc=""
          style={{
            objectFit: "contain",
          }}
        />
      </Flex>
    );
  };

  return (
    <EditorContainer>
      {/* Header with title and view all button */}
      <Flex
        justify="space-between"
        align="center"
        w="100%"
        px={{ base: "md", md: 0 }}
        py={{ base: "sm", md: 0 }}
        mb="lg"
      >
        <Text 
          size="md" 
          fw="600"
          style={{ color: 'rgb(9, 54, 114)' }}
        >
          دسته‌بندی‌ها
        </Text>
        
        {/* View All Button */}
        <Box
          component={NavLink}
          to="/fastorder/category"
          style={{
            textDecoration: 'none',
          }}
        >
          <Flex
            align="center"
            gap="xs"
            px="md"
            py="xs"
            h={36}
            style={{
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              backgroundColor: "transparent",
              color: "inherit",
            }}
            className="hover:bg-gray-100"
          >
            <Text size="sm" fw="500">
              مشاهده همه
            </Text>
            <svg 
              style={{ width: '16px', height: '16px', fill: 'currentColor' }}
              viewBox="0 0 24 24"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </Flex>
        </Box>
      </Flex>
      
      <SimpleGrid
        cols={{ base: 4, xs: 6, sm: 8, md: 10, lg: 12 }}
        spacing="md"
        verticalSpacing="lg"
      >
        {items?.map((item, index) => (
          <Flex
            key={index}
            direction="column"
            align="center"
            gap="xs"
            component={item.display ? NavLink : 'div'}
            to={item.display ? `/fastorder/category/${item.url}` : undefined}
            opacity={item.display ? 1 : 0.4}
            style={{
              pointerEvents: item.display ? "auto" : "none",
              textDecoration: 'none',
              cursor: item.display ? 'pointer' : 'default',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Circular image container */}
            {renderCategoryImage(item)}

            {/* Title */}
            <Text
              size="xs"
              fw="400"
              ta="center"
              c={item.display ? 'dimmed' : 'gray.5'}
              style={{
                lineHeight: "1.75",
                maxWidth: "80px",
                wordBreak: "break-word",
              }}
            >
              {item.title}
            </Text>

            {/* Subscription message */}
            {!item.display && item.subscriptionModel && (
              <Text size="10px" c="red" ta="center" style={{ maxWidth: "80px" }}>
                {item.subscriptionModel.modelId === "pro" 
                  ? "نیاز به اشتراک ویژه"
                  : item.subscriptionModel.modelId === "gold"
                  ? "نیاز به اشتراک حرفه ای"
                  : null}
              </Text>
            )}
          </Flex>
        ))}
      </SimpleGrid>
    </EditorContainer>
  );
}

Categories.craft = {
  props: {
    title: "دسته بندی ها",
    title_align: "center",
    items: [],
  },
  related: {
    settings: () => {
      const fields = [
        {
          name: "title",
          type: "text",
          label: "عنوان",
        },
        {
          name: "url",
          type: "advancedSearch",
          label: "جستجوی دسته بندی",
        },
        {
          name: "image",
          type: "image",
          label: "تصویر",
        },
      ];
      return (
        <div>
          <ToolbarItem type="text" propKey="title" label="عنوان" />
          <ToolbarItem
            type="segmented"
            propKey="title_align"
            label="جهت نمایش عنوان"
            data={[
              {label: <IconAlignRight size={16} />, value: "right"},
              {label: <IconAlignCenter size={16} />, value: "center"},
              {label: <IconAlignLeft size={16} />, value: "left"},
            ]}
          />
          <ToolbarItem
            type="repeater"
            propKey="items"
            label="آیتم ها"
            fields={fields}
          />
        </div>
      );
    },
  },
};

const MemoizedCategories = React.memo(
  Categories,
  (prev, next) => !shallowEqual(prev, next)
);

export default MemoizedCategories;