import { Center, Flex, Loader, Paper } from "@mantine/core";
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
import { useDispatch, useSelector } from "react-redux";
import { 
  getSingleProductDetails, 
} from "../../../redux/products/singleproductpage/singleProductPageGetActions";

const ProductContext = createContext();

const Product = () => {
  const { slug } = useParams();
  const [options, setOptions] = useState([]);
  const [delayedLoading, setDelayedLoading] = useState(true); // ⬅️ new state
  const dispatch = useDispatch();

  const { product, loading, error } = useSelector((state) => state.singleProduct);

  // Fetch product details with throttling (no caching) + 5s delay
  useEffect(() => {
    if (!slug) return;

    setDelayedLoading(true); // show loader during delay

    const timer = setTimeout(() => {
      
        dispatch(getSingleProductDetails({ slug }));

      setDelayedLoading(false); // delay finished, now rely on redux loading
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch, slug]);

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

  // Show loading during 5s delay OR API fetch
  if (delayedLoading || loading) {
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
      <div className="my-8 lg:my-10">
        <Paper pt="xl" px="xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-4/12">
              <Flex gap="md" direction={{ base: "column", lg: "row" }}>
                <IconBar favorite={product?.general?.addedToFavorite} data={product} />
                <Slider slides={product?.general.images} />
              </Flex>
            </div>
            <div className="lg:w-5/12">
              <SummaryEntry data={product} />
            </div>
            <div className="lg:w-3/12">
              <InfoSection/>
            </div>
          </div>
        </Paper>
        
        {supplier?.suppliers && supplier.suppliers.length > 0 && (
          <Sellers items={supplier.suppliers} />
        )}
        
        <Tab data={product} slug={slug} />
        <RelatedProducts dataRelatedProducts={product.relatedProducts} slug={slug} />
      </div>
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);

export default Product;
