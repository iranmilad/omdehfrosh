import { ActionIcon, Button, Flex, Text } from "@mantine/core";
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";

// Custom icon components - Unfilled versions
const HomeIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M15.4999 11.0002H12.4999V14.0002H15.4999V11.0002Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.6354 2.53928C11.4039 1.82154 12.597 1.82154 13.3656 2.53928L23.0011 11.5379L21.636 12.9996L19.5012 11.0059V18.0002C19.5012 19.6571 18.158 21.0002 16.5012 21.0002H7.49898C5.84212 21.0002 4.49898 19.6571 4.49898 18.0002V11.0066L2.36496 12.9996L0.999878 11.5379L10.6354 2.53928ZM12.0005 4.00098L17.5012 9.13807V18.0002C17.5012 18.5525 17.0535 19.0002 16.5012 19.0002H7.49898C6.94669 19.0002 6.49898 18.5525 6.49898 18.0002V9.13883L12.0005 4.00098Z" />
  </svg>
);

// Filled version for active state
const HomeIconFilled = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M20 11.586v6.586a3 3 0 01-3 3H7a3 3 0 01-3-3v-6.586l-1.293 1.293-1.414-1.415L9.879 2.88a3 3 0 014.242 0l8.586 8.585-1.414 1.415L20 11.586z" />
  </svg>
);

const CategoryIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M6.99951 10.75H4.99951C2.57951 10.75 1.24951 9.42 1.24951 7V5C1.24951 2.58 2.57951 1.25 4.99951 1.25H6.99951C9.41951 1.25 10.7495 2.58 10.7495 5V7C10.7495 9.42 9.41951 10.75 6.99951 10.75ZM4.99951 2.75C3.41951 2.75 2.74951 3.42 2.74951 5V7C2.74951 8.58 3.41951 9.25 4.99951 9.25H6.99951C8.57951 9.25 9.24951 8.58 9.24951 7V5C9.24951 3.42 8.57951 2.75 6.99951 2.75H4.99951Z" />
    <path d="M18.9995 10.75H16.9995C14.5795 10.75 13.2495 9.42 13.2495 7V5C13.2495 2.58 14.5795 1.25 16.9995 1.25H18.9995C21.4195 1.25 22.7495 2.58 22.7495 5V7C22.7495 9.42 21.4195 10.75 18.9995 10.75ZM16.9995 2.75C15.4195 2.75 14.7495 3.42 14.7495 5V7C14.7495 8.58 15.4195 9.25 16.9995 9.25H18.9995C20.5795 9.25 21.2495 8.58 21.2495 7V5C21.2495 3.42 20.5795 2.75 18.9995 2.75H16.9995Z" />
    <path d="M18.9995 22.75H16.9995C14.5795 22.75 13.2495 21.42 13.2495 19V17C13.2495 14.58 14.5795 13.25 16.9995 13.25H18.9995C21.4195 13.25 22.7495 14.58 22.7495 17V19C22.7495 21.42 21.4195 22.75 18.9995 22.75ZM16.9995 14.75C15.4195 14.75 14.7495 15.42 14.7495 17V19C14.7495 20.58 15.4195 21.25 16.9995 21.25H18.9995C20.5795 21.25 21.2495 20.58 21.2495 19V17C21.2495 15.42 20.5795 14.75 18.9995 14.75H16.9995Z" />
    <path d="M6.99951 22.75H4.99951C2.57951 22.75 1.24951 21.42 1.24951 19V17C1.24951 14.58 2.57951 13.25 4.99951 13.25H6.99951C9.41951 13.25 10.7495 14.58 10.7495 17V19C10.7495 21.42 9.41951 22.75 6.99951 22.75ZM4.99951 14.75C3.41951 14.75 2.74951 15.42 2.74951 17V19C2.74951 20.58 3.41951 21.25 4.99951 21.25H6.99951C8.57951 21.25 9.24951 20.58 9.24951 19V17C9.24951 15.42 8.57951 14.75 6.99951 14.75H4.99951Z" />
  </svg>
);

// Filled version
const CategoryIconFilled = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M6.99951 10.75H4.99951C2.57951 10.75 1.24951 9.42 1.24951 7V5C1.24951 2.58 2.57951 1.25 4.99951 1.25H6.99951C9.41951 1.25 10.7495 2.58 10.7495 5V7C10.7495 9.42 9.41951 10.75 6.99951 10.75Z" />
    <path d="M18.9995 10.75H16.9995C14.5795 10.75 13.2495 9.42 13.2495 7V5C13.2495 2.58 14.5795 1.25 16.9995 1.25H18.9995C21.4195 1.25 22.7495 2.58 22.7495 5V7C22.7495 9.42 21.4195 10.75 18.9995 10.75Z" />
    <path d="M18.9995 22.75H16.9995C14.5795 22.75 13.2495 21.42 13.2495 19V17C13.2495 14.58 14.5795 13.25 16.9995 13.25H18.9995C21.4195 13.25 22.7495 14.58 22.7495 17V19C22.7495 21.42 21.4195 22.75 18.9995 22.75Z" />
    <path d="M6.99951 22.75H4.99951C2.57951 22.75 1.24951 21.42 1.24951 19V17C1.24951 14.58 2.57951 13.25 4.99951 13.25H6.99951C9.41951 13.25 10.7495 14.58 10.7495 17V19C10.7495 21.42 9.41951 22.75 6.99951 22.75Z" />
  </svg>
);

const BasketIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path fillRule="evenodd" d="M7.543 19.952a1.296 1.296 0 0 1 0 2.589 1.296 1.296 0 0 1 0-2.59m11.28 0c.716 0 1.297.58 1.297 1.294s-.581 1.295-1.296 1.295a1.296 1.296 0 0 1 0-2.59M3.269 3.009l2.08.36c.335.06.59.337.619.677l.235 2.801h.873l.424.001h1.604l.38.001h1.77l.33.001h1.242l.291.001h1.092l.255.001h.952l.222.001h.625l.196.001h.725l.166.001h.612l.14.001h.389l.12.001h.433l.097.001h.267l.08.001h.286l.063.001h.167l.05.001h.17l.035.001h.093l.026.001h.067l.018.001h.046l.012.001h.028l.008.001h.02l.004.001.013.001a2.08 2.08 0 0 1 1.38.82c.335.447.475.998.395 1.55l-.95 6.558a2.56 2.56 0 0 1-2.522 2.19H7.975a2.56 2.56 0 0 1-2.54-2.344L4.52 4.748l-1.507-.26A.75.75 0 0 1 2.4 3.62a.76.76 0 0 1 .867-.61m3.607 5.339h-.547l.603 7.171c.044.552.495.966 1.046.966h10.917c.52 0 .966-.388 1.04-.903l.95-6.559a.59.59 0 0 0-.112-.438.58.58 0 0 0-.388-.23h-.16l-.076.001h-.566l-.149.001h-1.559l-1.52-.001h-1.136l-.297-.001-.91-.001h-.938l-.317-.001-.958-.001h-.96l-.32-.001h-.636l-.315-.001h-.93l-.304-.001-1.176-.001zm10.413 2.196a.75.75 0 0 1 0 1.5h-2.773a.75.75 0 1 1 0-1.5z" clipRule="evenodd" />
  </svg>
);

const BillIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M8.875 13.775a.75.75 0 1 1 0 1.5h-.294a.75.75 0 1 1 0-1.5zM15.855 13.775a.747.747 0 0 1 .75.75.75.75 0 0 1-.75.75h-4.178a.75.75 0 0 1 0-1.5zM8.875 8.727a.75.75 0 1 1 0 1.5h-.294a.749.749 0 0 1-.441-1.358.75.75 0 0 1 .441-.142zM15.855 8.727a.75.75 0 0 1 0 1.5h-4.178a.75.75 0 0 1 0-1.5z" />
    <path fillRule="evenodd" d="M15.86 2.25c1.368 0 2.524.43 3.335 1.29.805.853 1.181 2.038 1.181 3.386l.01 12.254a1.953 1.953 0 0 1-2.796 1.763l-.76-.365a1.03 1.03 0 0 0-.837-.023l-2.142.875a4.32 4.32 0 0 1-3.267 0l-2.147-.875a1.03 1.03 0 0 0-.835.023l-.001.002-.754.361a1.954 1.954 0 0 1-2.797-1.765l.017-12.252c0-1.342.367-2.526 1.164-3.381.805-.863 1.959-1.293 3.33-1.293zm-7.298 1.5c-1.054 0-1.773.322-2.234.814-.467.502-.76 1.28-.76 2.362L5.55 19.178c0 .144.063.267.16.35.13.107.316.142.488.06l.753-.361a2.52 2.52 0 0 1 2.053-.061l2.147.875c.683.28 1.45.28 2.133 0l2.142-.875a2.53 2.53 0 0 1 2.051.06l.761.364c.3.142.648-.076.648-.41l-.01-12.254c0-1.078-.299-1.856-.773-2.358-.468-.496-1.193-.818-2.243-.818z" clipRule="evenodd" />
  </svg>
);

// Filled version
const BillIconFilled = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path fillRule="evenodd" d="M11.999 21.502a4.1 4.1 0 0 1-1.539-.3l-2.147-.88a1.32 1.32 0 0 0-1.044.03l-.748.357a1.69 1.69 0 0 1-1.64-.087 1.7 1.7 0 0 1-.8-1.445L4.1 6.917c0-2.766 1.586-4.418 4.243-4.418h7.299c2.63 0 4.265 1.693 4.265 4.419l.01 12.26a1.7 1.7 0 0 1-.794 1.444 1.7 1.7 0 0 1-1.643.096l-.759-.367a1.3 1.3 0 0 0-1.04-.03l-2.142.88c-.498.2-1.02.3-1.54.3M8.363 10.229h.295a.75.75 0 0 0 0-1.5h-.295a.75.75 0 0 0 0 1.5m3.097 0h4.178a.75.75 0 0 0 0-1.5H11.46a.75.75 0 0 0 0 1.5m-3.097 5.05h.295a.75.75 0 0 0 0-1.5h-.295a.75.75 0 0 0 0 1.5m3.097 0h4.178a.75.75 0 0 0 0-1.5H11.46a.75.75 0 0 0 0 1.5" clipRule="evenodd" />
  </svg>
);

const ProfileIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M18.417 19.731c0-.859-.338-1.83-1.184-2.591-.844-.761-2.262-1.374-4.524-1.374s-3.68.616-4.524 1.381C7.338 17.914 7 18.891 7 19.75a.75.75 0 0 1-1.5 0c0-1.25.494-2.64 1.678-3.714 1.186-1.075 2.997-1.77 5.531-1.77 2.532 0 4.342.69 5.528 1.76 1.185 1.068 1.68 2.455 1.68 3.705a.75.75 0 0 1-1.5 0M16.084 7.876a3.375 3.375 0 1 0-6.75-.001 3.375 3.375 0 0 0 6.75.001m1.5 0a4.875 4.875 0 1 1-9.75 0 4.875 4.875 0 0 1 9.75 0" />
  </svg>
);

// Filled version
const ProfileIconFilled = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M12.401 14.516c4.979 0 7.208 2.745 7.208 5.465a.75.75 0 0 1-.749.75l-12.918.019a.75.75 0 0 1-.75-.75c0-2.73 2.23-5.484 7.21-5.484M12.401 3.25a4.88 4.88 0 0 1 4.875 4.875 4.88 4.88 0 0 1-4.875 4.876 4.88 4.88 0 0 1-4.875-4.876 4.88 4.88 0 0 1 4.875-4.875" />
  </svg>
);

function BottomNavigation({ category, search, basket, user, isCategoryOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const { isVerified } = useSelector((state) => state.auth);
  
  // Calculate cart count
  const shouldShowCart = user && isVerified;
  const cartCount = shouldShowCart ? (cartItems?.length || 0) : 0;

  // Check active routes
  const isHomeActive = location.pathname === '/';
  const isOrdersActive = location.pathname.startsWith('/account/orders');
  const isAccountActive = location.pathname.startsWith('/account') && !isOrdersActive;

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
          {isHomeActive ? (
            <HomeIconFilled size={22} color="#093672" />
          ) : (
            <HomeIcon size={22} color="#9a9da2" />
          )}
          <Text c={isHomeActive ? "#1a1b1c" : "#81858b"} size="10px">
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
          {isCategoryOpen ? (
            <CategoryIconFilled size={22} color="#093672" />
          ) : (
            <CategoryIcon size={22} color="#9a9da2" />
          )}
          <Text c={isCategoryOpen ? "#1a1b1c" : "#81858b"} size="10px">
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
            <BasketIcon size={22} color="#9a9da2" />
            {shouldShowCart && cartCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-6px',
                  height: '14px',
                  minWidth: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ed1944',
                  color: '#fff',
                  fontSize: '8px',
                  fontWeight: 600,
                  borderRadius: '3px',
                  padding: '1px 3px',
                  boxSizing: 'border-box',
                  zIndex: 1
                }}
              >
                {cartCount}
              </div>
            )}
          </div>
          <Text c="#81858b" size="10px">
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
          {isOrdersActive ? (
            <BillIconFilled size={22} color="#093672" />
          ) : (
            <BillIcon size={22} color="#9a9da2" />
          )}
          <Text c={isOrdersActive ? "#1a1b1c" : "#81858b"} size="10px">
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
          {isAccountActive ? (
            <ProfileIconFilled size={22} color="#093672" />
          ) : (
            <ProfileIcon size={22} color="#9a9da2" />
          )}
          <Text c={isAccountActive ? "#1a1b1c" : "#81858b"} size="10px">
            حساب کاربری
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
}

export default BottomNavigation;