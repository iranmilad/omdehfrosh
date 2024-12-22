import { ActionIcon, Badge, Flex, Image, Paper, Text, Title } from "@mantine/core"
import { IconTrash, IconTrashFilled } from "@tabler/icons-react"
import Counter from "../../../components/counter"


const Product = (props) => {
    return (
        <Paper p="xl">
            <Flex justify="space-between" gap="xl">
                <Image w="120" h="120" fit="contain" src="https://dkstatics-public.digikala.com/digikala-products/1a98f09a2ae99fc19a6f8610d639e5e7dafa4188_1731504815.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90" />
                <div className="flex-1">
                    <Flex justify="space-between">
                        <Flex direction="column" gap="md">
                            <Title>گوشی موبایل اپل مدل iPhone 16 Pro ZAA دو سیم کارت ظرفیت 256 گیگابایت و رم 8 گیگابایت - رجیستر شده</Title>
                            <Text size="sm" c="gray.7">Apple iPhone 16 Pro ZAA Dual SIM Storage 256GB And RAM 8GB Mobile Phone - Registered</Text>
                            <Badge variant="light" c="dark">سفید</Badge>
                        </Flex>
                        <ActionIcon color="red" variant="light" size="lg">
                            <IconTrash />
                        </ActionIcon>
                    </Flex>
                    <Flex justify="space-between" mt="lg">
                        <Counter value={1} />
                    </Flex>
                </div>
            </Flex>
        </Paper>
    )
}

export default Product