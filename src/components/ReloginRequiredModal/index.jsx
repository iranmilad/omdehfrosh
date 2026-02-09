import { useEffect } from "react";
import { Modal, Text } from "@mantine/core";

const MODAL_Z = 10010;
const AUTO_REDIRECT_SECONDS = 5;

/**
 * Modal shown when token is expired or server returns 401.
 * Auto-redirects to /login after 5 seconds. No button, no icon.
 */
const ReloginRequiredModal = ({ opened, onClose }) => {
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      if (typeof onClose === "function") onClose();
      window.location.replace("/login");
    }, AUTO_REDIRECT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [opened, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          نیاز به ورود مجدد
        </Text>
      }
      radius="md"
      centered
      overlayProps={{ blur: 3, opacity: 0.45 }}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      lockScroll={false}
      removeScrollBar={false}
      zIndex={MODAL_Z}
      styles={{
        root: { zIndex: MODAL_Z },
        inner: { zIndex: MODAL_Z },
        overlay: { zIndex: MODAL_Z - 1 },
        content: { maxHeight: "85vh", display: "flex", flexDirection: "column" },
        body: { overflowY: "auto", flex: "1 1 auto", minHeight: 0 },
      }}
    >
      <Text size="md" c="dimmed">
        زمان حضور به پایان رسیده است. لطفا دوباره وارد سایت شوید. (پس از {AUTO_REDIRECT_SECONDS} ثانیه به صفحه ورود منتقل می‌شوید)
      </Text>
    </Modal>
  );
};

export default ReloginRequiredModal;
