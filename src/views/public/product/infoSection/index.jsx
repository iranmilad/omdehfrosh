import { Button, Paper } from "@mantine/core";
import PurchasePanel from "../purchasePanel";
import { IconArrowLeft, IconBell } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect } from "react";
import StockAlert from "../stockAlert";
import { useDispatch, useSelector } from "react-redux";
import { useData } from "../../../../Libs/api";
import { setInitial } from "../../../../redux/cart";



function InfoSection() {

  const { data, isLoading } = useData({ url: "/cart", queryKey: [''] });
  
  const cartItems = useSelector((state) => state.cart.items || []);

  const dispatch = useDispatch();


  const stockAlert = useDisclosure(false);

  useEffect(() => {
    if (Array.isArray(data?.cart)) {
      dispatch(setInitial([...data.cart])); // ✅ Safe to spread
    } else {
      dispatch(setInitial([])); // ✅ Avoids crash by setting an empty array
    }
  }, [data, dispatch]);
  
  
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
