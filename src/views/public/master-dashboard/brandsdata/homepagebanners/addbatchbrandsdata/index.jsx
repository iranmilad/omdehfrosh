import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";
import { banners } from "../../../../../../mock/data/banners";
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageBanners } from "../../../../../../redux/master-dash/banners/homepagebanners/homePageBannersActions";
import { brandsData } from "../../../../../../mock/data/brandsdata";
import { batchImportBrandsData } from "../../../../../../redux/master-dash/brandsdata/brandsdataActions";

const BrandsData = () => {
    const dispatch = useDispatch();

    
    const handleImport = () => {
        try {

            dispatch(batchImportBrandsData({brandsData: brandsData}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Brands Data
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Brands Data
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default BrandsData;