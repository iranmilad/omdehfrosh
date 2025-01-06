import React from "react";
import {
  Container,
  Group,
  Image,
  Button,
  Center,
  Text,
  Grid,
  Stack,
  Title,
  Anchor,
  Box,
  SimpleGrid,
  GridCol,
  Paper,
} from "@mantine/core";
import cashDelivery from "../../assets/services/cash-on-delivery.svg";
import daysReturn from "../../assets/services/days-return.svg";
import expressDelivery from "../../assets/services/express-delivery.svg";
import originalProducts from "../../assets/services/original-products.svg";
import support from "../../assets/services/support.svg";
import { useSelector } from "react-redux";
import {
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandX,
} from "@tabler/icons-react";
import SocialLink from "../socialLink";

const Footer = (props) => {
  const bootstrap = useSelector((state) => state.global.bootstrap);
  return (
    <Box className="border-t pt-10 mt-32 bg-white z-30">
      <Container>
        <Group justify="space-between" w="100%">
          <Stack spacing="xs">
            <Image className="w-32 md:w-48" src={bootstrap?.logo} alt="" />
          </Stack>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            size="md"
            variant="outline"
            color="gray"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            برو به بالا
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="#9c9c9c"
              viewBox="0 0 256 256"
            >
              <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm44.24-78.24a6,6,0,1,1-8.48,8.48L128,112.49,92.24,148.24a6,6,0,0,1-8.48-8.48l40-40a6,6,0,0,1,8.48,0Z"></path>
            </svg>
          </Button>
        </Group>

        {/* Features section */}
        <SimpleGrid
          cols={{ base: 2, sm: 3, lg: "5" }}
          justify="space-around"
          align="center"
          style={{ marginTop: "2rem", marginBottom: "2.5rem", gap: "1rem" }}
        >
          {[
            cashDelivery,
            daysReturn,
            expressDelivery,
            originalProducts,
            support,
          ].map((src, index) => (
            <Stack key={index} align="center" spacing="xs">
              <Image className="w-12 md:w-14" src={src} alt="" />
              <Text size="xs" c="gray.6">
                {
                  [
                    "پرداخت درب منزل",
                    "ضمانت 7 روزه",
                    "پست سریع",
                    "ضمانت کالا",
                    "پشتیبانی 24 ساعته",
                  ][index]
                }
              </Text>
            </Stack>
          ))}
        </SimpleGrid>

        <Grid gutter="xl">
          {bootstrap?.menu?.footer.map((item, index) => (
            <GridCol key={index} span={{ base: 6, lg: 3 }}>
              <Stack>
                <Title c="gray.8">{item.label}</Title>
                {item.children.map((child, index2) => (
                  <Anchor
                  key={index2}
                    href={child.path}
                    underline="never"
                    size="sm"
                    c="dark"
                  >
                    {child.label}
                  </Anchor>
                ))}
              </Stack>
            </GridCol>
          ))}
        </Grid>
        <Paper shadow="0" bg="gray.0" p="xl" my="xl">
          <Title mb="lg" c="gray.8">
            {bootstrap?.siteTitle}
          </Title>
          <Text size="sm" lh="2" c="gray.8" ta="justify">
            {bootstrap?.footerAbout}
          </Text>
        </Paper>

        <Group justify="space-between" pb={{ base: 100, md: "xl" }}>
          <Text size="xs" c="gray">
            تمامی حقوق برای این فروشگاه محفوظ است
          </Text>
          <Group>
            {"socialMedia" in bootstrap ? (
              <>
                {bootstrap?.socialMedia?.map((item, index) => <React.Fragment key={index}><SocialLink item={item} key={index} /></React.Fragment>)}
              </>
            ) : (
              ""
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default Footer;
