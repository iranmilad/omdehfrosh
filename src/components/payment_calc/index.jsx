import {
  Title,
  Paper,
  Stack,
  Flex,
  Divider,
  Grid,
  GridCol,
  Button,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { NavLink } from "react-router";
import PriceText from "../priceText";
import { IconArrowRight } from "@tabler/icons-react";

const PaymentCalc = (props) => {
  let { children, submit, prev } = props;
  return (
    <>
      <Title fw="600" c="gray.8" mb="sm">
        خلاصه فاکتور{" "}
      </Title>
      <Paper py="xl" pos="relative">
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} /> 
        <Stack gap="lg">
          <Flex justify="space-between">
            <Text size="sm" c="gray">
              مجموع سبد خرید
            </Text>
            <PriceText fw="500">1200000</PriceText>
          </Flex>
          <Flex justify="space-between">
            <Text size="sm" c="gray">
              {" "}
              تخفیف ها
            </Text>
            <PriceText fw="500">1200000</PriceText>
          </Flex>
        </Stack>
        <Divider my="lg" />
        <Flex justify="space-between">
          <Text size="sm" c="gray">
            مجموع
          </Text>
          <PriceText fw="500">5500000</PriceText>
        </Flex>
      </Paper>
      <Grid mt="md">
        {prev && (
          <GridCol span={{ lg: 6 }}>
            <Button
              fullWidth
              h="45"
              variant="light"
              color="gray"
              justify="space-between"
              rightSection={<span></span>}
              leftSection={<IconArrowRight size={16} />}
              {...prev}
            >
              قبلی
            </Button>
          </GridCol>
        )}
        <GridCol span={{ lg: prev ? 6 : 12 }}>
          <Button fullWidth h="45" {...submit}>
            {children}
          </Button>
        </GridCol>
      </Grid>
    </>
  );
};

export default PaymentCalc;
