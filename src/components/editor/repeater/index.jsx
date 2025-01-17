import { Text, Accordion, TextInput, FileInput, Button } from "@mantine/core";
import { shallowEqual } from "@mantine/hooks";
import React, { useState } from "react";
import { EditorImage } from "../image";
import MemoizedImageHandler from "../toolbar/imageHandler";
import { IconTrash } from "@tabler/icons-react";
import AdvancedSearch from "../../advancedSearch";

function Repeater({ onChange, label, fields, ...props }) {
  const [items, setItems] = useState([]);

  // Add a new item to the repeater
  const handleAddItem = () => {
    const newItem = fields.reduce((acc, field) => {
      acc[field.name] = ""; // Initialize each field to an empty value
      return acc;
    }, {});
    setItems([...items, newItem]);
  };

  // Remove an item from the repeater
  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Handle changes in field values
  const handleFieldChange = (index, fieldName, value) => {
    const updatedItems = [...items];
    updatedItems[index][fieldName] = value;
    setItems(updatedItems);
    if (onChange) {
      onChange(updatedItems); // Pass the updated items to the parent component
    }
  };

  return (
    <div>
      <Text size="xs" mb="lg">
        {label}
      </Text>

      <Accordion variant="separated">
        {items.map((item, index) => (
          <Accordion.Item key={index} value={`item-${index}`}>
            <Accordion.Control>#{index + 1}</Accordion.Control>
            <Accordion.Panel>
              {fields.map((field) => (
                <div key={field.name} style={{ marginBottom: "10px" }}>
                  {field.type === "image" ? (
                    <MemoizedImageHandler
                      maxFiles={1}
                      items={['https://placehold.co/400']}
                      url="/upload"
                      maxSize={6 * 1024 * 1024}
                      {...props}
                    />
                  ) : null}
                  {field.type === "advancedSearch" ? (
                    <AdvancedSearch />
                  ) : null}
                </div>
              ))}
              <Button size="xs" h={35} color="red" onClick={() => handleRemoveItem(index)}>
                <IconTrash size={16} />
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Button size="xs" onClick={handleAddItem} mt="md">
        افزودن
      </Button>
    </div>
  );
}

const MemoizedRepeater = React.memo(Repeater, (prev, next) => {
  return !shallowEqual(prev, next);
});

export default MemoizedRepeater;
