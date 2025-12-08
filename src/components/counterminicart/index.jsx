import { ActionIcon, Button, Flex, Input, Loader } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const CounterMiniCart = ({ 
  productId, 
  seller, 
  combinationsID, 
  count, 
  max, 
  min = 1,
  onUpdate,
  onRemove,
  isLoading = false
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleIncrement = async () => {
    if (isUpdating || isLoading) return;
    
    const maxAllowed = max || 999;
    if (count < maxAllowed) {
      setIsUpdating(true);
      try {
        await onUpdate(count + 1);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDecrement = async () => {
    if (isUpdating || isLoading) return;
    
    if (count > min) {
      setIsUpdating(true);
      try {
        await onUpdate(count - 1);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // If at minimum, remove the item
      setIsUpdating(true);
      try {
        await onRemove();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSetMax = async () => {
    if (isUpdating || isLoading) return;
    
    const maxAllowed = max || 999;
    if (count < maxAllowed) {
      setIsUpdating(true);
      try {
        await onUpdate(maxAllowed);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleRemove = async () => {
    if (isUpdating || isLoading) return;
    
    setIsUpdating(true);
    try {
      await onRemove();
    } finally {
      setIsUpdating(false);
    }
  };

  const isActionDisabled = isUpdating || isLoading;
  const isAtMinimum = count <= min;
  const isAtMaximum = count >= (max || 999);

  return (
    <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
      {/* Counter controls */}
      <Flex 
        align="center" 
        gap={4}
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '4px 8px',
          backgroundColor: '#fff',
          flexShrink: 0
        }}
      >
        {/* Max button - only show when not at maximum */}
        {!isAtMaximum && (
          <Button 
            p={0} 
            px={6} 
            h={20} 
            variant="transparent" 
            size="xs"
            onClick={handleSetMax}
            disabled={isActionDisabled}
            style={{
              fontSize: '10px',
              fontWeight: 500,
              color: '#09346D',
              opacity: isActionDisabled ? 0.5 : 1,
              cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              flexShrink: 0
            }}
          >
            حداکثر
          </Button>
        )}

        {/* Plus button */}
        <ActionIcon
          size={24}
          radius="md"
          variant="filled"
          onClick={handleIncrement}
          disabled={isActionDisabled || isAtMaximum}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#09346D',
            opacity: isActionDisabled || isAtMaximum ? 0.5 : 1,
            cursor: isActionDisabled || isAtMaximum ? 'not-allowed' : 'pointer',
            border: 'none',
            flexShrink: 0
          }}
        >
          <IconPlus size={14} />
        </ActionIcon>

        {/* Count display */}
        <Input
          type="number"
          w={40}
          styles={{ 
            input: { 
              textAlign: "center",
              fontSize: '14px',
              fontWeight: 500,
              color: '#23254e',
              border: 'none',
              padding: 0
            } 
          }}
          variant="unstyled"
          value={count}
          readOnly
          px={0}
          style={{ flexShrink: 0 }}
        />

        {/* Minus/Delete button - changes icon when at minimum */}
        <ActionIcon
          size={24}
          radius="md"
          variant="filled"
          onClick={handleDecrement}
          disabled={isActionDisabled}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#09346D',
            opacity: isActionDisabled ? 0.5 : 1,
            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
            border: 'none',
            flexShrink: 0
          }}
        >
          {isAtMinimum ? <IconTrash size={14} /> : <IconMinus size={14} />}
        </ActionIcon>
      </Flex>
    </Flex>
  );
};

export default CounterMiniCart;