import { ActionIcon, Badge, Flex, Image, Paper, Text, Title } from "@mantine/core"
import { IconTrash, IconTrashFilled } from "@tabler/icons-react"
import PriceText from "../../../components/priceText"
import { NavLink } from "react-router"

function Product() {
  return (
    <Paper p="xl" shadow="0" withBorder bg="gray.0">
    <Flex justify="space-between" gap="xl">
        <NavLink to="/product/123">
            <Image  w="120" h="120" fit="contain" src="https://dkstatics-public.digikala.com/digikala-products/1a98f09a2ae99fc19a6f8610d639e5e7dafa4188_1731504815.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90" />
        </NavLink>
        <div className="flex-1">
            <Flex justify="space-between">
                <Flex direction="column" gap="md">
                    <Title component={NavLink} to="/product/123">گوشی موبایل اپل مدل iPhone 16 Pro ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - رجیستر شده</Title>
                    <Text size="sm" c="gray.7">Apple iPhone 16 Pro ZAA Dual SIM Storage 256GB And RAM 8GB Mobile Phone - Registered</Text>
                    <Flex justify="start"><PriceText>2000000</PriceText></Flex>
                    <Badge variant="light" color="">سفید</Badge>
                </Flex>
            </Flex>
        </div>
    </Flex>
</Paper>
  )
}

export default Product