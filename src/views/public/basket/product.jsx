import { ActionIcon, Badge, Box, Flex, Group, Image, Paper, Text, ThemeIcon, Title, useMantineTheme } from "@mantine/core"
import { IconSwitch3, IconTrash, IconTrashFilled, IconUser } from "@tabler/icons-react"
import Counter from "../../../components/counter"
import CompareButton from "../../../components/compareBtn"


const Product = (props) => {
    const {primaryColor} = useMantineTheme();
    return (
        <Paper p="xl">
            <Flex justify="space-between" gap="xl">
                <Box w="120" h="120" pos="relative">
                    <Image w="120" h="120" fit="contain" src={props.image} />
                </Box>
                <div className="flex-1">
                    <Flex justify="space-between">
                        <Flex direction="column" gap="md">
                            <Title>{props.name}</Title>
                            <Flex gap="xs">{props.attributes.map((item,index) => <Badge key={index} variant="light" c="dark">{item}</Badge>)}</Flex>
                            <Flex c={primaryColor} align="center" gap="xs">
                                <IconUser size={14} />
                                <Text size="xs" component="span">{props.seller.label}</Text>
                            </Flex>
                        </Flex>
                        <Flex gap="5">
                            <CompareButton id="123" variant="light" size="lg" />
                            <ActionIcon color="red" variant="light" size="lg">
                                <IconTrash />
                            </ActionIcon>
                        </Flex>
                    </Flex>
                    <Flex justify="space-between" mt="lg">
                        <Counter value={props.count} />
                    </Flex>
                </div>
            </Flex>
        </Paper>
    )
}

export default Product