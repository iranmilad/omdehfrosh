import { Modal, Text, Box, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const MODAL_Z = 10010;

const ErrorMessageModal = ({ opened, onClose, message }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      removeScrollProps={{ removeScrollBar: false }}
      title={
        <Group gap="xs">
          <IconAlertCircle size={20} color="red" />
          <Text fw={600} size="lg">
            خطا
          </Text>
        </Group>
      }
      radius="md"
      centered
      overlayProps={{ blur: 3, opacity: 0.45 }}
      withCloseButton={false}
      lockScroll={false}
      removeScrollBar={false}
      zIndex={MODAL_Z}
      styles={{
        root: { zIndex: MODAL_Z },
        inner: { zIndex: MODAL_Z },
        overlay: { zIndex: MODAL_Z - 1 },
        content: {
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        },
        body: { overflowY: "auto", flex: "1 1 auto", minHeight: 0 },
      }}
    >
      <Box>
        <Text size="md" c="dimmed">
          {message || "خطای نامشخصی رخ داده است."}
        </Text>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
