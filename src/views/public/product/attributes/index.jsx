import { ColorSwatch, Group, Select, Stack } from "@mantine/core";
import React from 'react';
import { useProduct } from "..";

// Component to display each attribute (color swatches or select)
const Attribute = ({ id, label, slug, children }) => {
  const { options, setOptions } = useProduct();
  const isColor = slug === "color";
  // const selectedValue = options[id] || children?.[0]?.value || "";

  // const selectedValue = children.find((item) => {
  //   console.log(item.id);
  //   return options[item.id] ?? item.value
  // });
  let selectedValue = children.find((item) => {
    return options[item.id] 
  }) || ""

  const handleChange = (value) => {
    setOptions((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <label style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>
        {label}
      </label>
      {isColor ? (
        <Group>
          {children.map((child, index) => (
            <ColorSwatch
              key={index}
              color={child.value || "#CCC"}
              onClick={() => handleChange(child.value)}
              style={{
                cursor: "pointer",
                border: selectedValue.value === child.value ? "3px solid #3d3d3d" : "none",
              }}
            />
          ))}
        </Group>
      ) : (
        <Select
          data={children.map((child) => ({ value: child.value, label: child.label }))}
          value={selectedValue.value}
          onChange={handleChange}
          placeholder="یک گزینه انتخاب کنید"
          w={{ base: "100%", md: "50%" }}
        />
      )}
    </div>
  );
};

function Attributes({items}) {
  return (
    <Stack>
        {items.map((item,index) => <Attribute key={index} {...item} />)}
    </Stack>
  )
}

export default Attributes