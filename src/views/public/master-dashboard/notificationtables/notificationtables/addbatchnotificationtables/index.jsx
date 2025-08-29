import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { notificationtables } from '../../../../../../mock/data/notificationtables'
import { batchImportNotificationTables } from "../../../../../../redux/master-dash/notificationtables/notificationtables/notificationTablesActions";




const AddBatchNotificationTables = () => {

    const dispatch = useDispatch();

    
    const handleImport = () => {
        try {

            dispatch(batchImportNotificationTables({ notificationData: notificationtables }));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Notification Tables
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>

                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Notification Tables
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchNotificationTables;