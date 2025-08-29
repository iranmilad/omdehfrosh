import React, { useState } from 'react';
import { useData } from "../../../Libs/api";
import { useFastOrder } from ".";
import SearchComponent from './searchComponent';
import Filters from './filters';
import { useFilterContext } from './filterscontext';

const SearchWithFilters = () => {
  const { setFiltersValues } = useFastOrder();
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  const { setBrandsContext, setCategoryContext } = useFilterContext();
  
  // Handle brand updates from SearchComponent
  const handleBrandSelection = (brands) => {
    setSelectedBrands(brands); // Update selected brands in the parent state
  };

  const { data, isLoading, isFetching } = useData({
    url: "/fastorder",
    method: "POST",
    bodyData: {}, // Body data here
    queryKey: [], // Your queryKey setup
    queryOptions: { staleTime: 30 * 10000 },
  });

  // Whenever the data changes, update the context
  React.useEffect(() => {
    if (data) {
      setBrandsContext({ parent: data.brands, categories: data.categories });
      setCategoryContext({ parent: data.category, subCategory: data.subCategory, brands: data.brands });
    }
  }, [data, setBrandsContext, setCategoryContext]);

  return (
    <div>
      {/* Pass selected brands to SearchComponent */}
      <SearchComponent 
        selectedBrands={selectedBrands} 
        onBrandSelection={handleBrandSelection} 
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
      />
      
      {/* Pass selected brands to Filters component */}
      <Filters selectedBrands={selectedBrands} />
    </div>
  );
};

export default SearchWithFilters;
