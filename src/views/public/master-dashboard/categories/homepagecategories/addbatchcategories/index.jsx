import { useDispatch } from "react-redux";
import { useState } from "react";
import {categories} from '../../../../../../mock/data/categories'

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageCategories } from "../../../../../../redux/master-dash/categories/homepagecategories/homePageCategoriesActions";


const AddBatchCategories= () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportHomePageCategories({categories: categories}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Categories
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Categories
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchCategories;