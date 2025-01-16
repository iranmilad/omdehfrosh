import { Box, Flex, Image, SimpleGrid, Text } from "@mantine/core"
import { NavLink } from "react-router"

function Categories({items}) {
  return (
    <div>
        <Text mb="xl" size="xl" fw="600" ta="center">دسته بندی ها</Text>
        <SimpleGrid cols={{base:3,xs:4,lg:8}} spacing="md" verticalSpacing="50">
            {items.map((item,index) => (
                <Flex key={index} direction="column" justify="center" align="center" gap="sm" component={NavLink} to={`/category/${item.url}`}>
                    <Image w={100} h={100} fit="contain" src={item.image} />
                    <Text ta="center" fw="600" size="xs">{item.title}</Text>
                </Flex>
            ))}
        </SimpleGrid>
    </div>
  )
}

export default Categories