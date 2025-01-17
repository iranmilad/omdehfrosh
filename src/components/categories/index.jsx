import { Box, Flex, Image, SimpleGrid, Text } from "@mantine/core";
import { NavLink } from "react-router";
import { EditorContainer } from "../editor/container";
import React, { useState } from "react";
import ToolbarItem from "../editor/toolbar/toolbarItem";
import { shallowEqual } from "@mantine/hooks";
import { IconAlignCenter, IconAlignLeft, IconAlignRight } from "@tabler/icons-react";

function Categories({ items, title,title_align }) {
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
        {items.map((item, index) => (
          <Flex
            key={index}
            direction="column"
            justify="center"
            align="center"
            gap="sm"
            component={NavLink}
            to={`/category/${item.url.value}`}
          >
            <Image w={100} h={100} fit="contain" src={item.image} />
            <Text ta="center" fw="600" size="xs">
              {item.title}
            </Text>
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
