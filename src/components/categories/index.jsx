import { Box, Flex, Image, SimpleGrid, Text } from "@mantine/core";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import React, { useState } from "react";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { shallowEqual } from "@mantine/hooks";
import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconCategory } from "@tabler/icons-react";
import Archive from "../archive";

function Categories({ items, title, title_align }) {

  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  const renderCategoryImage = (item) => {
    if (item.image && item.image !== null) {
      return (
        <Image 
          w={60} 
          h={60} 
          fit="contain" 
          src={item.image}
          alt={item.title}
        />
      );
    } else {
      // Beautiful fallback when no image
      return (
        <Flex
          w={60}
          h={60}
          justify="center"
          align="center"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
            position: "relative",
            overflow: "hidden"
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
          <IconCategory size={20} color="white" style={{ zIndex: 1 }} />
        </Flex>
      );
    }
  };

  return (
    <EditorContainer>
      <Text mb="xl" size="xl" fw="600" ta={title_align}>
        {title}
      </Text>
      <SimpleGrid
        cols={{ base: 3, xs: 4, lg: 8 }}
        spacing="md"
        verticalSpacing="50"
      >
      {items?.map((item, index) => (
        <Flex
          key={index}
          direction="column"
          justify="flex-start"
          align="center"
          gap="sm"
          component={NavLink}
          to={`/fastorder/category/${item.url}`}
          opacity={item.display ? 1 : 0.4}
          h={150} // Fixed height for all boxes
          style={{
            pointerEvents: item.display ? "auto" : "none",
            border: item.display ? "2px solid green" : "2px dashed gray",
            borderRadius: 8,
            padding: 8,
          }}
        >
          {/* Image container with fixed space */}
          <Box style={{ flex: "0 0 auto" }}>
            {renderCategoryImage(item)}
          </Box>
          
          {/* Text container with fixed height and overflow handling */}
          <Box
            style={{
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              minHeight: "30px", // Minimum space for text
              maxHeight: "50px", // Maximum space for text
              width: "100%",
            }}
          >
            <Text 
              ta="center" 
              fw="600" 
              size="xs"
              style={{
                lineHeight: "1.2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3, // Limit to 3 lines
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
                width: "100%"
              }}
            >
              {item.title}
            </Text>
          </Box>

          {/* Subscription message with fixed space */}
          {!item.display && (
            <Box style={{ flex: "0 0 auto", minHeight: "20px" }}>
              {item.subscriptionModel.modelId === "pro" ? (
                <Text size="xs" color="red" ta="center">
                  نیاز به اشتراک ویژه
                </Text>
              ) : item.subscriptionModel.modelId === "gold" ? (
                <Text size="xs" color="red" ta="center">
                  نیاز به اشتراک حرفه ای
                </Text>
              ) : null}
            </Box>
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

export default Categories;