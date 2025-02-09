import { Center, Flex, Loader, Paper } from "@mantine/core";
import { useIsFirstRender } from "@mantine/hooks";
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import InfoBox from "../../../components/InfoBox";
import { useData } from "../../../Libs/api";
import IconBar from "./iconBar";
import InfoSection from "./infoSection";
import RelatedProducts from "./relatedProducts";
import Slider from "./slider";
import SummaryEntry from "./summaryEntry";
import Tab from "./Tab";
import Sellers from "./sellers"

const ProductContext = createContext();

const Product = () => {
  const { slug } = useParams();
  const [options, setOptions] = useState([]);
  let supplier = null;
  const isFirstRender = useIsFirstRender();
  const { isLoading, data } = useData({
    url: `/product/${slug}`,
    queryKey: ["product", slug],
  });

  const combinations = data?.combinations || [];

  useEffect(() => {
    if(data?.combinations.length > 0){
      const selectedComb = data?.combinations.filter(item => item.selected)[0];
      setOptions(selectedComb.options);
    }
  },[isLoading])


  if(options.length > 0 || !data?.suppliers){
    const selectedOptionIds = options.map((option) => option.id);
    
    if(selectedOptionIds.length > 0){
      // Find matching combinations
      const matchingCombinations = data?.combinations.filter((combination) => {
        // Extract the IDs from the combination's options
        const combinationOptionIds = combination.options.map((option) => option.id);
    
        // Check if every selected option ID exists in the combination's options
        return selectedOptionIds.every((id) => combinationOptionIds.includes(id));
      });
      supplier = matchingCombinations[0] ? matchingCombinations[0].suppliers : [];
    }
  }

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (!isLoading && !data) return <InfoBox>چنین محصولی یافت نشد</InfoBox>;

  return (
    <ProductContext.Provider
      value={{ options, setOptions, combinations, isLoading, data, slug,supplier }}
    >
      <div className="my-8 lg:my-10">
        <Paper pt="xl" px="xl">
          <div className="flex flex-col lg:flex-row gap-24">
            <div className="lg:w-4/12">
              <Flex gap="md" direction={{ base: "column", lg: "row" }}>
                <IconBar favorite={data.general?.addedToFavorite} data={data} />
                <Slider slides={data.general.images} />
              </Flex>
            </div>
            <div className="lg:w-5/12">
              <SummaryEntry data={data} />
            </div>
            <div className="lg:w-3/12"><InfoSection  /></div>
          </div>
        </Paper>
        {supplier && <Sellers items={supplier} />}
        <Tab data={data} slug={slug} />
        <RelatedProducts slug={slug} />
      </div>
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);

export default Product;
