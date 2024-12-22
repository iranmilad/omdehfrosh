

import { Flex, Text } from '@mantine/core'
import React from 'react'

function LabelValue({label,value,size='sm'}) {
  return (
    <Flex gap={3} align="center">
        <Text size={size} c="gray.7">{label}</Text>
        <Text size={size}>{value}</Text>
    </Flex>
  )
}

export default LabelValue