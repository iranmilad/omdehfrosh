import { Group, Select, Stack, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import React from "react";
import { useProduct } from "..";

const SIZE_PX = 39;
const BORDER_UNSELECTED = "1.5px solid #d1d5db";
const BORDER_SELECTED = "3.5px solid #19bfd3";
const RING_PADDING = 4;

// 39×39px color circle: unselected = grey border + white ring; selected = turquoise border + white checkmark
const ColorOption = ({ color, selected, disabled, onClick, label }) => {
  const bg = color || "#CCC";
  return (
    <Tooltip
      label={disabled ? `${label} (غیرقابل انتخاب)` : label}
      withArrow
      openDelay={200}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-label={label}
        onClick={disabled ? undefined : onClick}
        style={{
          width: SIZE_PX,
          height: SIZE_PX,
          padding: 0,
          margin: 0,
          border: selected ? BORDER_SELECTED : BORDER_UNSELECTED,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          filter: disabled ? "grayscale(50%)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: SIZE_PX - RING_PADDING * 2,
            height: SIZE_PX - RING_PADDING * 2,
            borderRadius: "50%",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          {selected && (
            <IconCheck
              size={20}
              color="#fff"
              strokeWidth={3}
              style={{ display: "block" }}
            />
          )}
        </span>
      </button>
    </Tooltip>
  );
};

// Component to display each attribute (color swatches or select)
const Attribute = ({ id, label, slug, children }) => {
  const { options, setOptions } = useProduct();
  const isColor = slug === "color";

  let selectedOption = options.find((item) => +item.attribute_id === +id);
  let selectedValue = selectedOption ? selectedOption.value : null;

  const handleChange = (val, childId) => {
    const newOptions = options.map((item) =>
      +item.attribute_id === +id ? { ...item, value: val, id: childId } : item
    );
    setOptions(newOptions);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}
      >
        {label}
      </label>
      {isColor ? (
        <Group gap="xs" wrap="wrap">
          {children.map((child, index) => (
            <ColorOption
              key={index}
              color={child.value || "#CCC"}
              selected={selectedValue === child.value}
              disabled={!child.selected}
              onClick={() => handleChange(child.value, child.id)}
              label={child.label}
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
          w={{ base: "100%", md: "100%" }}
          style={{ maxWidth: "100%" }}
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