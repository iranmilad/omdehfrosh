import { Box, Center, Container, Loader, Stack, Alert, Text } from "@mantine/core";

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

function SectionTitle({ title }) {
  if (!title) return null;
  return (
    <Text
      size="md"
      fw={600}
      mb="md"
      style={{ color: "rgb(9, 54, 114)" }}
    >
      {title}
    </Text>
  );
}

function SectionBox({ title, children, fullBleed = false }) {
  if (fullBleed) {
    return (
      <Box>
        <SectionTitle title={title} />
        {children}
      </Box>
    );
  }

  return (
    <Box style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px" }}>
      <SectionTitle title={title} />
      {children}
    </Box>
  );
}

function Home() {
  const {
    data: homeData,
    isLoading: loadingHome,
    isFetching: fetchingHome,
    error: errorHome,
    isError,
  } = useApiQuery({
    endpoint: "/homepage/homepagedata",
    queryKey: ["homepage", "sections-v2"],
    strategy: "STANDARD",
    queryOptions: {
      refetchOnMount: "always",
    },
  });

  if (loadingHome) {
    return (
      <Center style={{ minHeight: "50vh" }}>
        <Loader />
      </Center>
    );
  }

  if (isError && !homeData) {
    return (
      <Container className="px-3 md:px-5 my-10">
        <Alert color="red" title="خطا در بارگذاری">
          {errorHome?.message || errorHome?.response?.data?.message || "خطا در دریافت اطلاعات"}
          {process.env.NODE_ENV === "development" && (
            <pre style={{ marginTop: 10, fontSize: 12 }}>
              {JSON.stringify(errorHome, null, 2)}
            </pre>
          )}
        </Alert>
      </Container>
    );
  }

  if (!homeData || (Array.isArray(homeData) && homeData.length === 0)) {
    return (
      <Container className="px-3 md:px-5 my-10" size={1336} style={{ width: "100%" }}>
        <Center>
          <div>هیچ اطلاعاتی موجود نیست</div>
        </Center>
      </Container>
    );
  }

  const sections = Array.isArray(homeData) ? homeData : [];

  const renderProductLoopSection = (section, index) => {
    if (!section.data || section.data.length === 0) return null;
    return (
      <SectionBox key={`productloop-${section.title}-${index}`}>
        <ProductCarousel title={section.title} items={section.data} style={{ marginTop: "30px" }} />
      </SectionBox>
    );
  };

  return (
    <>
      <Container className="px-3 md:px-5">
        <Stack gap="1rem">
          {sections.map((section, index) => {
            const sectionKey = `${section.type}-${section.title || index}-${index}`;

            switch (section.type) {
              case "wideslider":
                return (
                  <SectionBox key={sectionKey} title={section.title} fullBleed>
                    <WideSlider items={section.data} />
                  </SectionBox>
                );

              case "categories":
                return (
                  <Box
                    key={sectionKey}
                    style={{
                      backgroundColor: "white",
                      padding: "12px 14px",
                      borderRadius: "8px",
                    }}
                  >
                    <Categories items={section?.data} title={section.title} />
                  </Box>
                );

              case "featured_promo":
                return section.data && section.data.length > 0 ? (
                  <SectionBox key={sectionKey}>
                    <BadgedSlider
                      items={section.data}
                      checkalllink={section.checkalllink}
                      backgroundColor={section.backgroundColor}
                    />
                  </SectionBox>
                ) : null;

              case "banners":
                return (
                  <SectionBox key={sectionKey} title={section.title}>
                    <GridBanner items={section.data} />
                  </SectionBox>
                );

              case "prices":
                return (
                  <SectionBox key={sectionKey} title={section.title}>
                    <PriceList items={section.data} />
                  </SectionBox>
                );

              case "trendProducts":
                return (
                  <SectionBox key={sectionKey}>
                    <ProductHighlightCard items={section.data} title={section.title} />
                  </SectionBox>
                );

              case "brands":
                return (
                  <SectionBox key={sectionKey}>
                    <BrandSlider items={section?.data} />
                  </SectionBox>
                );

              case "productloop":
                return renderProductLoopSection(section, index);

              default:
                if (section.type?.startsWith("productloop")) {
                  return renderProductLoopSection(section, index);
                }
                return null;
            }
          })}
        </Stack>
      </Container>

      {fetchingHome && homeData && (
        <Box style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
          <Loader size="sm" />
        </Box>
      )}
    </>
  );
}

export default Home;
