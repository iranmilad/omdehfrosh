import React from "react";
import WideSlider from "../../../components/wideSlider";
import Desktop1 from "../../../assets/sliders/1-desktop.gif";
import Desktop2 from "../../../assets/sliders/2-desktop.webp";
import Mobile1 from "../../../assets/sliders/1-mobile.gif";
import Mobile2 from "../../../assets/sliders/2-mobile.jpg";
import { useData } from "../../../Libs/api";
import { Box, Center, Container, Loader, Stack } from "@mantine/core";
import BadgedSlider from "../../../components/badgedSlider";
import Categories from "../../../components/categories";
import GridBanner from "../../../components/gridBanner";
import ProductHighlightCard from "../../../components/productHighlightCard";
import HeroSection from "../../../components/heroSection";
import ProductGrid from "../../../components/productGrid";
import BrandSlider from "../../../components/brandSlider";
import ProductCarousel from "../../../components/productCarousel";
import Banner from "../../../components/banner";

function Home() {
  const { isLoading, data } = useData({ url: "/home", queryKey: ["home"] });
  if (isLoading && !data)
    return (
      <Center>
        <Loader />
      </Center>
    );
  return (
    <>
      <Container className="px-3 md:px-5 my-10">
        <Stack gap={70}>
          {data.map((section, index) => {
            switch (section.type) {
              case "wideslider":
                return <WideSlider key={index} items={section.data} />
              case "featured_promo":
                return <BadgedSlider key={index} items={section.data} />;
              case "categories":
                return <Categories key={index} items={section.data} />;
              case "banners":
                return <GridBanner key={index} items={section.data} />;
              case "trendProducts":
                return (
                  <ProductHighlightCard key={index} items={section.data} />
                );
              case "productGrid":
                return <ProductGrid key={index} items={section.data} />;
              case "brands":
                return <BrandSlider key={index} items={section.data} />;
              case "featured_products":
                return (
                  <Box key={index}>
                    <ProductCarousel
                      style={{ marginTop: "30px" }}
                      title="محصولات منتخب"
                      items={section.data}
                    />
                  </Box>
                );
              default:
                return null;
            }
          })}
        </Stack>
      </Container>
    </>
  );
}

export default Home;
