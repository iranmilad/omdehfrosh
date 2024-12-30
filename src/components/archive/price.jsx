import { useState } from "react";
import PaperCollpase from "../PaperCollapse";
import { Stack, NumberInput, RangeSlider,NumberFormatter } from "@mantine/core";
import Tooman from "../tooman";

function Price(props) {
    const [price, setPrice] = useState(props.price);
  return (
    <PaperCollpase title="قیمت">
      {price ? (
        <Stack>
          <NumberInput
            hideControls
            dir="ltr"
            leftSection={<span style={{ fontSize: "14px" }}>از</span>}
            rightSection={<Tooman />}
            value={price[0]}
            styles={{
              input: {
                paddingLeft: "24px",
                direction: "ltr",
                textAlign: "start",
              },
            }}
            thousandSeparator
            onChange={(val) => setPrice((price) => [val, price[1]])}
          />
          <NumberInput
            hideControls
            dir="ltr"
            leftSection={<span style={{ fontSize: "14px" }}>تا</span>}
            rightSection={<Tooman />}
            value={price[1]}
            styles={{
              input: {
                paddingLeft: "24px",
                direction: "ltr",
                textAlign: "start",
              },
            }}
            thousandSeparator
            onChange={(val) => setPrice((price) => [price[0], val])}
          />
          <RangeSlider
            value={price}
            min={0}
            step={500_000}
            max={20_000_000}
            label={(val) => <NumberFormatter value={val} thousandSeparator />}
            onChange={setPrice}
          />
        </Stack>
      ) : null}
    </PaperCollpase>
  );
}

export default Price;
