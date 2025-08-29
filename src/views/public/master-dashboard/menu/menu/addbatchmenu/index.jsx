import { useDispatch } from "react-redux";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import {menuItems} from '../../../../../../mock/data/menu.js'
import { batchImportMenu } from "../../../../../../redux/master-dash/menu/menu/menuActions.js";


const AddBatchMenu = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportMenu({menuData: menuItems}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Menu
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Menu
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchMenu;