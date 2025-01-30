import { ActionIcon, Badge, Flex, Image, Paper, Text, Title } from "@mantine/core"
import { IconChevronLeft, IconInfoCircle, IconTrash, IconTrashFilled } from "@tabler/icons-react"
import PriceText from "../../../components/priceText"
import { NavLink } from "react-router"

function Product(props) {
    const {
      id,
      imageUrl,
      name,
      description,
      price,
      options,
      seller,
    } = props;
  
    return (
      <Paper p="xl" shadow="0" withBorder bg="gray.0">
        <Flex justify="space-between" gap="xl">
          <NavLink to={`/product/${id}`}>
            <Image w="120" h="120" fit="contain" src={imageUrl} />
          </NavLink>
          <div className="flex-1">
            <Flex justify="space-between">
              <Flex direction="column" gap="md">
                <Title component={NavLink} to={`/product/${id}`}>{name}</Title>
                <Text size="sm" c="gray.7">{description}</Text>
                <Flex justify="start">
                  <PriceText>{price}</PriceText>
                </Flex>
                <Flex gap="md" wrap="wrap">
                    {options.map((option, index) => (
                    <Badge key={index} variant="light" color="">
                        {option}
                    </Badge>
                    ))}
                </Flex>
                <Badge style={{cursor:"pointer"}} component={NavLink} to={`/seller/${seller.id}`} size="sm" color="gray" rightSection={<IconInfoCircle size={14} />}>فروشنده: {seller.name}</Badge>
              </Flex>
            </Flex>
          </div>
        </Flex>
      </Paper>
    );
  }

export default Product