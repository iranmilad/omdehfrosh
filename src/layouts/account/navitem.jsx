import { Box, Flex, Text, useMantineTheme } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import React from 'react'
import { NavLink } from 'react-router';

function NavItem(props) {
    const theme = useMantineTheme();
  return (
    <Box p="md" component={NavLink} to={props.url} className='hover:text-brand-500' bg={props.activeItem ? theme.primaryColor : "white"} style={{borderRadius: "0.375rem",color: props.activeItem ? "white" : ""}}>
        <Flex justify="space-between" align="center">
            <Flex align="center" gap="sm">
                {props.icon}
                <Text size='sm' fw="600">{props.label}</Text>
            </Flex>
            <IconChevronLeft size={16} />
        </Flex>
    </Box>
  )
}

export default NavItem