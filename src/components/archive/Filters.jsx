import React, { useState } from 'react';
import { Paper, TextInput, Stack, Checkbox, Drawer, Button, LoadingOverlay } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import Price from './price'
import PaperCollpase from '../PaperCollapse';

const Filters = React.memo(({ 
  isFetching,
  data, 
  form, 
  handleDynamicChange, 
  setSearch, 
  setPage, 
  filterDisclosure,
  handlePriceChange // This prop should now properly dispatch to Redux
}) => {
  const dynamicFilters = data?.filters || [];

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // Updated to use the passed handlePriceChange which dispatches to Redux
  const onPriceChange = (updatedPrice) => {
    handlePriceChange(updatedPrice); // This will now dispatch to Redux
  };

  const handleFilterChange = (filterKey, optionValue, checked) => {
    const currentValues = form.values.dynamic[filterKey] || [];
    const updatedValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((val) => val !== optionValue);
    handleDynamicChange(filterKey, updatedValues);
  };

  return (
    <>
      {/* Desktop view */}
      <Paper h={83} display="flex" style={{ alignItems: "center" }}>
        <TextInput
          w="100%"
          variant="filled"
          styles={{ input: { height: 45 } }}
          rightSection={<IconSearch size={18} />}
          placeholder="جستجو محصول"
          onChange={handleSearchChange}
        />
      </Paper>
      <Price
        priceRange={data?.price}
        onPriceChange={onPriceChange}
      />

      {dynamicFilters.map((filter, index) => (
        <PaperCollpase key={index} title={filter.title}>
          <Stack mt="xs">
            {filter.options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={form.values.dynamic[filter.key]?.includes(option.value)}
                onChange={(e) => handleFilterChange(filter.key, option.value, e.target.checked)}
              />
            ))}
          </Stack>
        </PaperCollpase>
      ))}

      {/* Mobile Drawer */}
      <Drawer
        opened={filterDisclosure[0]}
        onClose={filterDisclosure[1].close}
        title="فیلترها"
        size="100%"
        position="right"
      >
        <LoadingOverlay visible={isFetching} />
        <Stack>
        <Paper h={83} display="flex" style={{ alignItems: "center" }}>
          <TextInput
            w="100%"
            variant="filled"
            styles={{ input: { height: 45 } }}
            rightSection={<IconSearch size={18} />}
            placeholder="جستجو محصول"
            onChange={handleSearchChange}
          />
        </Paper>
        <Price
          priceRange={data?.price}
          onPriceChange={onPriceChange}
        />

        {dynamicFilters.map((filter, index) => (
          <PaperCollpase key={index} title={filter.title}>
            <Stack mt="xs">
              {filter.options.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={form.values.dynamic[filter.key]?.includes(option.value)}
                  onChange={(e) => handleFilterChange(filter.key, option.value, e.target.checked)}
                />
              ))}
            </Stack>
          </PaperCollpase>
        ))}
        </Stack>
      </Drawer>
    </>
  );
});

export default Filters;