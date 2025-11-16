import { useState, useEffect } from "react";
import { Button, Text } from "@mantine/core";
import { FaTimes, FaRedo } from "react-icons/fa";
import { FaRotate } from "react-icons/fa6";
import { FcRotateToLandscape } from "react-icons/fc";

// Helper functions to set/get cookies
function setCookie(name, value, seconds) {
  const d = new Date();
  d.setTime(d.getTime() + seconds * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function RotateModal({ isPortrait }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only check when component mounts or when isPortrait changes
    if (isPortrait) {
      const lastShown = getCookie("rotateModalLastShown");
      const now = new Date().getTime();
      
      if (!lastShown || (now - parseInt(lastShown)) >= 10000) {
        // Show modal if never shown before OR if 30 minutes have passed since last shown
        setShowModal(true);
        setCookie("rotateModalLastShown", now.toString(), 86400); // Cookie valid for 24 hours
      }
    } else {
      // Hide modal when not in portrait
      setShowModal(false);
    }
  }, [isPortrait]); // Only runs when isPortrait changes or on mount

  const handleClose = () => {
    setShowModal(false);
    // Update the last shown time when manually closed
    setCookie("rotateModalLastShown", new Date().getTime().toString(), 86400);
  };

  if (!showModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >

<div
  style={{
    background: "white",
    padding: "16px 24px",
    borderRadius: "12px",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  }}
>
  {/* Row: Icon + Text */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    <Button
      variant="subtle"
      color="purple"
      onClick={handleClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        flexShrink: 0,
      }}
    >
      <FcRotateToLandscape size={26} />
    </Button>

    <Text style={{ fontSize: "14px" }}>
      برای تجربه بهتر لطفا از حالت صفحه نمایش افقی استفاده کنید
    </Text>
  </div>

  {/* Bottom Close Button */}
  <Button
    variant="light"
    // color="gray"
    fullWidth
    onClick={handleClose}
    style={{ maxWidth: "200px" }}
  >
    بستن
  </Button>
</div>



    </div>
  );
}

export default RotateModal;