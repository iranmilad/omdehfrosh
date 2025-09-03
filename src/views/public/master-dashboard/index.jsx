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
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyMasterToken } from "../../../redux/auth/authmaster/authMasterActions";



const MasterDashboard = () => {


  const dispatch = useDispatch();

    const { isVerifiedMaster, loadingMaster: authLoading, errorMaster: authError, user_master } = useSelector((state) => state.authMaster);


    useEffect(() => {
      dispatch(verifyMasterToken());
    }, [dispatch]);



    if (isVerifiedMaster && user_master.role === 'master') {

      return (
        <Container size="lg" py="xl">
          <Title align="center" mb="lg" order={2} sx={{ fontWeight: 700 }}>
            Master Dashboard
          </Title>
    
          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Stack spacing="md">
              <Text size="lg" weight={500} align="center">
                Manage Your Dashboard Effectively
              </Text>
    
              <Divider />
              
    
              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/products" 
                  label="📦 Products" 
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
              </Group>
    
              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/banners" 
                  label="📦 Banners" 
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
              </Group>
    
              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/brands" 
                  label="📦 Brands" 
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
              </Group>
    
              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/categories" 
                  label="📦 Categories" 
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
              </Group>
    
              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/product-comments" 
                  label="📦 Product Comments" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/menu" 
                  label="📦 Menu " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/archives" 
                  label="📦 Archive " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/trendproducts" 
                  label="📦 Trend Products " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/productgrids" 
                  label="📦 Product Grids " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/singleproducts" 
                  label="📦 Single Product " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/fastorderbrands" 
                  label="📦 Fast Order Brands " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/fastorderfilters" 
                  label="📦 Fast Order Filters " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/fastordercategories" 
                  label="📦 Fast Order Categories " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/fastorderlocations" 
                  label="📦 Fast Order Locations" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/gateways" 
                  label="📦 Fast Order Gateways" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/user-myaccounts" 
                  label="📦 User My Account" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/usermessages" 
                  label="📦 User Messages" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/purchasedproducts" 
                  label="📦 User Purchased Products" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/myaccount-tickets" 
                  label="📦 My Account Tickets" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/subscriptions" 
                  label="📦 Subscriptions" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/categoryfilters" 
                  label="📦 Category Filters" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/notificationtables" 
                  label="📦 Notification Tables" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/pricelist" 
                  label="📦 Price List Tables" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/wideslider" 
                  label="📦 wideslider" 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/featured-products" 
                  label="📦 featurred prod " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/brandsdata" 
                  label="📦 brandsdata " 
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
              </Group>

              <Group position="center" spacing="xl">
                <MantineNavLink 
                  component={NavLink} 
                  to="/master-dashboard/bootstrap" 
                  label="📦 bootstrap " 
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
              </Group>

            </Stack>
          </Card>
    
          <Outlet /> {/* This ensures nested routes render here */}
        </Container>
      );
    }

    else {
      return (
        <Container size="lg" py="xl">
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Stack spacing="md">

            <Divider />
  
            <Group position="center" spacing="xl">
              <Text>
                شما دسترسی به این صفحه ندارید
              </Text>
            </Group>
  
          </Stack>
        </Card>
  
        <Outlet /> {/* This ensures nested routes render here */}
      </Container>
      )
    }



};

export default MasterDashboard;
