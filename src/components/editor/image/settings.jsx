import React from "react";
import ToolbarItem from "../toolbar/toolbarItem";

function ImageSettings() {
  return (
    <>
      <ToolbarItem propKey="src" type="image" maxFiles={1} />
      <ToolbarItem
        propKey="fit"
        type="select"
        label="نوع پوشش"
        data={[
          { label: "پیشفرض", value: "contain" }, // Default
          { label: "پوشش کامل", value: "cover" }, // Cover
          { label: "پر کردن", value: "fill" }, // Fill
          { label: "مقیاس به پایین", value: "scale-down" }, // Scale down
          { label: "هیچ", value: "none" }, // None
        ]}
      />
      <ToolbarItem type="unit" label="عرض" propKey="w" unit="%" />
      <ToolbarItem type="unit" label="طول" propKey="h" unit="%" />
      <ToolbarItem type="unit" label="شعاع کادر" propKey="radius" unit="px" />
    </>
  );
}

export default ImageSettings;
