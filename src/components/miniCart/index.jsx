import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Drawer,
  Flex,
  Image,
  Indicator,
  Loader,
  NumberFormatter,
  ScrollArea,
  Stack,
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { useData, useSend } from "../../Libs/api";
import { setInitial } from "../../redux/cart";
import InfoBox from "../InfoBox";

const MiniBox = ({ id, title, image, price, quantity }) => {
  const dispatch = useDispatch();
  const {mutateAsync,isPending} = useSend({url:"/cart/remove"});
  const removeItem = () => {
    mutateAsync({id},{
      onSuccess:(data) => {
        if (data?.total) {
          dispatch(setInitial(data.items));
        } else {
          dispatch(setInitial([]));
        }
      }
    })
  }
  return (
    <Flex gap="5" pt="sm">
      <Anchor component={NavLink} to={`product/${id}`}>
        <Image src={image} w={80} h={80} fit="contain" radius="sm" />
      </Anchor>
      <Flex gap="0" direction="column" flex="1">
        <Flex align="baseline" justify="space-between">
          <Text
            component={NavLink}
            to={`product/${id}`}
            className="line-clamp-2"
          >
            {title}
          </Text>
          <ActionIcon color="red" variant="light" loading={isPending} onClick={() => removeItem()}>
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
        <Flex
          dir="ltr"
          gap="sm"
          align="end"
          justify="space-between"
          direction="row"
          w="max-content"
        >
          <NumberFormatter thousandSeparator value={price} />
          <Text c="var(--mantine-primary-color-filled)">x {quantity}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

const MiniCart = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const ref = useRef();
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const { data, isLoading } = useData({ url: "/minicart" ,queryKey:['']});

  useEffect(() => {
    if (data?.total) {
      dispatch(setInitial(data.items));
    } else {
      dispatch(setInitial([]));
    }
  }, [isLoading]);

  return (
    <>
      <Indicator
        offset={2}
        withBorder
        size={20}
        label={items?.length > 0 ? items.length : ""}
        disabled={isLoading || !data?.total || !items || items.length === 0}
        color="red"
        inline
        styles={{
          indicator: {paddingTop: "1px" },
        }}
      >
        <ActionIcon h={45} color="red" variant="light" size="xl" onClick={open}>
          <IconShoppingCart />
        </ActionIcon>
      </Indicator>
      <Drawer.Root
        opened={opened}
        onClose={close}
        styles={{ inner: { right: 0 } }}
      >
        <Drawer.Overlay />
        <Drawer.Content ref={ref} h="100%">
          <Drawer.Header>
            <Drawer.Title>سبد خرید</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          {isLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <>
              {items.length === 0 ? (
                <InfoBox back={false} shadow="0">
                      سبد خرید خالی است
                    </InfoBox>
              ) : (
                <>
                  <Drawer.Body h="90%">
                    <ScrollArea
                      h="100%"
                      type="hover"
                      className="inset-shadow-sm"
                    >
                      <Stack className="divide-y">
                        {items.map((item, index) => (
                          <MiniBox key={index} {...item} />
                        ))}
                      </Stack>
                    </ScrollArea>
                  </Drawer.Body>
                  <Flex
                    className="border-t border-t-gray-200 pt-3"
                    justify="space-between"
                    align="center"
                    h="50px"
                    pos="fixed"
                    bottom={0}
                    right={0}
                    w="100%"
                    px="xs"
                    pb="sm"
                  >
                    <Flex direction="column" align="start">
                      <Text size="sm" c="gray" component="span">
                        جمع کل
                      </Text>
                      <Text component="span">
                        <NumberFormatter
                          thousandSeparator
                          value={data?.total}
                        />
                      </Text>
                    </Flex>
                    <Button
                      onClick={() => {
                        navigate("/basket");
                        close();
                      }}
                    >
                      ادامه
                    </Button>
                  </Flex>
                </>
              )}
            </>
          )}
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default MiniCart;
