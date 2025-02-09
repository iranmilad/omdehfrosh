import { Button, Paper } from "@mantine/core";
import PurchasePanel from "../purchasePanel";
import { IconArrowLeft, IconBell } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import StockAlert from "../stockAlert";

function InfoSection() {
  const stockAlert = useDisclosure(false);
  return (
    <>
      <div className="lg:mt-8 lg:mb-8"></div>
      <div className="p-3 border rounded-xl mx-auto divide-y lg:block">
        <PurchasePanel />
      </div>
      <Paper shadow="0" withBorder p="xs" mt="lg">
        <Button
          fz="13px"
          px="0"
          rightSection={<IconArrowLeft stroke={1.4} />}
          justify="space-between"
          fullWidth
          variant="transparent"
          h="30"
          onClick={() => stockAlert[1].open()}
        >
          <IconBell stroke={1.4} style={{ marginLeft: "5px" }} />
          <span>اطلاع رسانی قیمت و موجودی</span>
        </Button>
      </Paper>
      <StockAlert opened={stockAlert[0]} close={stockAlert[1].close} />
    </>
  );
}

export default InfoSection;
