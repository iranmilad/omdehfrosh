import React, { createContext, useContext, useState } from "react";

// Define the context
const FilterContext = createContext();

// Create a custom hook to use the context
export const useFilterContext = () => {
  return useContext(FilterContext);
};

// Create the Context Provider component
export const FilterProvider = ({ children }) => {
  const [brandsContext, setBrandsContext] = useState({ parent: [], categories: [] });
  const [categoryContext, setCategoryContext] = useState({ parent: [], subCategory: [], brands: [] });
  const [filtersContext, setFiltersContext] = useState({

      color: "all",
      province: "all",
      stockStatus: "yes", // Default: "موجود"
      minStock: "",
      deliveryTime: "",
      paymentType: "",
      supplier: "",
      sort: "bestPrice",
      priceFormat: "hezar",
      saleType: "cash", // Default: نقدی
      brands: [], // New field for brands

  });

  // Provide the context to children
  return (
    <FilterContext.Provider
      value={{
        brandsContext,
        setBrandsContext,
        categoryContext,
        setCategoryContext,
        filtersContext,
        setFiltersContext,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
