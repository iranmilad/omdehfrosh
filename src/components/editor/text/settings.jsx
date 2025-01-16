import React, { useEffect } from "react";
import ToolbarItem from "../toolbar/toolbarItem";
import { useDispatch } from "react-redux";
import { setTitle } from "../../../redux/editor";
import ToolbarSection from "../toolbar/toolbarSection";

function TextSettings() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setTitle("عنوان"))
    return
  },[])
  return (
    <>
      <ToolbarItem propKey="text" type="wysiwyg" label="متن عنوان" />
      <ToolbarItem propKey="fontSize" type="number" label="سایز فونت" />
      <ToolbarItem
        propKey="fontWeight"
        type="select"
        label="وزن فونت"
        data={[
          { label: "100", value: '100' },
          { label: "200", value: '200' },
          { label: "300", value: '300' },
          { label: "400", value: '400' },
          { label: "500", value: '500' },
          { label: "600", value: '600' },
          { label: "700", value: '700' },
          { label: "800", value: '800' },
          { label: "900", value: '900' },
        ]}
        defaultValue="500"
      />
      <ToolbarItem propKey="color" type="color" label="رنگ" />
    </>
  );
}

export default TextSettings;
