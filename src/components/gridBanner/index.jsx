import { Grid, GridCol, Group, Image, ScrollArea, Box, Flex, Text } from "@mantine/core";
import React, { useState } from "react";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { IconPhoto, IconSparkles } from "@tabler/icons-react";

function GridBanner({items}) {



  // Track which images have failed to load
  const [failedImages, setFailedImages] = useState(new Set());

  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  const handleImageError = (index) => {
    setFailedImages(prev => new Set([...prev, index]));
  };

  const createFallbackBanner = (index) => {
    const gradients = [
      "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)", // Red-Orange
      "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)", // Teal-Green
      "linear-gradient(135deg, #45b7d1 0%, #2c3e50 100%)", // Blue-Dark
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-Red
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Light Blue
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green-Cyan
    ];
    
    const selectedGradient = gradients[index % gradients.length];
    
    return (
      <Flex
        h={{base: 180, lg: 300}}
        justify="center"
        align="center"
        direction="column"
        gap="md"
        style={{
          background: selectedGradient,
          borderRadius: "12px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Decorative pattern overlay */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        {/* Floating sparkles */}
        <Box
          style={{
            position: "absolute",
            top: "15%",
            right: "20%",
            zIndex: 1
          }}
        >
          <IconSparkles size={20} color="rgba(255,255,255,0.6)" />
        </Box>
        
        <Box
          style={{
            position: "absolute",
            bottom: "20%",
            left: "15%",
            zIndex: 1
          }}
        >
          <IconSparkles size={16} color="rgba(255,255,255,0.4)" />
        </Box>
        
        {/* Main icon */}
        <IconPhoto size={60} color="white" style={{ zIndex: 2 }} />
      </Flex>
    );
  };

  const renderBannerImage = (item, index) => {
    // Check if this image has failed to load or doesn't exist
    if (!item.image || item.image === null || item.image === "" || failedImages.has(index)) {
      return createFallbackBanner(index);
    }

    return (
      <Image 
        h={{base: 180, lg: 300}} 
        fit={{lg: "cover"}} 
        display="block" 
        radius="lg" 
        src={item.image}
        alt={`Banner ${index + 1}`}
        onError={() => handleImageError(index)}
      />
    );
  };

  return (
      <EditorContainer>
          <Grid gap="md">
          {items && items.map((item, index) => (
              <GridCol key={index} span={{base: 6, lg: 3}}>
                <NavLink to={item.url || "#"}>
                  {renderBannerImage(item, index)}
                </NavLink>
              </GridCol>
          ))}
        </Grid>
      </EditorContainer>
  );
}

GridBanner.craft = {
  props: {
    items: [
      {
        url: "",
        image: ""
      }
    ],
  },
  related: {
    settings: () => {
      const fields = [
        {
          name: "url",
          type: "text",
          label: "لینک",
        },
        {
          name: "image",
          type: "image",
          label: "تصویر",
        },
      ];
      return (
        <div>
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
}

export default GridBanner;