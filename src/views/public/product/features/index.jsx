import { Text, Stack } from "@mantine/core";
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
            <Stack gap="xl">
                {items.map((category, categoryIndex) => {
                    // Check if category has the expected structure
                    if (!category || !category.category || !category.items) {
                        return null;
                    }

                    return (
                        <div key={category.id || categoryIndex}>
                            <XTitle size="md" fw={600} mb="md" c="blue">
                                {category.category}
                            </XTitle>
                            <div style={{ 
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'white'
                            }}>
                                {category.items.map((item, itemIndex) => {
                                    // Add safety check for individual items
                                    if (!item || !item.label || !item.value) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={itemIndex}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'stretch',
                                                gap: '0',
                                                borderBottom: '1px solid #e9ecef',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: '0 0 33.333%',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderLeft: '1px solid #e9ecef'
                                                }}
                                            >
                                                <Text size="sm" fw={500} c="dimmed">
                                                    {item.label}
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    flex: '1 1 66.667%',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text size="sm" fw={500}>
                                                    {item.value}
                                                </Text>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </Stack>
        </>
    );
}, (prev, next) => {
    return prev.items === next.items;
});

export default Features;