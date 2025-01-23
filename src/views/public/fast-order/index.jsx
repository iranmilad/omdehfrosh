import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import {
  DEFAULT_OPTIONS,
  getTheme,
} from '@table-library/react-table-library/mantine';
import "./style.css"
import { IconSettings } from '@tabler/icons-react';
import { ActionIcon, Button, Image} from '@mantine/core';
import { useTree } from "@table-library/react-table-library/tree";
import XTitle from "../../../components/title"

const nodes = [
    {
      id: '0',
      image: "https://placehold.co/600x400",
      name: 'آیفون 13',
      price: "25000000",
      stock: "1",
      minOrder: "2",
      seller: "2",
      deliveryTime: "3",
      action: 3, 
      nodes: [
        {
          id: '0',
          image: "https://placehold.co/600x400",
          name: 'آیفون 13',
          price: "25000000",
          stock: "1",
          minOrder: "2",
          seller: "2",
          deliveryTime: "3",
          action: 3, 
          nodes: null
        },
      ]
    },
  ];
  
  const COLUMNS = [
    { label: <ActionIcon variant='white'><IconSettings size={16} /></ActionIcon>, renderCell: (item) => <Image src={item.image} w={50} h={50} />,tree:true },
    { label: 'نام کالا', renderCell: (item) => item.name },
    {
      label: 'قیمت',
      renderCell: (item) => item.price
    },
    { label: 'موجودی', renderCell: (item) => `${item.stock} عدد` },
    { label: 'حداقل سفارش', renderCell: (item) => `${item.minOrder} عدد` },
    { label: 'تامین کننده', renderCell: (item) => item.seller },
    { label: 'زمان تحویل', renderCell: (item) => item.deliveryTime },
    {
      label: 'عملیات',
      renderCell: (item) => (
        <Button onClick={() => handleAction(item.action)}>
          Action {item.action}
        </Button>
      ),
    },
  ];
  

function FastOrder() {
  const data = { nodes };
  const tree = useTree(data);
  const mantineTheme = getTheme(DEFAULT_OPTIONS);
  const theme = useTheme(mantineTheme);

  return (
    <>
      <XTitle mb="xl">سفارش سریع</XTitle>
      <CompactTable columns={COLUMNS} data={data} theme={theme} tree={tree} />
    </>
  );
}

export default FastOrder