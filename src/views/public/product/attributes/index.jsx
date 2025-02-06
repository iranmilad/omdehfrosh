import React from 'react'


import { useState } from "react";
import { ColorSwatch, Group, Select, Stack } from "@mantine/core";

const colorMap = {
  pink: "#FFC0CB",
  red: "#FF0000",
  آبي: "#0000FF",
  سبز: "#008000",
};

// Component to display each attribute (color swatches or select)
const Attribute = ({ id, label, slug, children }) => {
    console.log(slug)
  const isColor = slug === "color";
  const [selectedValue, setSelectedValue] = useState(children?.[0]?.value || "");

  return (
    <div>
      <label style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>
        {label}
      </label>

      {isColor ? (
        <Group>
          {children.map((child) => (
            <ColorSwatch
              key={child.id}
              color={child.value || "#CCC"} // Default to gray if not in map
              onClick={() => setSelectedValue(child.value)}
              style={{
                cursor: "pointer",
                border: selectedValue === child.value ? "3px solid #3d3d3d" : "none",
              }}
            />
          ))}
        </Group>
      ) : (
        <Select
          data={children.map((child) => ({ value: child.value, label: child.label }))}
          value={selectedValue}
          onChange={setSelectedValue}
          placeholder="یک گزینه انتخاب کنید"
          w={{base: "100%",md:"50%"}}
        />
      )}
    </div>
  );
};

function Attributes({items}) {
  return (
    <Stack>
        {items.map((item,index) => <Attribute {...item} />)}
    </Stack>
  )
}

export default Attributes