import React from "react";
import { SimpleGrid } from "@mantine/core";
import { shallowEqual } from "react-redux";
import ProductBox from "../productBox";

const ProductList = React.memo(({ products }) => {
  
    return (
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 3, lg: 4 }} my="xl">
        {products.map((item, index) => (
          <ProductBox key={index} {...item} />
        ))}
      </SimpleGrid>
    );
  },(prev,next) => {
    return shallowEqual(prev,next)
  });
  

export default ProductList