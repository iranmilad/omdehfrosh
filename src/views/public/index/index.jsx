import { useEffect } from "react";
import { Box, Center, Container, Loader, Stack, Alert } from "@mantine/core";

// Components
import WideSlider from "../../../components/wideSlider";
import BadgedSlider from "../../../components/badgedSlider";
import Categories from "../../../components/categories";
import GridBanner from "../../../components/gridBanner";
import ProductHighlightCard from "../../../components/productHighlightCard";
import BrandSlider from "../../../components/brandSlider";
import ProductCarousel from "../../../components/productCarousel";
import PriceList from "../../../components/pricelist";

// React Query Cache System
import { useApiQuery } from "../../../Libs/reactQuery";

function Home() {

  // ============================================================================
  // API CALLS WITH REACT QUERY CACHING
  // ============================================================================

  // Homepage data - CACHED strategy (5 min stale, 15 min gc)
  // This is public data, same for all users - no need to include user ID
  const {
    data: homeData,
    isLoading: loadingHome,
    isFetching: fetchingHome,
    error: errorHome,
    isError,
    status,
  } = useApiQuery({
    endpoint: '/homepage/homepagedata',
    queryKey: ['homepage', 'data'],
    strategy: 'CACHED', // 5 min stale time
    transformer: (response) => {
      const raw = response?.data;
      const list = raw?.data ?? (Array.isArray(raw) ? raw : null);
      return Array.isArray(list) ? list : [];
    },
  });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loadingHome) {
    return (
      <Center style={{ minHeight: '50vh' }}>
        <Loader />
      </Center>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (isError && !homeData) {
    return (
      <Container className="px-3 md:px-5 my-10">
        <Alert color="red" title="خطا در بارگذاری">
          {errorHome?.message || errorHome?.response?.data?.message || 'خطا در دریافت اطلاعات'}
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ marginTop: 10, fontSize: 12 }}>
              {JSON.stringify(errorHome, null, 2)}
            </pre>
          )}
        </Alert>
      </Container>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  // Check if data is null, undefined, or empty array
  if (!homeData || (Array.isArray(homeData) && homeData.length === 0)) {
    return (
      <Container
        className="px-3 md:px-5 my-10"
        size={1336}
        style={{ width: '100%' }}
      >
        <Center>
          <div>هیچ اطلاعاتی موجود نیست</div>
        </Center>
      </Container>
    );
  }

  // ============================================================================
  // RENDER SECTIONS
  // ============================================================================

  // Normalize to array (transformer should already return array; guard for cache/legacy)
  const sections = Array.isArray(homeData) ? homeData : [];
  if (sections.length === 0 && homeData != null && !Array.isArray(homeData)) {
    console.warn('Home data was not an array, using empty list:', typeof homeData, homeData);
  }

  return (
    <>
      <Container className="px-3 md:px-5">
        <Stack gap="1rem">
          {sections.map((section, index) => {
            switch (section.type) {
              case "wideslider":
                return (
                  <Box
                    key={index}
                    style={{
                      width: '100vw',
                      maxWidth: '100vw',
                      marginLeft: 'calc(50% - 50vw)',
                      marginRight: 'calc(50% - 50vw)',
                    }}
                  >
                    <WideSlider items={section.data} />
                  </Box>
                );
              case "categories":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <Categories items={section?.data} />
                  </Box>
                );
              case "featured_promo":
                return ( section.data && section.data.length > 0 ) ? (
                  
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <BadgedSlider items={section.data} checkalllink={section.checkalllink} />
                  </Box>
                ) : null;

              case "banners":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <GridBanner items={section.data} />
                  </Box>
                );
              case "prices":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <PriceList items={section.data} />
                  </Box>
                );
              case "trendProducts":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <ProductHighlightCard items={section.data} />
                  </Box>
                );
              case "brands":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <BrandSlider items={section?.data} />
                  </Box>
                );
              case "featured_products":
                return (
                  <Box key={index} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
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
      {fetchingHome && homeData && (
        <Box style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <Loader size="sm" />
        </Box>
      )}
    </>
  );
}

export default Home;
