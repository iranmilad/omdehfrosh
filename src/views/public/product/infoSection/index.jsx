import { Button, Paper } from "@mantine/core";
import PurchasePanel from "../purchasePanel";
import { IconArrowLeft, IconBell } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import StockAlert from "../stockAlert";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../../../redux/cart";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

function InfoSection() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRenderStockAlert, setShouldRenderStockAlert] = useState(false);

  const cartItems = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();
  const stockAlert = useDisclosure(false);

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("user");

        const response = await fetch(getApiUrl("/cart"), {
          method: "GET",
          headers: new Headers({
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }),
        });

        if (!response.ok) {
          localStorage.removeItem("user"); // ✅ remove invalid/expired token
          throw new Error("Failed to fetch cart data");
        }

        const serverData = await response.json();

        const result = {
          cart: serverData.cart || [],
          totalPrice: serverData.total || 0,
        };

        setData(result);
        dispatch(setInitial([...result.cart])); // ✅ update Redux
      } catch (err) {
        console.error("Error fetching cart:", err);
        setData({ cart: [], totalPrice: 0 });
        dispatch(setInitial([]));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  const handleStockAlertOpen = () => {
    setShouldRenderStockAlert(true); // ✅ Enable rendering
    stockAlert[1].open();
  };

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
    </>
  );
}

export default InfoSection;