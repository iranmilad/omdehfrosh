// ColumnVisibilityManager.jsx
import React, { useState } from 'react';
import { Modal, Stack, Checkbox, Button, Group } from '@mantine/core';
import { IconColumns } from '@tabler/icons-react';

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
        size="xs"
        variant="light"
        onClick={() => setOpened(true)}
        {...buttonProps}
      >
        <IconColumns size={16} />
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
                removeScrollProps={{ removeScrollBar: false }}

        title="نمایش دادن ستون‌ها"
        zIndex={1100}
        styles={{
          header: {
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--mantine-color-body)',
            paddingBottom: 'var(--mantine-spacing-md)',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            margin: 0,
            marginTop: 0,
            paddingTop: 0,
          },
          title: {
            margin: 0,
            marginTop: 0,
            paddingTop: 0,
          },
          body: {
            paddingTop: 'var(--mantine-spacing-md)',
            paddingBottom: 'var(--mantine-spacing-lg)',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: 0,
          },
          content: {
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
          },
          inner: {
            padding: 0,
          }
        }}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Stack gap="sm" pb="xs">
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