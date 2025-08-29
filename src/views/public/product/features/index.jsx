import { Grid, GridCol, Paper, Text } from "@mantine/core";
import React from "react";
import XTitle from "../../../../components/title";

const Features = React.memo((props) => {
    const { items } = props;
    
    // Add safety checks
    if (!items || !Array.isArray(items) || items.length === 0) {
        return (
            <>
                <XTitle size="lg" fw={600} mb="xl">مشخصات</XTitle>
                <Text size="sm" c="dimmed">مشخصاتی برای نمایش وجود ندارد</Text>
            </>
        );
    }

    return (
        <>
            <XTitle size="lg" fw={600} mb="xl">مشخصات</XTitle>
            <Grid>
                {items.map((item, index) => {
                    // Add safety check for individual items
                    if (!item || !item.label || !item.value) {
                        return null;
                    }
                    
                    return (
                        <React.Fragment key={index}>
                            <Grid.Col span={4}>
                                <Paper w="100%" p="md" className="rounded-lg lg:w-4/12">
                                    <Text size="sm" fw={600}>{item.label}</Text>
                                </Paper>
                            </Grid.Col>
                            <GridCol span={8}>
                                <Paper w="100%" p="md" className="rounded-lg lg:w-4/6">
                                    <Text size="sm">{item.value}</Text>
                                </Paper>
                            </GridCol>
                        </React.Fragment>
                    );
                })}
            </Grid>
        </>
    );
}, (prev, next) => {
    return prev.items === next.items;
});

export default Features;