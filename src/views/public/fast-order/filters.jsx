import React from 'react';
import { Accordion, SimpleGrid, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFilter } from '@tabler/icons-react';
import iranStates from '../../../Libs/iranStates';
import { shallowEqual } from '@mantine/hooks';

function Filters({setFilters}) {
  const form = useForm({
    initialValues: {
      province: '',
      stockStatus: '',
      minStock: '',
      deliveryTime: '',
      paymentType: '',
      supplier: '',
      sort: 'newest',
    },
  });

  const handleSubmit = (values) => {
    setFilters(values)
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Accordion variant="default" defaultValue="">
        <Accordion.Item value="default" styles={{ item: { border: 'none' } }}>
          <Accordion.Control className="hover:bg-transparent">فیلتر ها</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              <Select
                label="استان ارسال"
                searchable
                clearable
                data={iranStates}
                {...form.getInputProps('province')}
              />
              <Select
                label="وضعیت موجودی"
                clearable
                data={[
                  { label: 'همه', value: 'all' },
                  { label: 'موجود', value: 'yes' },
                  { label: 'ناموجود', value: 'no' },
                ]}
                {...form.getInputProps('stockStatus')}
              />
              <Select
                label="حداقل موجودی"
                clearable
                data={[
                  { label: '5', value: '5' },
                  { label: '10', value: '10' },
                  { label: '20', value: '20' },
                  { label: '50', value: '50' },
                  { label: '100', value: '100' },
                ]}
                {...form.getInputProps('minStock')}
              />
              <Select
                label="زمان تحویل"
                clearable
                data={[
                  { label: 'همه', value: 'all' },
                  { label: 'آنی', value: 'instant' },
                  { label: 'پیش‌ فروش', value: 'preorder' },
                ]}
                {...form.getInputProps('deliveryTime')}
              />
              <Select
                label="نوع پرداخت"
                clearable
                data={[
                  { label: 'نقد', value: 'cash' },
                  { label: 'اقساط', value: 'installment' },
                ]}
                {...form.getInputProps('paymentType')}
              />
              <Select
                label="تامین کننده"
                searchable
                clearable
                data={[
                  { label: 'دیجیکالا', value: '1000' },
                  { label: 'خانومی', value: '1001' },
                  { label: 'رونیکس', value: '1002' },
                  { label: 'آروا', value: '1003' },
                  { label: 'ایمالز', value: '1004' },
                ]}
                {...form.getInputProps('supplier')}
              />
              <Select
              label="مرتب سازی بر اساس"
              data={[
                { label: "جدیدترین", value: "newest" },
                { label: "ارزان‌ترین", value: "lowest_price" },
                { label: "گران‌ترین", value: "highest_price" },
                { label: "پرفروش‌ترین", value: "best_selling" },
              ]}
              {...form.getInputProps('sort')}
              />
            </SimpleGrid>
            <Button type="submit" mt="lg" size="sm" leftSection={<IconFilter size={18} />}>
              اعمال فیلتر
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </form>
  );
}

export default Filters;