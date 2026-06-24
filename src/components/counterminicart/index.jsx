import { ActionIcon, Button, Flex, Input, Loader } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const CounterMiniCart = ({
  productId,
  seller,
  combinationsID,
  count,
  max,
  min = 1,
  stock,
  onUpdate,
  onRemove,
  isLoading = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputValue, setInputValue] = useState(String(count ?? ""));

  const getInputWidth = (number) => {
    const digits = String(number).length;
    return Math.max(35, 20 + digits * 7);
  };

  // Same logic as counter/index.jsx and counter-basket: cap by both max and stock
  const numMax = max != null && max !== '' ? Number(max) : NaN;
  const numStock = stock != null && stock !== '' ? Number(stock) : NaN;
  const numMin = min != null && min !== '' ? Number(min) : 1;
  const numCount = Number(count) || 0;

  useEffect(() => {
    setInputValue(String(numCount));
  }, [numCount]);

  const realMax =
    !Number.isNaN(numMax) && !Number.isNaN(numStock)
      ? Math.min(numMax, numStock)
      : !Number.isNaN(numMax)
        ? numMax
        : !Number.isNaN(numStock)
          ? numStock
          : 999;

  const clampCount = (value) => Math.min(Math.max(value, numMin), realMax);

  const handleIncrement = async () => {
    if (isUpdating || isLoading) return;
    if (numCount >= realMax) return;
    setIsUpdating(true);
    try {
      await onUpdate(numCount + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (isUpdating || isLoading) return;
    if (numCount > numMin) {
      setIsUpdating(true);
      try {
        await onUpdate(numCount - 1);
      } finally {
        setIsUpdating(false);
      }
    } else {
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
    if (numCount >= realMax) return;
    setIsUpdating(true);
    try {
      await onUpdate(realMax);
    } finally {
      setIsUpdating(false);
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

  const applyInputValue = async () => {
    if (isUpdating || isLoading) return;

    const trimmed = inputValue.trim();
    if (trimmed === "") {
      setInputValue(String(numCount));
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      setInputValue(String(numCount));
      return;
    }

    const nextCount = clampCount(parsed);
    setInputValue(String(nextCount));

    if (nextCount === numCount) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(nextCount);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (event) => {
    const { value } = event.currentTarget;
    if (value === "") {
      setInputValue("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    if (parsed > realMax) {
      setInputValue(String(realMax));
      return;
    }

    setInputValue(value);
  };

  const handleInputBlur = () => {
    applyInputValue();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const isActionDisabled = isUpdating || isLoading;
  const isAtMinimum = numCount <= numMin;
  const isAtMaximum = numCount >= realMax;

  return (
    <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
      {/* Counter controls */}
      <Flex 
        align="center" 
        gap="2px"
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '4px 4px',
          backgroundColor: '#fff',
          flexShrink: 0,
          minWidth: 'fit-content'
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
          size={28}
          radius="md"
          variant="filled"
          onClick={handleIncrement}
          disabled={isActionDisabled || isAtMaximum}
          style={{
            backgroundColor: '#EEF9FE',
            color: '#09346D',
            opacity: isActionDisabled || isAtMaximum ? 0.5 : 1,
            cursor: isActionDisabled || isAtMaximum ? 'not-allowed' : 'pointer',
            border: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconPlus size={14} />
        </ActionIcon>

        {/* Count input */}
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          w={getInputWidth(inputValue || numCount)}
          styles={{ 
            input: { 
              textAlign: "center",
              fontSize: '14px',
              fontWeight: 500,
              color: '#23254e',
              border: 'none',
              padding: '0 2px',
              MozAppearance: 'textfield',
            } 
          }}
          variant="unstyled"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={isActionDisabled}
          px={0}
          style={{ flexShrink: 0 }}
        />

        {/* Minus/Delete button - changes icon when at minimum */}
        <ActionIcon
          size={28}
          radius="md"
          variant="filled"
          onClick={handleDecrement}
          disabled={isActionDisabled}
          style={{
            backgroundColor: '#EEF9FE',
            color: '#09346D',
            opacity: isActionDisabled ? 0.5 : 1,
            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
            border: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isAtMinimum ? <IconTrash size={14} /> : <IconMinus size={14} />}
        </ActionIcon>
      </Flex>
    </Flex>
  );
};

export default CounterMiniCart;