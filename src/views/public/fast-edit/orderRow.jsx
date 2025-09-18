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
      flexDirection: 'column', 
      alignItems: 'center',
      minHeight: '24px',
      padding: 0,
      margin: 0,
      gap: '1px'
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
  let {type, attribute_name, value} = props;
  
  const renderAttribute = () => {
    switch (type) {
      case 'color':
        return (
          <Tooltip label={attribute_name} withArrow={false} position="top" offset={2}>
            <ColorSwatch size={16} color={value} style={{ margin: 0 }} />
          </Tooltip>
        );
      case 'warranty':
        return (
          <Tooltip label={attribute_name} withArrow={false} position="top" offset={2}>
            <IconShieldCheck size={16} style={{ margin: 0 }} />
          </Tooltip>
        );
      case 'material':
        return (
          <Tooltip label={attribute_name} withArrow={false} position="top" offset={2}>
            <IconKeyframeAlignCenter size={16} style={{ margin: 0 }} />
          </Tooltip>
        );
      default:
        // For any other type, show a generic attribute with minimal styling
        return (
          <Badge 
            size="xs" 
            variant="light" 
            style={{ 
              padding: '1px 4px', 
              margin: 0, 
              fontSize: '9px',
              height: '16px',
              lineHeight: '14px'
            }}
          >
            {value}
          </Badge>
        );
    }
  };

  return (
    <div style={{ padding: 0, margin: 0, lineHeight: 1 }}>
      {renderAttribute()}
    </div>
  );
}

export default OrderRow;