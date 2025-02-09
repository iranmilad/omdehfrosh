import { ColorSwatch, Group, Select, Stack } from "@mantine/core";
import React from "react";
import { useProduct } from "..";

// Component to display each attribute (color swatches or select)
const Attribute = ({ id, label, slug, children }) => {
  const { options, setOptions } = useProduct();
  const isColor = slug === "color";

  if (options.length === 0) return <></>;

  let selectedValue = options.filter((item) => +item.attribute_id === +id)[0]
    .value;

  const handleChange = (val,childId) =>{
    let newOptions = options.map((item) =>
      +item.attribute_id === +id ? { ...item, value: val,id:childId} : item
    );
    setOptions(newOptions);
  }

  return (
    <div>
      <label
        style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}
      >
        {label}
      </label>
      {isColor ? (
        <Group>
          {children.map((child, index) => (
            <ColorSwatch
              key={index}
              color={child.value || "#CCC"}
              onClick={() => handleChange(child.value,child.id)}
              style={{
                cursor: "pointer",
                border:
                  selectedValue === child.value ? "3px solid #3d3d3d" : "none",
              }}
            />
          ))}
        </Group>
      ) : (
        <Select
          data={children.map((child) => ({
            value: child.value,
            label: child.label,
          }))}
          value={selectedValue}
          onChange={(val) => handleChange(val,children.filter(item => item.value === val)[0].id)}
          placeholder="یک گزینه انتخاب کنید"
          w={{ base: "100%", md: "50%" }}
        />
      )}
    </div>
  );
};

function Attributes({ items }) {
  return (
    <Stack>
      {items.map((item, index) => (
        <Attribute key={index} {...item} />
      ))}
    </Stack>
  );
}

export default Attributes;
