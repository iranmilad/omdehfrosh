export default function fakeTokenDecode(token) {
  if (!token) return {};

  try {
    // Split JWT into parts
    const base64Url = token.split(".")[1];
    if (!base64Url) return {};

    // Convert from base64url to JSON string
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    // Parse payload
    const decoded = JSON.parse(jsonPayload);

    // You had id + role in your token
    return {
      supplierId: decoded.id ?? null,
      supplierName: decoded.name ?? null,
      role: decoded.role ?? null,
    };
  } catch (e) {
    console.error("Invalid token", e);
    return {};
  }
}
