import React from "react"
import { Text,Grid,Paper,GridCol } from "@mantine/core";
import XTitle from "../../../components/title";

const Features = React.memo((props ) => {
    const {items} = props;
    return (
        <>
            <XTitle size="lg" fw={600} mb="xl">مشخصات</XTitle>
            <Grid>
                {items.map((item,index) => {
                    return <React.Fragment key={index}>
                        <Grid.Col span={4}><Paper w="100%" p="md" className="rounded-lg lg:w-4/12 "><Text size="sm" fw={600}>{item.title}</Text></Paper></Grid.Col>
                        <GridCol span={8}><Paper w="100%" p="md" className="rounded-lg lg:w-4/6 "><Text size="sm">{item.value}</Text></Paper></GridCol> 
                    </React.Fragment>
                })}
            </Grid>
        </>
    )
}, (prev,next) => {
    return prev.items !== next.items
})

export default Features