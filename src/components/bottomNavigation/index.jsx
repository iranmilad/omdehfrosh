import { ActionIcon, Button, Flex, Text } from "@mantine/core";
import {
  IconHome,
  IconMenu2,
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconShoppingBag,
} from "@tabler/icons-react";
import React from "react";
import { NavLink, useNavigate } from "react-router";
import { useSelector } from "react-redux";

const NewBasketIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.543 19.952a1.296 1.296 0 0 1 0 2.589 1.296 1.296 0 0 1 0-2.59m11.28 0c.716 0 1.297.58 1.297 1.294s-.581 1.295-1.296 1.295a1.296 1.296 0 0 1 0-2.59M3.269 3.009l2.08.36c.335.06.59.337.619.677l.235 2.801h.873l.424.001h1.604l.38.001h1.77l.33.001h1.242l.291.001h1.092l.255.001h.952l.222.001h.625l.196.001h.725l.166.001h.612l.14.001h.389l.12.001h.433l.097.001h.267l.08.001h.286l.063.001h.167l.05.001h.17l.035.001h.093l.026.001h.067l.018.001h.046l.012.001h.028l.008.001h.02l.004.001.013.001a2.08 2.08 0 0 1 1.38.82c.335.447.475.998.395 1.55l-.95 6.558a2.56 2.56 0 0 1-2.522 2.19H7.975a2.56 2.56 0 0 1-2.54-2.344L4.52 4.748l-1.507-.26A.75.75 0 0 1 2.4 3.62a.76.76 0 0 1 .867-.61m3.607 5.339h-.547l.603 7.171c.044.552.495.966 1.046.966h10.917c.52 0 .966-.388 1.04-.903l.95-6.559a.59.59 0 0 0-.112-.438.58.58 0 0 0-.388-.23h-.16l-.076.001h-.566l-.149.001h-1.559l-1.52-.001h-1.136l-.297-.001-.91-.001h-.938l-.317-.001-.958-.001h-.96l-.32-.001h-.636l-.315-.001h-.93l-.304-.001-1.176-.001zm10.413 2.196a.75.75 0 0 1 0 1.5h-2.773a.75.75 0 1 1 0-1.5z"
    />
  </svg>
);

function BottomNavigation({ category, search, basket, user }) {
  const navigate = useNavigate();
  
  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const { isVerified } = useSelector((state) => state.auth);
  
  // Calculate cart count
  const shouldShowCart = user && isVerified;
  const cartCount = shouldShowCart ? (cartItems?.length || 0) : 0;

  const handleAccountClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const handleOrdersClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <Flex
      id="bottom-navigation"
      hiddenFrom="md"
      bg="white"
      w="100vw"
      h="70"
      style={{
        zIndex: 100,
        boxShadow: "0 -15px 20px -15px rgba(0, 0, 0, 0.07)",
      }}
      pos="fixed"
      bottom={0}
      left={0}
      justify="space-between"
      align="center"
    >
      <Button
        className="bottom-nav-btn"
        p="0"
        variant="transparent"
        size="xs"
        w="calc(100% / 5)"
        h="45"
        fw="500"
        component={NavLink}
        to="/"
      >
        <Flex direction="column" align="center" justify="center" gap="5">
          <IconHome stroke={1.5} size={22} color="#A5A5A7" />
          <Text c="#A5A5A7" size="10px">
            خانه
          </Text>
        </Flex>
      </Button>

      <Button
        className="bottom-nav-btn"
        p="0"
        variant="transparent"
        size="xs"
        w="calc(100% / 5)"
        h="45"
        fw="500"
        onClick={category}
      >
        <Flex direction="column" align="center" justify="center" gap="5">
          <IconMenu2 stroke={1.5} size={22} color="#A5A5A7" />
          <Text c="#A5A5A7" size="10px">
            دسته‌بندی‌ها
          </Text>
        </Flex>
      </Button>

      <Button
        className="bottom-nav-btn"
        p="0"
        variant="transparent"
        size="xs"
        w="calc(100% / 5)"
        h="45"
        fw="500"
        onClick={basket}
      >
        <Flex direction="column" align="center" justify="center" gap="5">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <NewBasketIcon size={22} color="#A5A5A7" />
            {shouldShowCart && cartCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  height: '16px',
                  minWidth: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ed1944',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  padding: '2px 4px',
                  boxSizing: 'border-box',
                  zIndex: 1
                }}
              >
                {cartCount}
              </div>
            )}
          </div>
          <Text c="#A5A5A7" size="10px">
            سبد خرید
          </Text>
        </Flex>
      </Button>

      <Button
        className="bottom-nav-btn"
        p="0"
        variant="transparent"
        size="xs"
        w="calc(100% / 5)"
        h="45"
        fw="500"
        component={NavLink}
        to={user ? "/account/orders" : "/login"}
        onClick={handleOrdersClick}
      >
        <Flex direction="column" align="center" justify="center" gap="5">
          <IconShoppingCart stroke={1.5} size={22} color="#A5A5A7" />
          <Text c="#A5A5A7" size="10px">
            سفارش‌ها
          </Text>
        </Flex>
      </Button>

      <Button
        className="bottom-nav-btn"
        p="0"
        variant="transparent"
        size="xs"
        w="calc(100% / 5)"
        h="45"
        fw="500"
        component={NavLink}
        to={user ? "/account" : "/login"}
        onClick={handleAccountClick}
      >
        <Flex direction="column" align="center" justify="center" gap="5">
          <IconUser stroke={1.5} size={22} color="#A5A5A7" />
          <Text c="#A5A5A7" size="10px">
            حساب کاربری
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
}

export default BottomNavigation;