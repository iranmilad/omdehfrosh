import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Select,
  Autocomplete,
  Textarea,
  Paper,
  Text,
  Flex,
  Stack,
  Radio,
  Group,
  Grid,
  GridCol,
  Divider,
  Center,
  Loader,
  Box,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import * as Yup from 'yup';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconChevronLeft,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconPhone,
  IconUser,
  IconHome,
} from '@tabler/icons-react';
import iranCity from '../../../iran_cities_with_coordinates.json';
import { getApiUrl } from '../../../Libs/utils/apiutils/apiutils';

const addressValidationSchema = Yup.object().shape({
  title: Yup.string().required('عنوان آدرس الزامی است'),
  name: Yup.string().required('نام الزامی است'),
  family: Yup.string().required('نام خانوادگی الزامی است'),
  mobile: Yup.string()
    .matches(/^(\d{4})\s?(\d{3})\s?(\d{4})$/, 'فرمت شماره موبایل صحیح نیست')
    .required('شماره موبایل الزامی است'),
  nationalCode: Yup.string()
    .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
    .required('کد ملی الزامی است'),
  province: Yup.string().required('استان الزامی است'),
  city: Yup.string().required('شهر الزامی است'),
  address: Yup.string().required('آدرس الزامی است'),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, 'کد پستی باید 10 رقم باشد')
    .required('کد پستی الزامی است'),
});

const Provinces = iranCity.map((item) => ({ label: item.name, value: item.name }));

const AddressManagement = ({ onAddressSelect, userInfo, onSubmit }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressListOpen, setIsAddressListOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      name: '',
      family: '',
      mobile: '',
      nationalCode: '',
      province: '',
      city: '',
      address: '',
      postalCode: '',
    },
    onValuesChange: (values, prevValues) => {
      if (values.province !== prevValues.province) {
        form.setFieldValue('city', '');
        if (values.province) {
          const provinceData = iranCity.find((item) => item.name === values.province);
          if (provinceData && provinceData.cities) {
            const formattedCities = provinceData.cities.map((item) => ({
              label: item.name,
              value: item.name,
            }));
            setCities(formattedCities);
          } else {
            setCities([]);
          }
        } else {
          setCities([]);
        }
      }
    },
    validate: yupResolver(addressValidationSchema),
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('user');
      const response = await fetch(getApiUrl('/users/addresses'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.state === 'ok') {
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId);
          onAddressSelect?.(defaultAddr);
        }
      }
    } catch (error) {
      notifications.show({
        title: 'خطا در دریافت آدرس‌ها',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    form.setValues({
      title: '',
      name: userInfo?.user?.name || '',
      family: userInfo?.user?.family || '',
      mobile: userInfo?.user?.mobile || '',
      nationalCode: userInfo?.user?.nationalCode || '',
      province: '',
      city: '',
      address: '',
      postalCode: '',
    });
      setIsAddressListOpen(false); 

    setIsModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    form.setValues({
      title: address.title,
      name: address.name,
      family: address.family,
      mobile: address.mobile,
      nationalCode: address.nationalCode,
      province: address.province,
      city: address.city,
      address: address.address,
      postalCode: address.postalCode,
    });
    
    const provinceData = iranCity.find((item) => item.name === address.province);
    if (provinceData && provinceData.cities) {
      const formattedCities = provinceData.cities.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      setCities(formattedCities);
    }
    setIsModalOpen(true);
  };

  const handleSubmitAddress = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const token = localStorage.getItem('user');
    try {
      const url = editingAddress
        ? getApiUrl(`/users/addresses/update/${editingAddress.addressId}`)
        : getApiUrl('/users/addresses/add');
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.values),
      });

      const data = await response.json();
      
      if (data.state === 'ok') {
        notifications.show({
          title: data.message,
          color: 'green',
        });
        setIsModalOpen(false);
        form.reset();
        await fetchAddresses();
      } else {
        notifications.show({
          title: data.message || 'خطا در ذخیره آدرس',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'خطا در ذخیره آدرس',
        color: 'red',
      });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('آیا از حذف این آدرس اطمینان دارید؟')) return;
    
    const token = localStorage.getItem('user');
    try {
      const response = await fetch(getApiUrl(`/users/addresses/delete/${addressId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.state === 'ok') {
        notifications.show({
          title: data.message,
          color: 'green',
        });
        await fetchAddresses();
      }
    } catch (error) {
      notifications.show({
        title: 'خطا در حذف آدرس',
        color: 'red',
      });
    }
  };

  const handleSelectAddress = async (addressId) => {
    setSelectedAddressId(addressId);
    const address = addresses.find(addr => addr.addressId === addressId);
    onAddressSelect?.(address);
    setIsAddressListOpen(false);
    
    const token = localStorage.getItem('user');
    try {
      await fetch(getApiUrl(`/users/addresses/set-default/${addressId}`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  }

  const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);

  return (
    <>
      {/* Digikala-style Address Display */}
      <div className=" bg-white px-5">
        <div className="hidden"></div>
        
        {/* Header */}
        <div className="flex">
          <div className="text-gray-700 text-xs md:text-sm font-normal md:text-gray-500 pb-2 md:pb-0">
            آدرس تحویل سفارش
          </div>
          <span 
            className="inline-flex items-center cursor-pointer text-sm shrink-0 focus:outline-none mr-auto"
            style={{ color: '#5e87c8' }}
            onClick={() => setIsAddressListOpen(true)}
          >
            <span>{addresses.length > 0 ? 'تغییر یا ویرایش' : 'افزودن آدرس'}</span>
            <div className="flex">
            <svg
              style={{
                width: '18px',
                height: '18px',
                fill: '#5e87c8',
                transform: 'rotate(180deg)',
              }}
              viewBox="0 0 24 24"
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>

            </div>
          </span>
        </div>

        {/* Address Content */}
        {selectedAddress ? (
          <>
            <div className="text-xs md:text-sm font-bold text-gray-900 flex gap-1 items-center">
              {selectedAddress.address}
            </div>
            
            <div className="flex items-center justify-between md:flex-row flex-col mt-2">
              <div className="flex flex-col md:flex-row w-full md:gap-8 gap-1 text-xs font-normal text-gray-500">
                <span className="flex gap-1 items-center">
                  <div className="flex">
                    <svg style={{ width: '16px', height: '16px', fill: '#9ca3af' }} viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  گیرنده : {selectedAddress.name} {selectedAddress.family}
                </span>
                <span className="flex gap-1 items-center">
                  <div className="flex">
                    <svg style={{ width: '16px', height: '16px', fill: '#9ca3af' }} viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  موبایل : {selectedAddress.mobile}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            لطفا یک آدرس انتخاب کنید
          </div>
        )}
      </div>

      {/* Address List Modal */}
      <Modal
        opened={isAddressListOpen}
        onClose={() => setIsAddressListOpen(false)}
        title="انتخاب آدرس"
        zIndex={1100} 
        size="md"
        styles={{
          title: { fontSize: 18, fontWeight: 600 },
        }}
      >
        <Stack gap="md">
          <Paper
            p="md"
            style={{
              border: '2px dashed #dee2e6',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={handleAddAddress}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5e87c8'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
          >
            <Flex align="center" gap="md">
              <IconPlus size={24} />
              <Text fw={500}>افزودن آدرس جدید</Text>
              <IconChevronLeft size={20} style={{ marginRight: 'auto' }} />
            </Flex>
          </Paper>

          {addresses.length > 0 && <Divider />}

          <Radio.Group value={selectedAddressId} onChange={handleSelectAddress}>
            <Stack gap="md">
              {addresses.map((address) => (
                <Paper key={address.addressId} p="md" withBorder>
                  <Radio
                    value={address.addressId}
                    label={
                      <Box>
                        <Text fw={500} mb="xs">{address.title}</Text>
                        <Text size="sm" c="dimmed" mb="sm">{address.address}</Text>
                        
                        <Stack gap={8}>
                          <Flex align="center" gap={8}>
                            <IconUser size={16} color="#868e96" />
                            <Text size="xs" c="dimmed">{address.name} {address.family}</Text>
                          </Flex>
                          <Flex align="center" gap={8}>
                            <IconPhone size={16} color="#868e96" />
                            <Text size="xs" c="dimmed">{address.mobile}</Text>
                          </Flex>
                          <Flex align="center" gap={8}>
                            <IconMapPin size={16} color="#868e96" />
                            <Text size="xs" c="dimmed">{address.postalCode}</Text>
                          </Flex>
                          <Flex align="center" gap={8}>
                            <IconHome size={16} color="#868e96" />
                            <Text size="xs" c="dimmed">{address.city}، {address.province}</Text>
                          </Flex>
                        </Stack>

                        <Flex gap="md" mt="md">
                          <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconEdit size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                                    setIsAddressListOpen(false); 

                              handleEditAddress(address);
                            }}
                          >
                            ویرایش
                          </Button>
                          <Button
                            variant="subtle"
                            size="xs"
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.addressId);
                            }}
                          >
                            حذف
                          </Button>
                        </Flex>
                      </Box>
                    }
                  />
                </Paper>
              ))}
            </Stack>
          </Radio.Group>
        </Stack>
      </Modal>

      {/* Add/Edit Address Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="عنوان آدرس"
            placeholder="مثال: منزل، محل کار"
            withAsterisk
            {...form.getInputProps('title')}
          />

          <Grid>
            <GridCol span={6}>
              <TextInput
                label="نام"
                withAsterisk
                {...form.getInputProps('name')}
              />
            </GridCol>
            <GridCol span={6}>
              <TextInput
                label="نام خانوادگی"
                withAsterisk
                {...form.getInputProps('family')}
              />
            </GridCol>
          </Grid>

          <Grid>
            <GridCol span={6}>
              <TextInput
                label="شماره موبایل"
                component={IMaskInput}
                mask="0000 000 0000"
                dir="ltr"
                styles={{ input: { textAlign: 'left' } }}
                withAsterisk
                {...form.getInputProps('mobile')}
              />
            </GridCol>
            <GridCol span={6}>
              <TextInput
                label="کد ملی"
                component={IMaskInput}
                mask="0000000000"
                dir="ltr"
                styles={{ input: { textAlign: 'left' } }}
                withAsterisk
                {...form.getInputProps('nationalCode')}
              />
            </GridCol>
          </Grid>

          <Grid>
            <GridCol span={6}>
              <Select
                data={Provinces}
                label="استان"
                placeholder="انتخاب استان"
                searchable
                withAsterisk
                {...form.getInputProps('province')}
              />
            </GridCol>
            <GridCol span={6}>
              <Autocomplete
                data={cities}
                label="شهر"
                placeholder={
                  form.values.province
                    ? 'انتخاب شهر'
                    : 'ابتدا استان را انتخاب کنید'
                }
                searchable
                disabled={!form.values.province}
                withAsterisk
                {...form.getInputProps('city')}
              />
            </GridCol>
          </Grid>

          <Textarea
            label="آدرس کامل"
            placeholder="آدرس دقیق محل تحویل"
            rows={4}
            withAsterisk
            {...form.getInputProps('address')}
          />

          <TextInput
            label="کد پستی"
            placeholder="کد پستی 10 رقمی"
            component={IMaskInput}
            mask="0000000000"
            dir="ltr"
            withAsterisk
            {...form.getInputProps('postalCode')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setIsModalOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleSubmitAddress}>
              {editingAddress ? 'ذخیره تغییرات' : 'افزودن آدرس'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AddressManagement;