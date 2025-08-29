export default function getTeamNameFromKey(key) {
    const map = {
      technical_support: "پشتیبانی فنی",
      customer_service: "خدمات مشتری",
      billing: "امور مالی",
      // Add more as needed
    };
    return map[key] || "تیم نامشخص";
  }
  