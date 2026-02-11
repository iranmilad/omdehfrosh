// src\views\public\fast-edit\orderRow.jsx
import React, { useState } from "react";
import Counter from "../../../components/counter";
import { useSend } from "../../../Libs/api";
import { Badge, Button, ColorSwatch, Group, Stack, Text, Tooltip, Center } from "@mantine/core";
import { CONTAINER_SIZES } from "../../../Libs/theme";
import { IconShieldCheck, IconRuler, IconWeight, IconBox, IconTag, IconDimensions, IconPalette, IconTool } from "@tabler/icons-react";


function OrderRow({ id = 0, attributes, inventory = 2,seller, onReplace }) {
  const updateCart = useSend({ url: "/cart/update" });
  const [cart, setCart] = useState(0);


  const addToCart = (value, max) => {
    let val = value || cart + 1;
    updateCart.mutateAsync(
      { productId: id,attributes,seller:seller, count: val, max },
      {
        onSuccess: (data) => {
          if (!data.error) {
            if (data?.max) setCart(data.max);
            else setCart(val);
            onReplace(); // بعد از اضافه کردن، نود اصلی جایگزین شود
          }
        },
      }
    );
  };

  const removeCart = () => {
    updateCart.mutateAsync({productId:id,seller,count:0},{
      onSuccess: (data) =>{
        if(data.error){
        }
        else{
          setCart(0);
        }
      }
    })
  }

  return cart > 0 ? (
    <Counter value={cart} onChange={addToCart} count={cart} isPending={updateCart.isPending} removeCart={removeCart} />
  ) : (
    <Button disabled={inventory === 0} onClick={() => addToCart()} loading={updateCart.isPending} size="xs">
      انتخاب
    </Button>
  );
}

// Map hex color to Persian label (front-end only; no backend change)
const HEX_TO_PERSIAN_COLOR = {
  "#000000": "مشکی",
  "#000080": "آبی تیره",
  "#0000ff": "آبی",
  "#008000": "سبز تیره",
  "#00ff00": "سبز",
  "#00ffff": "فیروزه‌ای",
  "#808080": "خاکستری",
  "#800000": "قهوه‌ای تیره",
  "#800080": "بنفش",
  "#a52a2a": "قهوه‌ای",
  "#ff0000": "قرمز",
  "#ff00ff": "ارغوانی",
  "#ffa500": "نارنجی",
  "#ffff00": "زرد",
  "#ffffff": "سفید",
};
function getColorLabel(hex) {
  if (!hex || typeof hex !== "string") return hex;
  const normalized = hex.trim().toLowerCase().startsWith("#") ? hex.trim().toLowerCase() : "#" + hex.trim().toLowerCase();
  return HEX_TO_PERSIAN_COLOR[normalized] ?? hex;
}

// Minimized SVG component with reduced size and no text
const DefaultAttributesSVG = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.5 }}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke="#adb5bd" 
      strokeWidth="1" 
      strokeDasharray="2,2"
      fill="none"
    />
    <path 
      d="M8 12h8M12 8v8" 
      stroke="#adb5bd" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
  </svg>
);

export function Attributes({items}){
  // Check if items exist and have length
  const hasAttributes = items && items.length > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '20px',
      padding: 0,
      margin: 0,
      gap: '8px',
      flexWrap: 'nowrap'
    }}>
      {hasAttributes ? (
        items.map((it,index) => <Attribute key={index} {...it} />)
      ) : (
        <DefaultAttributesSVG />
      )}
    </div>
  )
}


function Attribute (props){
  let { type, attribute_name, value, label } = props;
  const [opened, setOpened] = useState(false);


  const getIconForType = () => {
    switch (type?.toLowerCase()) {
      case 'color':
      case 'رنگ':
        return (
          <Tooltip 
            label={`رنگ: ${props.label || getColorLabel(value)}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <ColorSwatch 
              size={20} 
              color={value} 
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            />
          </Tooltip>
        );

      case 'warranty':
      case 'گارانتی':
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconShieldCheck size={20} color="#228be6" stroke={1.5} />
            </div>
          </Tooltip>
        );

      case 'material':
      case 'جنس':
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconBox size={20} color="#7950f2" stroke={1.5} />
            </div>
          </Tooltip>
        );

      case 'size':
      case 'اندازه':
      case 'سایز':
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconRuler size={20} color="#f59f00" stroke={1.5} />
            </div>
          </Tooltip>
        );

      case 'weight':
      case 'وزن':
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconWeight size={20} color="#12b886" stroke={1.5} />
            </div>
          </Tooltip>
        );

      case 'dimensions':
      case 'ابعاد':
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconDimensions size={20} color="#e64980" stroke={1.5} />
            </div>
          </Tooltip>
        );

      default:
        return (
          <Tooltip 
            label={`${attribute_name}: ${value}`} 
            position="top" 
            withArrow
            opened={opened}
            onClick={() => setOpened(!opened)}
            onMouseEnter={() => setOpened(true)}
            onMouseLeave={() => setOpened(false)}
          >
            <div 
              style={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={() => setOpened(!opened)}
            >
              <IconTag size={20} color="#868e96" stroke={1.5} />
            </div>
          </Tooltip>
        );
    }
  };

  return (
    <div style={{ padding: 0, margin: 0, lineHeight: 1, display: 'inline-flex' }}>
      {getIconForType()}
    </div>
  );
}


export default OrderRow;