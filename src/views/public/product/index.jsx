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

const ProductContext = createContext();

const Product = () => {
  const { slug } = useParams();
  const [options, setOptions] = useState({});
  const isFirstRender = useIsFirstRender();
  const { isLoading, data } = useData({
    url: `/product/${slug}`,
    queryKey: ["product", slug],
  });

  const combinations = data?.combinations || [];

  useEffect(() => {
    if(data?.combinations.length > 0){
      const firstCombination = combinations[0];
      const initialOptions = firstCombination.options.reduce((acc, option) => {
        acc[option.id] = option.value;
        return acc;
      }, {});
      setOptions(initialOptions);
    }
  },[isLoading])

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (!isLoading && !data) return <InfoBox>چنین محصولی یافت نشد</InfoBox>;

  return (
    <ProductContext.Provider
      value={{ options, setOptions, combinations, isLoading, data, slug }}
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
        {/* <Sellers items={data.sellers} /> */}
        <Tab data={data} slug={slug} />
        <RelatedProducts slug={slug} />
      </div>
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);

export default Product;
