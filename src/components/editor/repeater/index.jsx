import React, { useState } from "react";
import FieldRenderer from "../toolbar/fieldRenderer";
import { Accordion, Button, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { shallowEqual } from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function Repeater({ onChange, label, fields, ...props }) {
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    const newItem = fields.reduce((acc, field) => {
      acc[field.name] = ""; // Initialize each field by its name
      return acc;
    }, {});
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    if (onChange) onChange(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    if (onChange) onChange(updatedItems);
  };

  const handleFieldChange = (index, fieldName, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [fieldName]: value } : item
    );
    setItems(updatedItems);
    if (onChange) onChange(updatedItems);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return; // Dropped outside of a droppable area

    const updatedItems = [...items];
    const [removed] = updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, removed);
    setItems(updatedItems);
    if (onChange) onChange(updatedItems);
  };

  return (
    <div>
      <Text size="xs" mb="sm">
        {label}
      </Text>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="vertical">
          {(provided) => (
            <Accordion
              variant="separated"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {items.map((item, index) => (
                <Draggable key={index} draggableId={`item-${index}`} index={index}>
                  {(provided) => (
                    <Accordion.Item
                      value={`item-${index}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Accordion.Control>#{index + 1}</Accordion.Control>
                      <Accordion.Panel>
                        {fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} style={{ marginBottom: "10px" }}>
                            <FieldRenderer
                              {...field}
                              value={item[field.name]}
                              onChange={(value) =>
                                handleFieldChange(index, field.name, value)
                              }
                            />
                          </div>
                        ))}
                        <Button size="xs" h={35} color="red" onClick={() => handleRemoveItem(index)}>
                          <IconTrash size={16} />
                        </Button>
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Accordion>
          )}
        </Droppable>
      </DragDropContext>

      <Button size="xs" onClick={handleAddItem} mt="md">
        افزودن
      </Button>
    </div>
  );
}

const MemoizedRepeater = React.memo(Repeater, (prev, next) => !shallowEqual(prev, next));

export default MemoizedRepeater;
