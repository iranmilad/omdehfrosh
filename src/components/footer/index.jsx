import React from "react";
import {
  Container,
  Group,
  Image,
  Button,
  Text,
  Grid,
  Stack,
  Title,
  Anchor,
  Box,
  SimpleGrid,
  GridCol,
  Paper,
  Skeleton,
  Flex,
} from "@mantine/core";
import cashDelivery from "../../assets/services/cash-on-delivery.svg";
import daysReturn from "../../assets/services/days-return.svg";
import expressDelivery from "../../assets/services/express-delivery.svg";
import originalProducts from "../../assets/services/original-products.svg";
import support from "../../assets/services/support.svg";
import { useSelector } from "react-redux";

const Footer = () => {
  // Fixed selector - use state.bootstrap.bootstrapData
  const { bootstrapData: bootstrap, loadingBootstrap } = useSelector((state) => state.bootstrap);

  const features = [
    { icon: cashDelivery, label: "پرداخت درب منزل" },
    { icon: daysReturn, label: "ضمانت 7 روزه" },
    { icon: expressDelivery, label: "پست سریع" },
    { icon: originalProducts, label: "ضمانت کالا" },
    { icon: support, label: "پشتیبانی 24 ساعته" },
  ];

  return (
    <Box className="border-t pt-10 mt-32 bg-white z-30" id="footer">
      <Container>
        {/* Header with Logo and Scroll Button */}
        <Group justify="space-between" w="100%">
          <Stack gap="xs">
            {loadingBootstrap ? (
              <Skeleton w={150} h={48} />
            ) : (
              <Image 
                className="w-32 md:w-48" 
                src={bootstrap?.data.logo} 
                alt={bootstrap?.data.siteTitle || "Logo"} 
              />
            )}
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

        {/* Footer Menu Categories with Images Column */}
        <Grid gutter="xl" mt={50} mb={60} align="start">
          {/* Left Column - Footer Menu */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Grid gutter="xl">
              {bootstrap?.data.menu?.footer?.map((item) => (
                <Grid.Col key={item.id} span={{ base: 6, sm: 4, lg: 3 }}>
                  <Stack>
                    {item.links?.map((link) => (
                      <Anchor
                        key={link.id}
                        href={link.url}
                        underline="never"
                        size="sm"
                        c="dark"
                      >
                        {link.label}
                      </Anchor>
                    ))}
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>

          {/* Right Column - Images (VERTICAL) */}
          <Flex direction="col" span={{ base: 12, md: 3 }}>
              <Image
                src="/uploads/footer/enamad.png"
                alt="enamad"
                w={{ base: 100, sm: 120 }}
                fit="contain"
              />
              <Image
                src="/uploads/footer/samandehi.jpg"
                alt="samandehi"
                w={{ base: 100, sm: 120 }}
                fit="contain"
              />
          </Flex>
        </Grid>



        {/* Bottom Bar with Copyright and Social Links */}
        <Group justify="space-between" pb={{ base: 100, md: "xl" }}>
          <Group gap="xl">
            <Text size="xs" c="gray" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="bi bi-telephone" style={{ fontSize: 16 }}></i>
              تلفن واحد صدای مشتریان 021-43802000
            </Text>
            <Text size="xs" c="gray">
              تمامی حقوق برای این فروشگاه محفوظ است
            </Text>
          </Group>
          
          {/* Social Links */}
          <Group gap="md">
            {bootstrap?.data.menu?.social?.[0]?.links?.map((item) => (
              <Anchor
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                c="dark.6"
                style={{ 
                  display: "flex", 
                  alignItems: "center",
                  transition: "color 0.2s ease"
                }}
                className="hover:text-blue-600"
              >
                {/* Detect if icon is Bootstrap Icon class (bi bi-*) or image URL */}
                {item.icon?.startsWith("bi ") ? (
                  <i 
                    className={item.icon} 
                    style={{ fontSize: 18 }}
                    aria-label={item.label}
                  ></i>
                ) : item.icon?.startsWith("/") ? (
                  <Image 
                    src={item.icon} 
                    w={24} 
                    h={24} 
                    fit="contain"
                    alt={item.label}
                  />
                ) : (
                  <i 
                    className={item.icon} 
                    style={{ fontSize: 24 }}
                    aria-label={item.label}
                  ></i>
                )}
              </Anchor>
            ))}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default Footer;