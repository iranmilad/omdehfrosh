import { Button, Flex, Paper } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import React from 'react'

function InfoBox({children}) {
  return (
    <Paper py="40">
        <Flex justify="center" align="center" direction="column" gap="lg" c="gray">
            <IconInfoCircle size={50} />
            {children}
            <Button>بازگشت به صفحه اصلی</Button>
        </Flex>
    </Paper>
  )
}

export default InfoBox