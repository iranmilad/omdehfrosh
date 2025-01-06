import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import PaperCollpase from "../PaperCollapse";
import { Stack, NumberInput, RangeSlider, Button } from "@mantine/core";
import Tooman from "../tooman";

function Price({ priceRange, onPriceChange }) {
  const maxPrice = priceRange?.max || 20000000; // Default max price
  const minPrice = priceRange?.min || 0; // Default min price

  // Local state for price range
  const [price, setPrice] = useState([minPrice, maxPrice]);

  const submitPrice = () => {
    console.log(price)
  }

  return (
    <PaperCollpase title="قیمت">
      <Stack>
        <NumberInput
          hideControls
          dir="ltr"
          leftSection={<span style={{ fontSize: "14px" }}>از</span>}
          rightSection={<Tooman />}
          value={price[0] ?? minPrice} // Ensure value is defined
          styles={{
            input: {
              paddingLeft: "24px",
              direction: "ltr",
              textAlign: "start",
            },
          }}
          thousandSeparator
          onChange={(val) => setPrice([val || minPrice, price[1]])}
        />
        <NumberInput
          hideControls
          dir="ltr"
          leftSection={<span style={{ fontSize: "14px" }}>تا</span>}
          rightSection={<Tooman />}
          value={price[1] ?? maxPrice} // Ensure value is defined
          styles={{
            input: {
              paddingLeft: "24px",
              direction: "ltr",
              textAlign: "start",
            },
          }}
          thousandSeparator
          onChange={(val) => setPrice([price[0], val || maxPrice])}
        />
        <RangeSlider
          value={[price[0] ?? minPrice, price[1] ?? maxPrice]} // Ensure value is defined
          min={minPrice}
          step={500_000}
          max={maxPrice}
          label={(val) => `${val.toLocaleString()} تومان`}
          onChange={setPrice}
        />
        <Button h={35} size="xs" radius={99999} w="max-content" onClick={submitPrice}>فیلتر</Button>
      </Stack>
    </PaperCollpase>
  );
}

export default Price;
