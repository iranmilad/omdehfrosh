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

const items = [
  {
    url: "/link1",
    mobileImage: Mobile1,
    tabletImage: Desktop1,
    desktopImage: Desktop1,
  },
  {
    url: "/link2",
    mobileImage: Mobile2,
    tabletImage: Desktop2,
    desktopImage: Desktop2,
  },
];

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
          <WideSlider items={items} />
          <HeroSection />
        <Container className="px-3 md:px-5 my-10">
          <Stack gap={70}>
            <BadgedSlider items={data.featured_promo} />
            <Categories items={data.categories} />
            <GridBanner items={data.banners} />
            <ProductHighlightCard items={data.trendProducts} />
            <ProductGrid items={data.productGrid} />
            <BrandSlider items={data.brands} />
          </Stack>
            <Box mt="70">
              <ProductCarousel style={{marginTop: "30px"}} title="محصولات منتخب" items={data.featured_products} />
            </Box>
            <Banner image={items[0]} />
        </Container>
    </>
  );
}

export default Home;
