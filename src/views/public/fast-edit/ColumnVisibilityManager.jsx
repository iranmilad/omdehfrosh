// ColumnVisibilityManager.jsx
import React, { useState } from 'react';
import { Modal, Stack, Checkbox, Button, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

/**
 * ColumnVisibilityManager - Component for managing table column visibility
 * 
 * @param {Array} columns - Array of column objects with {key, label, width}
 * @param {Array} visibleColumns - Array of column keys that are currently hidden
 * @param {Function} setVisibleColumns - State setter for visibleColumns
 * @param {Object} buttonProps - Optional props to customize the trigger button
 */
function ColumnVisibilityManager({ 
  columns, 
  visibleColumns, 
  setVisibleColumns,
  buttonProps = {}
}) {
  const [opened, setOpened] = useState(false);

  const handleVisibleColumnsChange = (event, columnKey) => {
    const isChecked = event.target.checked;
    setVisibleColumns((prev) =>
      isChecked
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  return (
    <>
      <Button
        leftSection={<IconSettings size={16} />}
        onClick={() => setOpened(true)}
        py={0}
        styles={{
          root: {
            backgroundColor: '#093572',
            color: 'white',
            '&:hover': {
              backgroundColor: '#0a4080',
            },
          },
        }}
        {...buttonProps}
      >
       ستون‌ها
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="نمایش دادن ستون‌ها"
        zIndex={1100}
      >
        <Stack>
          {columns.map((column) => (
            <Checkbox
              key={column.key}
              label={column.label}
              checked={!visibleColumns.includes(column.key)}
              onChange={(event) => handleVisibleColumnsChange(event, column.key)}
            />
          ))}
        </Stack>
      </Modal>
    </>
  );
}

export default ColumnVisibilityManager;