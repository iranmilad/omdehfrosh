import { Box, Divider,Title, useMantineTheme } from '@mantine/core'
import React from 'react'

function XTitle(props) {
    const {children , ...other} = props;
    const {primaryColor} = useMantineTheme()
  return (
    <Box {...other}>
        <Title>
            {children}
        </Title>
        <Divider mt="xs" size="md" w="80" color={primaryColor} />
    </Box>
  )
}

export default XTitle