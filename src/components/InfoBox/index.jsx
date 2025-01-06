import { Button, Flex, Paper } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import React from 'react'

function InfoBox({children,shadow="md",back=true,...other}) {
  return (
    <Paper py="40" shadow={shadow} {...other}>
        <Flex justify="center" align="center" direction="column" gap="lg" c="gray">
            <IconInfoCircle size={50} />
            {children}
            {back && <Button>بازگشت به صفحه اصلی</Button>}
        </Flex>
    </Paper>
  )
}

export default InfoBox