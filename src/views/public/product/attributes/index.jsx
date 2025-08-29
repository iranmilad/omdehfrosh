import { ColorSwatch, Group, Select, Stack } from "@mantine/core";
import React from "react";
import { useProduct } from "..";

// Component to display each attribute (color swatches or select)
const Attribute = ({ id, label, slug, children }) => {
  
  const { options, setOptions } = useProduct();
  const isColor = slug === "color";

  // if (options.length === 0) return <></>;

  let selectedOption = options.find((item) => +item.attribute_id === +id);
  let selectedValue = selectedOption ? selectedOption.value : null;
  

  const handleChange = (val, childId) => {
    let newOptions = options.map((item) =>
      +item.attribute_id === +id ? { ...item, value: val, id: childId } : item
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
              onClick={child.selected ? () => handleChange(child.value, child.id) : undefined}
              style={{
                cursor: child.selected ? "pointer" : "not-allowed",
                border: selectedValue === child.value ? "3px solid #3d3d3d" : "none",
                opacity: child.selected ? 1 : 0.5,
                filter: child.selected ? "none" : "grayscale(50%)",
              }}
              title={child.selected ? child.label : `${child.label} (غیرقابل انتخاب)`}
            />
          ))}
        </Group>
      ) : (
        <Select
          data={children.map((child) => ({
            value: child.value,
            label: child.label,
            disabled: !child.selected,
          }))}
          value={selectedValue}
          onChange={(val) => {
            const selectedChild = children.find(item => item.value === val);
            if (selectedChild && selectedChild.selected) {
              handleChange(val, selectedChild.id);
            }
          }}
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