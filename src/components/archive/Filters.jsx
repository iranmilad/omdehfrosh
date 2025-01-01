import React from "react";
import { Paper, TextInput, Stack, Checkbox } from "@mantine/core";
import Price from "./price";
import PaperCollpase from "../PaperCollapse";
import { IconSearch } from "@tabler/icons-react";

const Filters = React.memo(({ data, form, handleDynamicChange, setSearch }) => {
  const dynamicFilters = data?.filters || [];

  return (
    <>
      <Paper>
        <TextInput
          variant="filled"
          styles={{ input: { height: 45 } }}
          rightSection={<IconSearch size={18} />}
          placeholder="جستجو محصول"
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>
      <Price
        priceRange={data?.price} // Pass price range from server
        onPriceChange={(updatedPrice) => {
          form.setFieldValue("price", updatedPrice); // Update form values
        }}
      />

      {dynamicFilters.map((filter, index) => (
        <PaperCollpase key={index} title={filter.title}>
          <Stack mt="xs">
            {filter.options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={form.values.dynamic[filter.key]?.includes(
                  option.value
                )}
                onChange={(e) => {
                  const currentValues = form.values.dynamic[filter.key] || [];
                  const updatedValues = e.target.checked
                    ? [...currentValues, option.value]
                    : currentValues.filter((val) => val !== option.value);
                  handleDynamicChange(filter.key, updatedValues);
                }}
              />
            ))}
          </Stack>
        </PaperCollpase>
      ))}
    </>
  );
});

export default Filters;
