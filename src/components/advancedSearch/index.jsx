import { useState, useCallback, useEffect } from "react";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

export function AdvancedSearch({ type, label, onChange }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState("");
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [debouncedValue] = useDebouncedValue(value, 300);

  const fetchData = useCallback(async (searchValue) => {
    if (!searchValue.trim()) {
      setData(null);
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch('/advanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, s: searchValue })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setData([]);
    } finally {
      setIsPending(false);
    }
  }, [type]);

  // Trigger search when debounced value changes
  useEffect(() => {
    fetchData(debouncedValue);
  }, [debouncedValue, fetchData]);

  const changeInputValue = (value) => {
    setValue(value);
  }

  const options = (data || []).map((item, index) => (
    <Combobox.Option value={item.value} key={index}>
      {item.label}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(label, options) => {
        setValue(options.children);
        onChange({ label: options.children, value: options.value });
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          variant="filled"
          size="xs"
          label={label}
          value={value}
          onChange={(event) => {
            changeInputValue(event.currentTarget.value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSection={isPending && <Loader size={18} />}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={data === null}>
        <Combobox.Options>
          {options}
          {!data && value !== '' && <Combobox.Empty>چیزی یافت نشد</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default AdvancedSearch;