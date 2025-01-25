import { Modal } from '@mantine/core'
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import {
  DEFAULT_OPTIONS,
  getTheme,
} from "@table-library/react-table-library/mantine";
import { useTree } from "@table-library/react-table-library/tree";
import { IconChevronDown, IconChevronLeft } from '@tabler/icons-react';
import React from 'react';
import { shallowEqual } from '@mantine/hooks';


function Table({columns,data,tree}) {
    const mantineTheme = getTheme(DEFAULT_OPTIONS);
    const theme = useTheme(mantineTheme);
  
  return (
    <CompactTable columns={columns} data={data} theme={theme} tree={tree} />
  )
}

export default Table