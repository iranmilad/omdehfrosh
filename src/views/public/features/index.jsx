import React from "react"
import { Text,Grid,Paper,GridCol } from "@mantine/core";

const Features = React.memo((props ) => {
    const {items} = props;
    return (
        <>
            <Text size="lg" fw={600} mb="md">مشخصات</Text>
            <Grid>
                {items.map((item,index) => {
                    return <>
                        <Grid.Col span={4}><Paper w="100%" p="md" className="rounded-lg lg:w-4/12 "><Text size="sm" fw={600}>{item.title}</Text></Paper></Grid.Col>
                        <GridCol span={8}><Paper w="100%" p="md" className="rounded-lg lg:w-4/6 "><Text size="sm">{item.value}</Text></Paper></GridCol> 
                    </>
                })}
            </Grid>
        </>
    )
}, (prev,next) => {
    return prev.items !== next.items
})

export default Features