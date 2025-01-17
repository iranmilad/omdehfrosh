import { Box, Flex, Image, SimpleGrid, Text } from "@mantine/core"
import { NavLink } from "react-router"
import { EditorContainer } from "../editor/container"
import { useState } from "react"
import ToolbarItem from "../editor/toolbar/toolbarItem";

function Categories({items,title}) {
  const [newItems,setNewItems] = useState(items || []);

  return (
    <EditorContainer>
        <Text mb="xl" size="xl" fw="600" ta="center">{title}</Text>
        <SimpleGrid cols={{base:3,xs:4,lg:8}} spacing="md" verticalSpacing="50">
            {newItems.map((item,index) => (
                <Flex key={index} direction="column" justify="center" align="center" gap="sm" component={NavLink} to={`/category/${item.url}`}>
                    <Image w={100} h={100} fit="contain" src={item.image} />
                    <Text ta="center" fw="600" size="xs">{item.title}</Text>
                </Flex>
            ))}
        </SimpleGrid>
    </EditorContainer>
  )
}

Categories.craft = {
  props: {
    title: "دسته بندی ها"
  },
  related: {
    settings: () => {
      const fields = [
        {
          type: 'image',
          label: 'تصویر',
        },
        {
          type: 'advancedSearch',
          label: 'جستجوی دسته بندی',
        },
      ];
      return (
        <div>
          <ToolbarItem type="text" propKey="title" label="عنوان" />
          <ToolbarItem type="repeater" propKey="items" label="آیتم ها" fields={fields} />
        </div>
      )
    },
  },
}

export default Categories