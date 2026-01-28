import { Modal, Text, Badge, Box, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const statusColors = {
  400: "orange",
  401: "red",
  403: "red",
  404: "gray",
  422: "yellow",
  500: "dark",
};

const ErrorMessageModal = ({ opened, onClose, status, message }) => {


  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
    >
      <Box>
        <Badge
          color={statusColors[status] || "gray"}
          variant="filled"
          size="lg"
          mb="sm"
        >
          {status}
        </Badge>

        <Text size="md" c="dimmed">
          {message || "خطای نامشخصی رخ داده است."}
        </Text>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
