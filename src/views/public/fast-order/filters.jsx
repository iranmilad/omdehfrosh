import React, { useState } from "react";
import {
  Accordion,
  SimpleGrid,
  Select,
  Button,
  Radio,
  Stack,
  Combobox,
  useCombobox,
  Text,
  ColorSwatch,
  Group,
  InputBase,
  Input,
  CheckIcon,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter } from "@tabler/icons-react";
import iranStates from "../../../Libs/iranStates";
import { shallowEqual } from "@mantine/hooks";

const colors = [
  { label: "قرمز", value: "#FF0000" },
  { label: "سبر", value: "#00FF00" },
  { label: "آبی", value: "#0000FF" },
  { label: "زرد", value: "#FFFF00" },
  { label: "بنفش", value: "#800080" },
];

const ColorCombobox = ({ colors, ...props }) => {
  const extendedColors = [{ label: "همه", value: "all" }, ...colors];
  const mantine = useMantineTheme();
  const { value, onChange } = props;
  const [selectedColor, setSelectedColor] = useState(
    value || extendedColors[0]?.value
  );
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setSelectedColor(val);
        onChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label="انتخاب رنگ"
          component="button"
          type="button"
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedColor ? (
            <Group>
              {selectedColor === "all" ? (
                <Text size="sm" component="span">
                  همه رنگ‌ها
                </Text>
              ) : (
                <>
                  <ColorSwatch size={20} color={selectedColor} />
                  <Text size="sm" component="span">
                    {
                      extendedColors.find(
                        (item) => item.value === selectedColor
                      )?.label
                    }
                  </Text>
                </>
              )}
            </Group>
          ) : (
            <Text size="sm">انتخاب رنگ</Text>
          )}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        {extendedColors.map((color) => (
          <Combobox.Option key={color.value} value={color.value}>
            <Group>
              {color.value === "all" ? (
                <>
                  <Text size="sm">همه رنگ‌ها</Text>
                  {selectedColor === "all" && <CheckIcon size={14} />}
                </>
              ) : (
                <>
                  {selectedColor === color.value && (
                    <CheckIcon size={12} color={mantine.colors.gray[5]} />
                  )}
                  <ColorSwatch color={color.value} size={20} />
                  <Text size="sm">{color.label}</Text>
                </>
              )}
            </Group>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
};

function Filters({ setFilters }) {
  const form = useForm({
    initialValues: {
      color: "all",
      province: "all",
      stockStatus: "all",
      minStock: "",
      deliveryTime: "",
      paymentType: "",
      supplier: "",
      sort: "bestPrice",
      priceFormat: "tooman",
    },
  });

  const handleSubmit = (values) => {
    setFilters(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Accordion variant="default" defaultValue="">
        <Accordion.Item value="default" styles={{ item: { border: "none" } }}>
          <Accordion.Control className="hover:bg-transparent">
            فیلتر ها
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              <Select
                label="ترتیب نمایش"
                data={[
                  { label: "بهترین قیمت", value: "bestPrice" },
                  { label: "بیشترین موجودی", value: "highestStock" },
                ]}
                {...form.getInputProps("sort")}
              />
              <Select
                label="نوع فروش"
                data={[
                  { label: "نقدی", value: "cash" },
                  { label: "پیش فروش", value: "credit" },
                ]}
              />
              <Select
                label="واحد قیمت"
                data={[
                  { label: "تومان", value: "tooman" },
                  { label: "هزار تومان", value: "hezar" },
                  { label: "میلیون تومان", value: "million" },
                ]}
                {...form.getInputProps("priceFormat")}
              />
              <Radio.Group
                label="وضعیت موجودی"
                {...form.getInputProps("stockStatus")}
              >
                <Radio label="همه" value="all" />
                <Radio label="موجود" value="yes" my="xs" />
                <Radio label="ناموجود" value="no" />
              </Radio.Group>
              <Select
                label="حداقل موجودی"
                clearable
                data={[
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "50", value: "50" },
                  { label: "100", value: "100" },
                ]}
                {...form.getInputProps("minStock")}
              />
              <ColorCombobox colors={colors} {...form.getInputProps("color")} />
              <Select
                label="تامین کننده"
                searchable
                clearable
                data={[
                  { label: "دیجیکالا", value: "1000" },
                  { label: "خانومی", value: "1001" },
                  { label: "رونیکس", value: "1002" },
                  { label: "آروا", value: "1003" },
                  { label: "ایمالز", value: "1004" },
                ]}
                {...form.getInputProps("supplier")}
              />
              <Select
                label="استان ارسال"
                searchable
                clearable
                data={[
                  { label: "استان من", value: "mylocation" },
                  { label: "همه استان ها", value: "all" },
                ]}
                {...form.getInputProps("province")}
              />
              <Select
                label="زمان ارسال"
                clearable
                data={[
                  { label: "همه", value: "all" },
                  { label: "کمتر از 3 ساعت", value: "3hr" },
                  { label: "کمتر از 1 روز", value: "1d" },
                  { label: "تا 3 روز", value: "3d" },
                  { label: "تا 1 هفته", value: "7d" },
                  { label: "تا 15 روز", value: "15d" },
                ]}
                {...form.getInputProps("deliveryTime")}
              />
            </SimpleGrid>

            <Button
              type="submit"
              mt="lg"
              size="sm"
              leftSection={<IconFilter size={18} />}
            >
              اعمال فیلتر
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </form>
  );
}

export default Filters;
