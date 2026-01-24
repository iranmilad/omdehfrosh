import React from "react";
import { SimpleGrid } from "@mantine/core";
import { shallowEqual } from "react-redux";
import ProductBox from "../productBox";
import ProductBoxCompare from "../productBoxCompare";

const ProductList = React.memo(({ products, onSelectProduct }) => {
  
    return (
      <SimpleGrid 
        cols={{ base: 1, xs: 2, sm: 3, md: 3, lg: 4 }} 
        spacing={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
        mb={{ base: "md", md: "xl" }} 
        mt={{ base: "sm", md: "md" }}
      >
        {products?.map((item, index) => (
          <ProductBoxCompare onSelectProduct={onSelectProduct} key={index} {...item} />
        ))}
      </SimpleGrid>
    );
  }, (prev, next) => {
    return shallowEqual(prev, next)
  });
  

export default ProductList