import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Title,
  Alert,
  Group,
  Button,
  Divider,
  Flex,
  Text,
  Badge,
  Stack,
  Center,
  Loader,
  LoadingOverlay,
  Transition,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useData, useSend } from "../../../Libs/api"; // Replace with your actual hook library
import Product from "./Product"; // Import the Product component
import PriceText from "../../../components/priceText"; // Import the PriceText component

function Account_Order() {
  const { id } = useParams();
  const { data, isLoading } = useData({ url: `/orders/${id}`, method: 'POST', queryKey: ['single-order', id] });
  const { mutateAsync, isPending } = useSend({ url: "/order-confirm" });
  const [delivered, setDelivered] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Initialize `delivered` and `showAlert` based on the API response
  useEffect(() => {
    if (data) {
      setDelivered(data.deliveryConfirmation);
      setShowAlert(!data.deliveryConfirmation); // Only show alert if deliveryConfirmation is false
    }
  }, [data]);

  const handleDeliveryConfirmation = async (val) => {
    try {
      await mutateAsync({ status: val }, {
        onSuccess: () => {
          setDelivered(val === "yes"); // Set delivered to true if status is "yes"
          setShowAlert(false); // Hide the alert with fade transition
        },
      });
    } catch (error) {
      console.error("Failed to update delivery status:", error);
    }
  };

  if (isLoading) return <Center><Loader /></Center>;

  const {
    recipient,
    phoneNumber,
    address,
    totalAmount,
    discountAmount,
    discountCode,
    products,
  } = data;

  return (
    <>
      <Title display="flex" style={{ alignItems: "center" }}>
        <IconArrowRight style={{ marginLeft: "10px" }} /> جزئیات سفارش
      </Title>

      {/* Conditionally render the Alert only if deliveryConfirmation is false */}
      {!delivered && (
        <Transition mounted={showAlert} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              <Alert mt="md" title="آیا سفارش به دستتان رسیده است؟">
                <LoadingOverlay visible={isPending} zIndex={1000} />
                <Group>
                  <Button size="xs" h={35} color="red" onClick={() => handleDeliveryConfirmation(false)}>
                    خیر
                  </Button>
                  <Button size="xs" h={35} onClick={() => handleDeliveryConfirmation(true)}>
                    بله
                  </Button>
                </Group>
              </Alert>
            </div>
          )}
        </Transition>
      )}

      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">تحویل گیرنده : </Text>
          <Text>{recipient}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">شماره موبایل : </Text>
          <Text>{phoneNumber}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">آدرس : </Text>
          <Text>{address}</Text>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">مبلغ : </Text>
          <PriceText>{totalAmount}</PriceText>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">مقدار تخفیف : </Text>
          <PriceText>{discountAmount}</PriceText>
        </Flex>
        <Flex gap="xs" align="center">
          <Text c="gray">کد تخفیف استفاده شده : </Text>
          <Badge>{discountCode}</Badge>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Title mb="lg">مرسولات</Title>
      <Stack>
        {products.map((product, index) => (
          <Product key={index} {...product} />
        ))}
      </Stack>
    </>
  );
}

export default Account_Order;