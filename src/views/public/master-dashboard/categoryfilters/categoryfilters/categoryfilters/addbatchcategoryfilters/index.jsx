import { useDispatch } from "react-redux";

import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { batchImportCategoryFilters } from "../../../../../../../redux/master-dash/category/addbatchcategoryfilters/addBatchCategoryFiltersActions";

import { categoryFilters } from "../../../../../../../mock/data/categories";


const AddBatchCategoryFilters = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {

            dispatch(batchImportCategoryFilters({categoryFilters: categoryFilters}))

            
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Category Filters
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Category Filters
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchCategoryFilters;