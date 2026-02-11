import {
  Drawer,
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
  Skeleton,
  Title
} from "@mantine/core";
import { NavLink, useNavigate } from "react-router";
import { TextInput } from "@mantine/core";
import { IconSearch, IconClock, IconTrash, IconChevronLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { IconExternalLink, IconLayoutGridAdd, IconBuildingStore } from "@tabler/icons-react";
import InfoBox from "../InfoBox";
import { useDispatch, useSelector } from "react-redux";
import { getSearchResults } from "../../redux/search/searchActions";
import { clearSearchResults } from "../../redux/search/searchSlice.js"
import { IoChevronBack } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";



function MobileSearch({ opened, close }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 500);

  // Get search results from Redux
  const { results, loading, error } = useSelector((state) => state.search);



  // Results is already an object with products, brands, categories from the Redux slice
  // No transformation needed since the slice already parses it
  const transformedResults = results || { products: [], brands: [], categories: [] };

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debounced && debounced.length > 2) {
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



  // Skeleton Loading Component
  const SkeletonLoading = () => (
    <Box mt="xl">
      {/* Brands Skeleton */}
      <Text size="sm" fw={600} c="dimmed" mb="xs">برندها</Text>
      <SimpleGrid cols={2} spacing="xs" mb="xl">
        {[1, 2].map((i) => (
          <Paper key={i} p="md" radius="md" withBorder>
            <Skeleton height={16} width="70%" />
          </Paper>
        ))}
      </SimpleGrid>

      {/* Categories Skeleton */}
      <Text size="sm" fw={600} c="dimmed" mb="xs">دسته‌بندی‌ها</Text>
      <SimpleGrid cols={3} spacing="xs" mb="xl">
        {[1, 2, 3].map((i) => (
          <Paper key={i} p="md" radius="md" withBorder>
            <Skeleton height={16} width="60%" />
          </Paper>
        ))}
      </SimpleGrid>

      {/* Products Skeleton */}
      <Text size="sm" fw={600} c="dimmed" mb="xs">محصولات</Text>
      <Stack spacing="xs">
        {[1, 2, 3, 4].map((i) => (
          <Paper key={i} p="md" radius="md" withBorder>
            <Skeleton height={16} width="80%" />
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Drawer 
      opened={opened} 
      onClose={close}
      position="bottom"
      size="100%"
      withCloseButton={false}
      styles={{
        root: { zIndex: 1001 },
        inner: { zIndex: 1001 },
        overlay: { zIndex: 1001 },
        content: { height: '100%', zIndex: 1001 },
        body: { 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          zIndex: 1001
        }
      }}
    >

      {/* Search Input with جستجو and blue divider inside */}
      <Box px="md" mb="md" style={{ zIndex: 1001 }}>
      <TextInput
        leftSection={
          <GoArrowRight 
            size={24} 
            style={{ strokeWidth: 1, fontWeight: '300' }} 
            onClick={close}
          />
        }
        placeholder="جستجو"
        size="md"
        radius="md"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        styles={{
          root: { zIndex: 1001 },
          input: {
            border: "none",
            backgroundColor: "white",
            zIndex: 1001,
            "&::placeholder": {
              fontSize: "4px !important",  // force override
              opacity: 0.7,
            },
          }
        }}
      />


        <Box mb="xs" mt="">
        <Divider
          size="sm"
          color="blue.6"
          styles={{
            root: {
              opacity: 0.3,
              zIndex: 1001
            },
          }}
        />

        </Box>
      </Box>


      {/* Scrollable Content */}
      <ScrollArea flex={1} px="md" pb="md" style={{ zIndex: 1001 }}>
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
                  <Box style={{ zIndex: 1001 }}>
                    {/* Brands Section */}
                    {hasBrands && (
                      <Box mb="xl" style={{ zIndex: 1001 }}>
                        <Flex align="center" gap="xs" mb="xs">
                          <IconBuildingStore size={18} color="#868e96" />
                          <Text size="sm" fw={600} c="dimmed">برندها</Text>
                          <Badge size="xs" variant="light" color="gray">
                            {transformedResults.brands.length}
                          </Badge>
                        </Flex>
                        <SimpleGrid cols={2} spacing="xs">
                          {transformedResults.brands.map((item, index) => (
                            <Paper
                              key={item.id || index}
                              p="md"
                              radius="md"
                              withBorder
                              style={{ 
                                cursor: "pointer",
                                transition: 'all 0.2s',
                                zIndex: 1001,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }
                              }}
                              onClick={() => navgiateURL(`/brand/${item.slug || item.id}`)}
                            >
                              <Flex align="center" justify="space-between">
                                <Text size="sm" fw={500}>{item.name}</Text>
                                <IconExternalLink size={16} color="#868e96" />
                              </Flex>
                            </Paper>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Categories Section */}
                    {hasCategories && (
                      <Box mb="xl" style={{ zIndex: 1001 }}>
                        <Flex align="center" gap="xs" mb="xs">
                          <IconLayoutGridAdd size={18} color="#868e96" />
                          <Text size="sm" fw={600} c="dimmed">دسته‌بندی‌ها</Text>
                          <Badge size="xs" variant="light" color="gray">
                            {transformedResults.categories.length}
                          </Badge>
                        </Flex>
                        <SimpleGrid cols={3} spacing="xs">
                          {transformedResults.categories.map((item, index) => (
                            <Paper
                              key={item.id || index}
                              p="md"
                              radius="md"
                              withBorder
                              style={{ 
                                cursor: "pointer",
                                transition: 'all 0.2s',
                                zIndex: 1001
                              }}
                              onClick={() => navgiateURL(`/category/${item.slug || item.id}`)}
                            >
                              <Flex align="center" justify="space-between">
                                <Text size="xs" fw={500}>{item.name || item.title}</Text>
                                <IconExternalLink size={14} color="#868e96" />
                              </Flex>
                            </Paper>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Products Section */}
                    {hasProducts && (
                      <Box style={{ zIndex: 1001 }}>
                        <Flex align="center" gap="xs" mb="xs">
                          <IconSearch size={18} color="#868e96" />
                          <Text size="sm" fw={600} c="dimmed">محصولات</Text>
                          <Badge size="xs" variant="light" color="gray">
                            {transformedResults.products.length}
                          </Badge>
                        </Flex>
                        <Stack spacing="xs">
                          {transformedResults.products.map((item, index) => (
                            <Paper
                              key={item.id || index}
                              p="md"
                              radius="md"
                              withBorder
                              style={{ 
                                cursor: "pointer",
                                transition: 'all 0.2s',
                                zIndex: 1001
                              }}
                              onClick={() => navgiateURL(`/product/${item.slug || item.id}`)}
                            >
                              <Flex justify="space-between" align="center">
                                <Text size="sm" fw={500}>{item.name || item.title}</Text>
                                <IconExternalLink size={16} color="#868e96" />
                              </Flex>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box mt="xl" ta="center">
                    <IconSearch size={48} color="#ced4da" style={{ margin: '0 auto' }} />
                    <Text mt="md" c="dimmed" size="sm">
                      نتیجه‌ای یافت نشد
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      لطفاً عبارت دیگری را جستجو کنید
                    </Text>
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box mt="md">
            {/* Search History Section */}
            {/* <Flex align="center" gap="xs" mb="md">
              <IconClock size={18} color="#868e96" />
              <Text size="sm" fw={600} c="dimmed">جستجوهای اخیر</Text>
            </Flex> */}
            
            {/* <Box 
              p="xl" 
              ta="center"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '12px'
              }}
            >
              <Text size="sm" c="dimmed">
                هیچ جستجوی اخیری وجود ندارد
              </Text>
            </Box> */}
          </Box>
        )}
      </ScrollArea>
    </Drawer>
  );
}

export default MobileSearch;