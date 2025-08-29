import { ActionIcon, Badge, Flex, Image, Paper, Text, Title } from "@mantine/core"
import { IconChevronLeft, IconInfoCircle, IconTrash, IconTrashFilled } from "@tabler/icons-react"
import PriceText from "../../../components/priceText"
import { NavLink } from "react-router"
import { useMediaQuery } from "@mantine/hooks";

function Product(props) {
    const {
      id,
      imageUrl,
      name,
      price,
      options,
      seller,
    } = props;



    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");


    return (
      <Paper p="xl" shadow="0" withBorder bg="gray.0">
        <Flex justify="space-between" gap="xl">
          <NavLink to={`/product/${id}`}>
            <Image w="120" h="120" fit="contain" src={imageUrl} />
          </NavLink>
          <div className="flex-1">
            <Flex justify="space-between">
              <Flex direction="column" gap="md">
                <Title
                  component={NavLink}
                  to={`/product/${id}`}
                  style={{ fontSize: isMobile ? '10px' : '15px' }}
                >
                  {name}
                </Title>
                <Flex justify="start">
                  <PriceText>{price.discountedPrice}</PriceText>
                </Flex>
                <Flex gap="md" wrap="wrap">
                    {/* {options?.map((option, index) => (
                    <Badge key={index} variant="light" color="">
                        {option}
                    </Badge>
                    ))} */}
                </Flex>
                <Badge
                  component={NavLink}
                  to={`/seller/${seller.id}`}
                  size={isMobile ? 'xs' : 'sm'} // Using predefined sizes
                  color="gray"
                  style={{ 
                    cursor: "pointer",
                  }}
                  rightSection={<IconInfoCircle size={14} />}
                >
                <Text
                  style={{ 
                    fontSize: isMobile ? '5px' : '10px',
                    padding: isMobile ? '4 4px' : '0 8px',
                  }}
                >
                  فروشنده: {seller.label}
                </Text>
                </Badge>
              </Flex>
            </Flex>
          </div>
        </Flex>
      </Paper>
    );
  }

export default Product