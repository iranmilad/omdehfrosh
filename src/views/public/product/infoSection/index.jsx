import { Button, Paper, Stack } from "@mantine/core";
import PurchasePanel from "../purchasePanel";
import { IconArrowLeft, IconBell } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import StockAlert from "../stockAlert";
import { useSelector } from "react-redux";

function InfoSection() {
  const [shouldRenderStockAlert, setShouldRenderStockAlert] = useState(false);

  const cartItems = useSelector((state) => state.cart.items || []);
  const stockAlert = useDisclosure(false);

  const handleStockAlertOpen = () => {
    setShouldRenderStockAlert(true); // ✅ Enable rendering
    stockAlert[1].open();
  };

  return (
    <Stack gap="md" p={{ base: "xs", md: "sm" }}>
      <div className="p-3 border rounded-xl divide-y">
        <PurchasePanel />
      </div>
      <Paper shadow="0" withBorder p="xs">
        <Button
          fz="13px"
          px="0"
          rightSection={<IconArrowLeft stroke={1.4} />}
          justify="space-between"
          fullWidth
          variant="transparent"
          h="30"
          onClick={handleStockAlertOpen} // ✅ Updated handler
        >
          <IconBell stroke={1.4} style={{ marginLeft: "5px" }} />
          <span>اطلاع رسانی قیمت و موجودی</span>
        </Button>
      </Paper>
      {/* ✅ Conditional rendering - only render after button is clicked */}
      {shouldRenderStockAlert && (
        <StockAlert opened={stockAlert[0]} close={stockAlert[1].close} />
      )}
    </Stack>
  );
}

export default InfoSection;