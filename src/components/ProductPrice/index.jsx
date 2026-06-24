import { Button, Flex, Skeleton, Paper, NumberFormatter, Badge,Text } from "@mantine/core";
import { IconPercentage } from "@tabler/icons-react";
import PriceText from "../priceText";

function ProductPrice({ mini = false, dense = false, discountedPrice, regularPrice, discountPercent }) {
  const priceFontSize = dense ? "10px" : undefined;
  const priceWeight = dense ? 600 : 400;

  return (
    <Flex direction="column" align={dense ? "start" : "end"} gap={dense ? 2 : !mini ? 5 : 15} style={{ minWidth: 0, width: "100%" }}>
      {discountedPrice ? (
        <>
          <Flex gap={dense ? 2 : 5} wrap="wrap" align="center" style={{ maxWidth: "100%" }}>
            <Text size={dense ? "10px" : "xs"} td="line-through" c="gray.6" style={{ lineHeight: 1.1 }}>
              <NumberFormatter thousandSeparator value={regularPrice} />
            </Text>
            {!mini && (
              <Badge
                size={dense ? "xs" : "sm"}
                display="flex"
                style={{ flexDirection: "row", flexShrink: 0 }}
                styles={{
                  label: { display: "flex", fontSize: dense ? "9px" : undefined, lineHeight: 1.1 },
                  root: { paddingInline: dense ? 4 : 5, borderBottomLeftRadius: 0, height: dense ? 16 : undefined },
                }}
              >
                {discountPercent}
                <IconPercentage size={dense ? 10 : 16} style={{ marginRight: dense ? 2 : 5 }} />
              </Badge>
            )}
          </Flex>
          <PriceText fontSize={priceFontSize} fontWeight={priceWeight}>{discountedPrice}</PriceText>
        </>
      ) : (
        <PriceText fontSize={priceFontSize} fontWeight={priceWeight}>{regularPrice}</PriceText>
      )}
    </Flex>
  );
}

export default ProductPrice;
