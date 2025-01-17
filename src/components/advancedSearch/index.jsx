import { useRef, useState } from "react";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useData, useSend } from "../../Libs/api";
import { useDebouncedValue } from "@mantine/hooks";

export function AdvancedSearch({ type,label,onChange }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState("");
  const {isPending,mutateAsync,data} = useSend({
    url: "/advanced-search",
  });

  const changeInputValue = (value) => {
    setValue(value);
    mutateAsync({type,s:value})
  }

  const options = (data || []).map((item,index) => (
    <Combobox.Option value={item.value} key={index}>
      {item.label}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(label,options) => {
        setValue(options.children);
        onChange({label: options.children,value: options.value})
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
            changeInputValue(event.currentTarget.value)
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
