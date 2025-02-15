import React, { useCallback, useMemo, useState } from "react";
import { useData } from "../../../Libs/api";
import SlideCategory from "./SlideCategory";
import { Center, Loader, LoadingOverlay, Space, Stack, Tabs } from "@mantine/core";
import { shallowEqual } from "@mantine/hooks";
import qs from "qs";
import { useParams } from "react-router";

const SearchComponent = ({ filters, setNodes, }) => {
  const [searchType, setSearchType] = useState("brand"); // نوع جستجو: brand یا category
  const [brands, setBrands] = useState({ parent: [], categories: [] });
  const [category, setCategory] = useState({ parent: [], subCategory: [], brands: [] });
  const url = "/fastorder";
  const {id} = useParams();

  const changeFilters = useCallback(() => {
    let thisFilter = {};
    if (searchType === "brand") {
      thisFilter.searchType = searchType;
      thisFilter.parent = brands.parent;
      thisFilter.categories = brands.categories;
    } else if (searchType === "category") {
      thisFilter.searchType = "category";
      thisFilter.parent = category.parent;
      thisFilter.subCategory = category.subCategory;
      thisFilter.brands = category.brands;
    }
    thisFilter.filters = filters;
    if(id) thisFilter.userId = id;
    return {
      thisFilter,
      query: qs.stringify(thisFilter, {
        addQueryPrefix: true,
        arrayFormat: "comma",
      }),
    };
  }, [brands, category, searchType, filters]);

  const queryKey = changeFilters().query;

  // درخواست برای داده‌ها
  const { data, isLoading, isFetching } = useData({
    url,
    method: "POST",
    bodyData: changeFilters().thisFilter,
    queryKey: [url, queryKey],
    queryOptions: { staleTime: 30 * 10000 },
  });

  useMemo(() => {
    if (data) {
      setNodes(data.products);
    }
  }, [data]);

  return (
    <div>
        <LoadingOverlay pos="fixed" visible={isFetching || isLoading} zIndex={1000} h="100%" />
      <Tabs styles={{ panel: { marginTop: "20px" } }} variant="pills" defaultValue="brand" value={searchType} onChange={setSearchType} pos="relative">
        <Tabs.List>
          <Tabs.Tab value="brand">جستجو بر اساس برند</Tabs.Tab>
          <Tabs.Tab value="category">جستجو بر اساس دسته بندی</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="brand">
          {!isLoading && !isFetching && searchType === "brand" ? (
            <>
              {data && <SlideCategory tab={brands} items={data.brands} clickType="parent" click={setBrands} />}
              <Space h={20} />
              {data?.categories && <SlideCategory tab={brands} items={data.categories} clickType="categories" click={setBrands} />}
            </>
          ) : null}
        </Tabs.Panel>
        <Tabs.Panel value="category">
          {isLoading && <Center><Loader /></Center>}
          {!isLoading && !isFetching && searchType === "category" ? (
            <>
              {data ? <SlideCategory tab={category} items={data.category} clickType="parent" click={setCategory} /> : null}
              <Space h={20} />
              {data?.subCategory && <SlideCategory tab={category} items={data.subCategory} clickType="subCategory" click={setCategory} />}
              <Space h={20} />
              {data?.brands && <SlideCategory tab={category} items={data.brands} clickType="brands" click={setCategory} />}
            </>
          ) : null}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};


export default SearchComponent;
