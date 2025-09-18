import React, { useState } from "react";
import Counter from "../../../components/counter";
import { useSend } from "../../../Libs/api";
import { Badge, Button, ColorSwatch, Group, Stack, Text, Tooltip, Center } from "@mantine/core";
import { CONTAINER_SIZES } from "../../../Libs/theme";
import { IconShield, IconShieldCheck, IconKeyframeAlignCenter, IconPackageOff } from "@tabler/icons-react";


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

// Default SVG component for when no attributes exist
const DefaultAttributesSVG = () => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 1 }}
  >
    <circle 
      cx="40" 
      cy="40" 
      r="30" 
      stroke="#000000" 
      strokeWidth="2" 
      strokeDasharray="4,4"
      fill="none"
    />
    <path 
      d="M30 40h20M40 30v20" 
      stroke="#000000" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* <text 
      x="40" 
      y="60" 
      textAnchor="middle" 
      fill="#adb5bd" 
      fontSize="10" 
      fontFamily="system-ui"
    >
      هیچ ویژگی‌ای وجود ندارد
    </text> */}
  </svg>
);

export function Attributes({items}){
  // Check if items exist and have length
  const hasAttributes = items && items.length > 0;

  return (
    <Center style={{ minHeight: '' }}>
      {hasAttributes ? (
        <Stack gap="" align="center">
          {items.map((it,index) => <Attribute key={index} {...it} />)}
        </Stack>
      ) : (
        <Stack gap="" align="center">
          <DefaultAttributesSVG />
          {/* <Text size="sm" c="dimmed" ta="center">
            هیچ ویژگی‌ای برای نمایش وجود ندارد
          </Text> */}
        </Stack>
      )}
    </Center>
  )
}

function Attribute (props){
  let {type, attribute_name, value} = props;
  
  const renderAttribute = () => {
    switch (type) {
      case 'color':
        return (
          <Group gap={0} justify="center" style={{ padding: 0, margin: 0 }}>
            <Tooltip label={attribute_name}>
              <ColorSwatch size="20" color={value} />
            </Tooltip>
          </Group>
        );
      case 'warranty':
        return (
          <Group gap={0} justify="center" style={{ padding: 0, margin: 0 }}>
            <Tooltip label={attribute_name}>
              <IconShieldCheck size={18} />
            </Tooltip>
          </Group>
        );
      case 'material':
        return (
          <Group gap={0} justify="center" style={{ padding: 0, margin: 0 }}>
            <Tooltip label={attribute_name}>
              <IconKeyframeAlignCenter size={18} />
            </Tooltip>
          </Group>
        );
      default:
        // For any other type, show a generic attribute
        return (
          <Group gap={0} justify="center" style={{ padding: 0, margin: 0 }}>
            <Badge size="sm" variant="light" style={{ padding: 0, margin: 0 }}>
              {attribute_name}: {value}
            </Badge>
          </Group>
        );
    }
  };

  return renderAttribute();
}

export default OrderRow;