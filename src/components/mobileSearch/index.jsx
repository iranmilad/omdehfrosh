import {
  Center,
  Drawer,
  Loader,
  Text,
  Box,
  Flex,
  SimpleGrid,
  Paper,
  Divider,
  Stack,
  ActionIcon,
  Group,
  ScrollArea,
  Badge,
  Skeleton
} from "@mantine/core";
import { NavLink, useNavigate } from "react-router";
import { TextInput } from "@mantine/core";
import { IconSearch, IconClock, IconTrash, IconChevronLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { IconExternalLink, IconLayoutGridAdd, IconBuildingStore } from "@tabler/icons-react";
import InfoBox from "../InfoBox";
import { useDispatch, useSelector } from "react-redux";
import { getSearchResults } from "../../redux/search/searchActions";
import { clearSearchResults } from "../../redux/search/searchSlice.js"

function MobileSearch({ opened, close }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 500);
  
  // const [search, setSearch] = useLocalStorage({
  //   key: "search",
  //   defaultValue: [],
  // });

  // Get search results from Redux
  const { results, loading, error } = useSelector((state) => state.search);

  // Transform array structure to object structure
  const transformedResults = Array.isArray(results) 
    ? results.reduce((acc, item) => {
        if (item.searchResultName === 'product') {
          acc.products = item.products || [];
        } else if (item.searchResultName === 'brand') {
          acc.brands = item.brands || [];
        } else if (item.searchResultName === 'category') {
          acc.categories = item.categories || [];
        }
        return acc;
      }, {})
    : results || {};

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debounced && debounced.length > 2) {
      console.log('🔎 MobileSearch: Dispatching search for:', debounced);
      dispatch(getSearchResults({ query: debounced }));
    } else if (debounced.length === 0) {
      dispatch(clearSearchResults());
    }
  }, [debounced, dispatch]);

  const navgiateURL = (url) => {
    // Save to search history
    // if (value && value.length > 2 && !search.includes(value)) {
    //   setSearch([value, ...search].slice(0, 10)); // Keep last 10 searches
    // }
    
    navigate(url);
    setValue("");
    dispatch(clearSearchResults());
    close();
  };

  // Check if we have any results
  const hasProducts = transformedResults?.products?.length > 0;
  const hasCategories = transformedResults?.categories?.length > 0;
  const hasBrands = transformedResults?.brands?.length > 0;
  const hasResults = hasProducts || hasCategories || hasBrands;

  console.log('📱 MobileSearch Render:', {
    value,
    debounced,
    hasResults,
    loading,
    rawResults: results,
    transformedResults,
    productsCount: transformedResults?.products?.length || 0,
    categoriesCount: transformedResults?.categories?.length || 0,
    brandsCount: transformedResults?.brands?.length || 0
  });

  // Skeleton Loading Component
  const SkeletonLoading = () => (
    <Box mt="lg">
      {/* Brands Skeleton */}
      <Divider
        labelPosition="left"
        label={
          <>
            <Skeleton height={20} width={20} radius="sm" />
            <Skeleton height={16} width={60} mr="sm" />
          </>
        }
      />
      <SimpleGrid cols={2} mt="md">
        {[1, 2].map((i) => (
          <Paper key={i} shadow="none" withBorder p="md">
            <Flex align="center" justify="space-between">
              <Skeleton height={16} width="60%" />
              <Skeleton height={20} width={20} radius="sm" />
            </Flex>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Categories Skeleton */}
      <Divider
        mt="xl"
        labelPosition="left"
        label={
          <>
            <Skeleton height={20} width={20} radius="sm" />
            <Skeleton height={16} width={70} mr="sm" />
          </>
        }
      />
      <SimpleGrid cols={3} mt="md">
        {[1, 2, 3].map((i) => (
          <Paper key={i} shadow="none" withBorder p="md">
            <Flex align="center" justify="space-between">
              <Skeleton height={16} width="50%" />
              <Skeleton height={20} width={20} radius="sm" />
            </Flex>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Products Skeleton */}
      <Divider
        mt="xl"
        labelPosition="left"
        label={
          <>
            <Skeleton height={20} width={20} radius="sm" />
            <Skeleton height={16} width={70} mr="sm" />
          </>
        }
      />
      <Stack mt="md">
        {[1, 2, 3, 4].map((i) => (
          <Paper key={i} shadow="none" withBorder p="md">
            <Flex justify="space-between" align="center">
              <Skeleton height={16} width="70%" />
              <Skeleton height={20} width={20} radius="sm" />
            </Flex>
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Drawer title="جستجو" opened={opened} onClose={close}>
      <TextInput
        leftSection={<IconSearch />}
        placeholder="جستجو محصول مورد نظر"
        variant="filled"
        mb="md"
        styles={{ 
          input: { 
            height: 45,
            border: '2px solid #e9ecef',
            '&:focus': {
              borderColor: '#228be6'
            }
          } 
        }}
        value={value}
        onChange={(e) => {
          console.log('✏️ MobileSearch input changed:', e.target.value);
          setValue(e.target.value);
        }}
      />
      
      {debounced.length > 2 ? (
        <>
          {loading ? (
            <SkeletonLoading />
          ) : (
            <>
              {error ? (
                <InfoBox shadow="0" back={false}>
                  {error}
                </InfoBox>
              ) : hasResults ? (
                <Box mt="lg">
                  {/* Brands Section */}
                  {hasBrands && (
                    <>
                      <Divider
                        labelPosition="left"
                        label={
                          <>
                            <IconBuildingStore />
                            <Text mr="sm">برندها</Text>
                          </>
                        }
                      />
                      <SimpleGrid cols={2} mt="md">
                        {transformedResults.brands.map((item, index) => (
                          <Paper
                            key={item.id || index}
                            shadow="none"
                            withBorder
                            p="md"
                            style={{ cursor: "pointer" }}
                            onClick={() => navgiateURL(`/brand/${item.slug || item.id}`)}
                          >
                            <Flex align="center" justify="space-between">
                              <Text>{item.name}</Text>
                              <ActionIcon component={NavLink} variant="white">
                                <IconExternalLink />
                              </ActionIcon>
                            </Flex>
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </>
                  )}

                  {/* Categories Section */}
                  {hasCategories && (
                    <>
                      <Divider
                        mt={hasBrands ? "xl" : "0"}
                        labelPosition="left"
                        label={
                          <>
                            <IconLayoutGridAdd />
                            <Text mr="sm">دسته‌ها</Text>
                          </>
                        }
                      />
                      <SimpleGrid cols={3} mt="md">
                        {transformedResults.categories.map((item, index) => (
                          <Paper
                            key={item.id || index}
                            shadow="none"
                            withBorder
                            p="md"
                            style={{ cursor: "pointer" }}
                            onClick={() => navgiateURL(`/category/${item.slug || item.id}`)}
                          >
                            <Flex align="center" justify="space-between">
                              <Text>{item.name || item.title}</Text>
                              <ActionIcon component={NavLink} variant="white">
                                <IconExternalLink />
                              </ActionIcon>
                            </Flex>
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </>
                  )}

                  {/* Products Section */}
                  {hasProducts && (
                    <>
                      <Divider
                        mt="xl"
                        labelPosition="left"
                        label={
                          <>
                            <IconLayoutGridAdd />
                            <Text mr="sm">محصولات</Text>
                          </>
                        }
                      />
                      <Stack mt="md">
                        {transformedResults.products.map((item, index) => (
                          <Paper
                            style={{ cursor: "pointer" }}
                            key={item.id || index}
                            shadow="none"
                            withBorder
                            p="md"
                            onClick={() => navgiateURL(`/product/${item.slug || item.id}`)}
                          >
                            <Flex align="start" gap="sm">
                              <Flex justify="space-between" w="100%">
                                <Text>{item.name || item.title}</Text>
                                <ActionIcon variant="white">
                                  <IconExternalLink />
                                </ActionIcon>
                              </Flex>
                            </Flex>
                          </Paper>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              ) : (
                <InfoBox shadow="0" back={false}>
                  چیزی یافت نشد
                </InfoBox>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Search History */}
          <Group justify="space-between">
            <Flex gap="sm" c="gray" fw="600" align="center">
              <IconClock size={18} />
              <Text size="sm">آخرین جستجو های شما</Text>
            </Flex>
            {/* {search.length > 0 && (
              <ActionIcon
                size="sm"
                variant="light"
                color="gray"
                onClick={() => setSearch([])}
              >
                <IconTrash size={14} />
              </ActionIcon>
            )} */}
          </Group>
          <ScrollArea type="auto" mt="sm">
            <Group>
              {/* {search.map((item, index) => (
                <Badge
                  style={{ cursor: "pointer" }}
                  key={index}
                  onClick={() => {
                    setValue(item);
                    // The useEffect will trigger the search automatically
                  }}
                  size="lg"
                  variant="outline"
                  color="gray"
                  rightSection={<IconChevronLeft size={14} />}
                >
                  {item}
                </Badge>
              ))} */}
            </Group>
          </ScrollArea>
        </>
      )}
    </Drawer>
  );
}

export default MobileSearch;