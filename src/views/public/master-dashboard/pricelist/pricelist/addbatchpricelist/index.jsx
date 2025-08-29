import { useDispatch } from "react-redux";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { batchImportArchives } from "../../../../../../redux/master-dash/archives/archives/archiveActions";

import { pricelist } from "../../../../../../mock/data/pricelist";
import { batchImportPriceList } from "../../../../../../redux/master-dash/pricelists/pricelists/priceListActions";


const AddBatchPriceList = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportPriceList({ priceList: pricelist }));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Price List
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Price List
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchPriceList;