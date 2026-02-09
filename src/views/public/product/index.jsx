import { Center, Flex, Loader, Paper, Grid, GridCol } from "@mantine/core";
import { useIsFirstRender } from "@mantine/hooks";
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import InfoBox from "../../../components/InfoBox";
import IconBar from "./iconBar";
import InfoSection from "./infoSection";
import RelatedProducts from "./relatedProducts";
import Slider from "./slider";
import SummaryEntry from "./summaryEntry";
import Tab from "./Tab";
import Sellers from "./sellers";
import { useApiQuery } from "../../../Libs/reactQuery";

const ProductContext = createContext();

const Product = () => {
  const { slug } = useParams();
  const [options, setOptions] = useState([]);
  
  // Product details via React Query (cached + persisted)
  const {
    data: product,
    loading,
    error,
  } = useApiQuery({
    endpoint: slug ? `/singleproduct/${slug}` : null,
    queryKey: ['singleProduct', slug],
    strategy: 'CACHED',
    enabled: !!slug,
  });

  console.log('Product data:ssssssssssss', product);

  // Clean up throttle when component unmounts (optional)
  // useEffect(() => {
  //   return () => {
  //     // clearProductThrottle(slug); // optional
  //   };
  // }, [slug]);

  let supplier = null;
  const isFirstRender = useIsFirstRender();
  const combinations = product?.combinations || [];

  useEffect(() => {
    if (product?.combinations?.length > 0) {
      let selectedComb = product?.combinations.find((item) => item.selected);
      if (!selectedComb) {
        selectedComb = product?.combinations[0] || {};
      }
      setOptions(selectedComb.options || []);
    }
  }, [loading, product?.combinations]);

  // Fixed supplier logic
  if (options?.length > 0) {
    const selectedOptionIds = options.map((option) => option.id);
    
    const matchingCombinations = product?.combinations.filter((combination) => {
      const combinationOptionIds = combination?.options?.map((option) => option.id) || [];
      return selectedOptionIds.every((id) => combinationOptionIds.includes(id));
    });
    
    supplier = matchingCombinations.length > 0 ? matchingCombinations[0] : null;
  } else {
    if (product?.combinations?.length > 0) {
      const selectedComb = product.combinations.find((item) => item.selected);
      supplier = selectedComb || product.combinations[0];
    }
  }

  // Show loading while product is being fetched
  if (loading) {
    return (
      <Center mih="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!loading && !product) return <InfoBox>چنین محصولی یافت نشد</InfoBox>;


  return (
    <ProductContext.Provider
      value={{ options, setOptions, combinations, loading, product, slug, supplier }}
    >
      <div className="lg:my-10">
        <Paper pt="xl" px={{ base: "md", md: "xl", lg: "xl" }}>
          <Grid gutter={{ base: "md", md: "lg", lg: "xl" }}>
            <GridCol span={{ base: 12, md: 5, lg: 4 }}>
              <Flex gap="md" direction={{ base: "column", md: "column", lg: "row" }}>
                <IconBar favorite={product?.general?.addedToFavorite} data={product} />
                <Slider slides={product?.general.images} />
              </Flex>
            </GridCol>
            <GridCol span={{ base: 12, md: 7, lg: 5 }}>
              <SummaryEntry data={product} />
            </GridCol>
            <GridCol span={{ base: 12, md: 12, lg: 3 }}>
              <InfoSection/>
            </GridCol>
          </Grid>
        </Paper>
        
        {supplier?.suppliers && supplier.suppliers.length > 0 && (
          <Sellers items={supplier.suppliers} />
        )}
        
        <Tab data={product} slug={slug} />

        {
          product?.relatedProducts && product.relatedProducts.length > 0 && (
            <RelatedProducts items={product.relatedProducts} />
          )
        }


      </div>
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);

export default Product;
