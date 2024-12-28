import {
  Paper,
  Box,
  Center,
  Text,
  Flex,
  Grid,
  GridCol,
  Badge,
  Button,
  Badge,
  Collapse,
  Stack,
  Rating,
} from "@mantine/core";
import { NavLink } from "react-router";
import {
  IconBuildingStore,
  IconUserPin,
  IconTruckDelivery,
  IconShield,
  IconCashBanknote,
} from "@tabler/icons-react";
import PriceText from "../../../../components/priceText";
import { useDisclosure } from "@mantine/hooks";
import Title from "../../../../components/title";

function Sellers() {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  return (
    <Paper my={50} p="xl">
      <Title>فروشندگان این کالا</Title>
      <Stack mt="xl" gap="40">
        {Array(2)
          .fill(0)
          .map((item, index) => (
            <Box key={index}>
              <Grid align="center">
                <GridCol span={{ lg: 3 }}>
                  <Flex align="center" gap="md">
                    <IconBuildingStore />
                    <Flex direction="column">
                      <Text size="sm" component={NavLink} to={`/seller/${123}`}>
                        دیجیکالا
                      </Text>
                      <Flex gap="xs">
                        <Text size="xs" c="gray">
                          امتیاز
                        </Text>
                        <Rating value={3} size="xs" />
                      </Flex>
                    </Flex>
                  </Flex>
                </GridCol>
                <GridCol span={{ lg: 3 }}>
                  <Flex direction="column" gap="xs">
                    <Flex gap="xs">
                      <IconUserPin size={20} />
                      <Text size="sm" c="gray">
                        ارسال توسط فروشنده
                      </Text>
                    </Flex>
                    <Flex gap="xs">
                      <IconTruckDelivery size={20} />
                      <Text size="sm" c="gray">
                        ارسال در (تهران و کرج)
                      </Text>
                    </Flex>
                  </Flex>
                </GridCol>
                <GridCol span={{ lg: 3 }}>
                  <Flex gap="sm" align="center">
                    <IconShield size={20} />
                    <Text size="sm"  c="gray">گارانتی ۶ ماهه شرکت ورنا</Text>
                  </Flex>
                </GridCol>
                <GridCol span={{ lg: 3 }}>
                  <Flex align="center" justify="end" gap="lg">
                    <PriceText>1200000</PriceText>
                    <Button>افزودن به سبد</Button>
                  </Flex>
                </GridCol>
              </Grid>
            </Box>
          ))}
      </Stack>
      <Collapse in={opened}>
        <Stack gap="40" mt="40">
          {Array(2).fill(0).map((item,index) => (
                        <Box key={index}>
                        <Grid align="center">
                          <GridCol span={{ lg: 3 }}>
                            <Flex align="center" gap="md">
                              <IconBuildingStore />
                              <Flex direction="column">
                                <Text size="sm" component={NavLink} to={`/seller/${123}`}>
                                  دیجیکالا
                                </Text>
                                <Flex gap="xs">
                                  <Text size="xs" c="gray">
                                    امتیاز
                                  </Text>
                                  <Rating value={3} size="xs" />
                                </Flex>
                              </Flex>
                            </Flex>
                          </GridCol>
                          <GridCol span={{ lg: 3 }}>
                            <Flex direction="column" gap="xs">
                              <Flex gap="xs">
                                <IconUserPin size={20} />
                                <Text size="sm" c="gray">
                                  ارسال توسط فروشنده
                                </Text>
                              </Flex>
                              <Flex gap="xs">
                                <IconTruckDelivery size={20} />
                                <Text size="sm" c="gray">
                                  ارسال در (تهران و کرج)
                                </Text>
                              </Flex>
                            </Flex>
                          </GridCol>
                          <GridCol span={{ lg: 3 }}>
                            <Flex gap="sm" align="center">
                              <IconShield size={20} />
                              <Text size="sm"  c="gray">گارانتی ۶ ماهه شرکت ورنا</Text>
                            </Flex>
                          </GridCol>
                          <GridCol span={{ lg: 3 }}>
                            <Flex align="center" justify="end" gap="lg">
                              <PriceText>1200000</PriceText>
                              <Button>افزودن به سبد</Button>
                            </Flex>
                          </GridCol>
                        </Grid>
                      </Box>
          ))}
        </Stack>
      </Collapse>
      <Center>
        <Button radius={999} variant="light" mt="xl" onClick={() => toggle()}>
          مشاهده {opened ? "کمتر" : "بیشتر"} فروشگاه ها
        </Button>
      </Center>
    </Paper>
  );
}

export default Sellers;
