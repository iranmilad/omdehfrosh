import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";
import {featuredproducts} from '../../../../../../mock/data/featuredproducts'
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageFeaturedProducts } from "../../../../../../redux/master-dash/featuredproducts/featuredproducts/featuredproductsActions";


const AddBatchFeaturedProducts = () => {
    const dispatch = useDispatch();

    const handleImport = () => {
        try {
            dispatch(batchImportHomePageFeaturedProducts({featuredproducts: featuredproducts}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Featured Products
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Featured Products
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchFeaturedProducts;