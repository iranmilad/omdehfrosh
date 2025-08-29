import { useState, useEffect } from "react";
import { Button, Text } from "@mantine/core";
import { FaTimes, FaRedo } from "react-icons/fa";

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
          padding: "20px 30px",
          borderRadius: "12px",
          position: "relative",
          textAlign: "center",
          maxWidth: "90%",
        }}
      >
        <Button
          variant="subtle"
          color="red"
          style={{ position: "absolute", top: 8, right: 8 }}
          onClick={handleClose}
        >
          <FaTimes />
        </Button>
        
        <FaRedo size={30} color="red" style={{ marginBottom: "10px" }} />
        
        <Text style={{ fontSize: "14px" }}>
          برای تجربه بهتر لطفا از حالت صفحه نمایش افقی استفاده کنید
        </Text>
      </div>
    </div>
  );
}

export default RotateModal;