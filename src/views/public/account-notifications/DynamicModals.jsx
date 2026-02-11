import React from 'react';
import { Modal } from '@mantine/core';
import { Table, Text } from '@mantine/core';

const DynamicModal = ({ children, onClose, opened }) => {
  return (
    <Modal
      opened={opened}
      removeScrollProps={{ removeScrollBar: false }}
      onClose={onClose}
      centered
      size="lg"
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 10,
      }}
    >
      {children}
    </Modal>
  );
};

export default DynamicModal;
