import { Button, Collapse, Paper } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronLeft } from '@tabler/icons-react';
import React from 'react'

function PaperCollpase({children,title}) {
    const [opened,{open,close,toggle}] = useDisclosure(false);
  return (
    <Paper py="sm">
        <Button justify='space-between' fullWidth rightSection={<IconChevronLeft size={18} style={{transition: "0.1s",rotate: !opened ? "" : "-90deg"}} />}  size="md" px={0}  variant='transparent' onClick={toggle}>
            {title}
        </Button>
        <Collapse in={opened}>
            {children}
        </Collapse>
    </Paper>
  )
}

export default PaperCollpase