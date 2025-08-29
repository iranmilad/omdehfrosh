import { Button, Flex, Skeleton, Paper, NumberFormatter, Badge,Text } from "@mantine/core";
import { IconPercentage } from "@tabler/icons-react";
import PriceText from "../priceText";

function ProductPrice({ mini=false,discountedPrice, regularPrice, discountPercent }) {
  return (
    <Flex direction="column" align="end" gap={!mini ? 5 : 15}>
      {discountedPrice ? (
        <>
          <Flex gap={5}>
            <Text size="xs" td="line-through" c="gray.6">
              <NumberFormatter thousandSeparator value={regularPrice} />
            </Text>
            {!mini && (
                <Badge
                display="flex"
                style={{ flexDirection: "row" }}
                styles={{
                  label: { display: "flex" },
                  root: { paddingInline: 5, borderBottomLeftRadius: 0 },
                }}
              >
                {discountPercent}
                <IconPercentage size={16} style={{ marginRight: 5 }} />
              </Badge>
            )}
          </Flex>
          <PriceText>{discountedPrice}</PriceText>
        </>
      ) : (
        <PriceText>{regularPrice}</PriceText>
      )}
    </Flex>
  );
}

export default ProductPrice;
