// utils/errors.js

const knownErrorStatuses = [
    400, 401, 403, 404, 405, 406, 408, 409,
    410, 411, 412, 413, 414, 415, 416, 417,
    422, 429,
  ];
  
  export const handleKnownErrors = (status, setModalOpen, navigate) => {
    const code = Number(status);
  
    if (knownErrorStatuses.includes(code)) {
      setModalOpen(true);
  
      setTimeout(() => {
        setModalOpen(false);
  
        if (code === 401 && typeof navigate === "function") {
          navigate("/"); // navigate after modal closes
        }
      }, 5000);
    }
  };
  
  export const isUnknownError = (status) => {
    return status && !knownErrorStatuses.includes(Number(status));
  };
  