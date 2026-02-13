import { useState, useEffect } from "react";
import { Text } from "@mantine/core";

function RotateModal({ isPortrait, onClose }) {
  const [dismissed, setDismissed] = useState(false);

  // When user rotates back to portrait, show the modal again
  useEffect(() => {
    if (isPortrait) setDismissed(false);
  }, [isPortrait]);

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
    else setDismissed(true);
  };

  // Always show modal when in portrait mode (unless user dismissed it)
  if (!isPortrait || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        pointerEvents: "all", // Block all clicks behind
      }}
    >
      <div
        style={{
          position: "relative",
          background: "white",
          padding: "32px 24px",
          borderRadius: "16px",
          maxWidth: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="بستن"
          style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: "none",
              borderRadius: "8px",
              background: "transparent",
              color: "#666",
              cursor: "pointer",
            }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        {/* Large SVG Icon */}
        <div
          style={{
            width: "140px",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <img
            src="/uploads/fasticons/rotate.svg"
            alt="Rotate Screen"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Text */}
        <Text
          style={{
            fontSize: "20px",
            fontWeight: 600,
            textAlign: "center",
            color: "#1a1a1a",
            lineHeight: "1.8",
          }}
        >
          لطفا صفحه نمایش را بچرخانید
        </Text>

        {/* Subtle hint text */}
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 400,
            textAlign: "center",
            color: "#666",
            lineHeight: "1.5",
          }}
        >
          برای استفاده از این صفحه، گوشی خود را به حالت افقی بچرخانید
        </Text>

        <style>
          {`
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.05);
                opacity: 0.8;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default RotateModal;