import { NavLink, Outlet } from "react-router-dom";
import { 
  Container, 
  Title, 
  NavLink as MantineNavLink, 
  Group, 
  Paper, 
  Text, 
  Card, 
  Divider, 
  Stack 
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { verifyMasterToken } from "../../../../../redux/auth/authmaster/authMasterActions";

const SingleProduct = () => {



    const dispatch = useDispatch();
      const { isVerifiedMaster, loadingMaster: authLoading, errorMaster: authError, user_master } = useSelector((state) => state.authMaster);
  
  
      useEffect(() => {
        dispatch(verifyMasterToken());
      }, [dispatch]);

      if (isVerifiedMaster && user_master.role === 'master') {
        return (
          <Container size="lg" py="xl">
            <Title align="center" mb="lg" order={2} sx={{ fontWeight: 700 }}>
              Single Product Management
            </Title>
      
            <Card shadow="md" padding="lg" radius="md" withBorder>
              <Stack spacing="md">
                <Text size="lg" weight={500} align="center">
                  Manage Your Product Efficiently
                </Text>
      
                <Divider />
      
                <Group position="center" spacing="xl">
                  <MantineNavLink 
                    component={NavLink} 
                    to="/master-dashboard/singleproducts" 
                    label="📦 All SingleProducts" 
                    variant="filled"
                    sx={(theme) => ({
                      borderRadius: theme.radius.md,
                      padding: "10px 20px",
                      fontSize: theme.fontSizes.md,
                      color: theme.white,
                      backgroundColor: theme.colors.blue[6],
                      "&:hover": { backgroundColor: theme.colors.blue[7] },
                    })}
                  />
      
                  <MantineNavLink 
                    component={NavLink} 
                    to="/master-dashboard/singleproducts/add-batch-single-product" 
                    label="➕ Add Batch Single Product" 
                    variant="filled"
                    sx={(theme) => ({
                      borderRadius: theme.radius.md,
                      padding: "10px 20px",
                      fontSize: theme.fontSizes.md,
                      color: theme.white,
                      backgroundColor: theme.colors.green[6],
                      "&:hover": { backgroundColor: theme.colors.green[7] },
                    })}
                  />
                </Group>
              </Stack>
            </Card>
      
            <Outlet /> {/* This ensures nested routes render here */}
          </Container>
        );
      }



        
      }


export default SingleProduct;
