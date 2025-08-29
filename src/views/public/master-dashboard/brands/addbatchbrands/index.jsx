import { useDispatch } from "react-redux";
import { useState } from "react";
import { banners } from "../../../../../../mock/data/banners";
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { brands } from "../../../../../mock/data/brands";
import { batchImportHomePageBrands } from "../../../../../redux/master-dash/brands/hompagebrands/homePageBrandsActions";


const AddBatchBrands = () => {
    const dispatch = useDispatch();

    
    const handleImport = () => {

        try {

            dispatch(batchImportHomePageBrands({ brands: brands })); // Directly pass `brands`
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Brands
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Brands
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchBrands;