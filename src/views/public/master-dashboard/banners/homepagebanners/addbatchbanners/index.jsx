import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";
import { banners } from "../../../../../../mock/data/banners";
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageBanners } from "../../../../../../redux/master-dash/banners/homepagebanners/homePageBannersActions";


const AddBatchBanners = () => {
    const dispatch = useDispatch();

    
    const handleImport = () => {
        try {

            dispatch(batchImportHomePageBanners({banners: banners}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Banners
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Banners
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchBanners;