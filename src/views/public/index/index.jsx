import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchShopHomeData } from '../../../redux/shophome/shopHomeActions'
import WideSlider from "../../../components/wideSlider";
import { Box, Center, Container, Loader, Stack, Alert } from "@mantine/core";
import BadgedSlider from "../../../components/badgedSlider";
import Categories from "../../../components/categories";
import GridBanner from "../../../components/gridBanner";
import ProductHighlightCard from "../../../components/productHighlightCard";
import HeroSection from "../../../components/heroSection";
import ProductGrid from "../../../components/productGrid";
import BrandSlider from "../../../components/brandSlider";
import ProductCarousel from "../../../components/productCarousel";
import Banner from "../../../components/banner";
import PriceList from "../../../components/pricelist";

function Home() {
  const dispatch = useDispatch();
  
  // Get shop home data from Redux
  const { 
    homeData, 
    loadingShopHome, 
    errorShopHome, 
    successShopHome,
    lastFetched 
  } = useSelector((state) => state.shopHome);
  
  // Get user from Redux to trigger refetch on auth changes
  const { user } = useSelector((state) => state.auth);


  useEffect(() => {
    // You can add additional conditions like cache expiration here
    const shouldFetch = !homeData || !lastFetched || (user && !successShopHome);
    
    if (shouldFetch) {
      dispatch(fetchShopHomeData());
    }
  }, [dispatch, user, homeData, lastFetched, successShopHome]);

  // Show loading state
  if (loadingShopHome && !homeData) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  // Show error state
  if (errorShopHome && !homeData) {
    return (
      <Container className="px-3 md:px-5 my-10">
        <Alert color="red" title="خطا در بارگذاری">
          {typeof errorShopHome === 'string' 
            ? errorShopHome 
            : errorShopHome.message || 'خطا در دریافت اطلاعات'
          }
        </Alert>
      </Container>
    );
  }

  // Show content if we have data
  if (!homeData) {
    return (
      <Container className="px-3 md:px-5 my-10">
        <Center>
          <div>هیچ اطلاعاتی موجود نیست</div>
        </Center>
      </Container>
    );
  }

  
  
  console.log("ss", homeData)


  return (
    <>
      <Container className="px-3 md:px-5 my-10">
        <Stack gap={70}>
          {homeData?.map((section, index) => {
            switch (section.type) {
              case "wideslider":
                return <WideSlider key={index} items={section.data} />
              case "featured_promo":
                return <BadgedSlider key={index} items={section.data} />;
              case "categories":
                return <Categories key={index} items={section?.data} />;
              case "banners":
                return <GridBanner key={index} items={section.data} />;
              case "prices": 
                return <PriceList key={index} items={section.data} />;
              case "trendProducts":
                return (
                  <ProductHighlightCard key={index} items={section.data} />
                );
              case "productGrid":
                return <ProductGrid key={index} items={section.data} />;
              case "brands":
                return <BrandSlider key={index} items={section?.data} />;
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
      
      {/* Show loading indicator during background refresh */}
      {loadingShopHome && homeData && (
        <Box style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <Loader size="sm" />
        </Box>
      )}
    </>
  );
}

export default Home;