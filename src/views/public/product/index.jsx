import { Center, Flex, Loader, Paper, Grid, GridCol } from "@mantine/core";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

  const combinations = product?.combinations || [];

  // Default: on open, set options from the combination that has selected: true (and sync product.options children selected)
  useEffect(() => {
    if (!product?.combinations?.length) return;
    const selectedComb = product.combinations.find((c) => c.selected === true) || product.combinations[0];
    const defaultOptions = selectedComb?.options || [];
    setOptions(defaultOptions);
  }, [product?.combinations, product?.id]);

  // Matching combination for current options (when user changes attributes)
  const selectedCombination =
    options?.length > 0 && product?.combinations?.length > 0
      ? (() => {
          const optionIds = options.map((o) => o.id).sort((a, b) => a - b);
          return product.combinations.find((comb) => {
            const combIds = (comb.options || []).map((o) => o.id).sort((a, b) => a - b);
            return optionIds.length === combIds.length && optionIds.every((id, i) => combIds[i] === id);
          }) || null;
        })()
      : product?.combinations?.find((c) => c.selected) || product?.combinations?.[0] || null;

  // Default supplier for top "add to basket": use supplier with selected: true in current combination
  const selectedSupplier =
    selectedCombination?.suppliers?.find((s) => s.selected === true) || selectedCombination?.suppliers?.[0] || null;

  // Option values disabled when: no supplier, or enable === false
  const optionsForDisplay = useMemo(() => {
    const opts = product?.options;
    if (!opts || !Array.isArray(opts)) return opts;
    return opts.map((attr) => {
      const children = (attr.children || []).map((child) => {
        const hasSupplier = (product?.combinations || []).some(
          (comb) =>
            (comb.options || []).some((o) => String(o.id) === String(child.id)) &&
            (comb.suppliers?.length ?? 0) > 0
        );
        const isEnabled = child.enable !== false;
        return { ...child, selected: child.selected !== false && hasSupplier && isEnabled };
      });
      return { ...attr, children };
    });
  }, [product?.options, product?.combinations]);

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
      value={{
        options,
        setOptions,
        combinations,
        loading,
        product,
        slug,
        supplier: selectedCombination,
        selectedCombination,
        selectedSupplier,
        optionsForDisplay: optionsForDisplay ?? product?.options,
      }}
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
        
        {selectedCombination?.suppliers && selectedCombination.suppliers.length > 0 && (
          <Sellers items={selectedCombination.suppliers} />
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
