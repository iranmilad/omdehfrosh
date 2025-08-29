import { Flex, Loader, Overlay, Paper, Text } from "@mantine/core";
import { useEffect, useState } from "react";

const DelayedFullScreenLoader = ({showR, delay = 1000 }) => {

  const [show, setShow] = useState(showR);

  useEffect(() => {

    const timeout = setTimeout(() => {
      setShow(true);
    }, delay);
  
    return () => clearTimeout(timeout);
  }, [delay]);
  
  
  if (!show) return null;
  



  return (
    <>
      {/* Dark overlay */}
      <Overlay
        fixed
        zIndex={9998}
        color="#000"
        backgroundOpacity={0.5}
      />

      {/* Loader content */}
      <Flex
        pos="fixed"
        top={0}
        left={0}
        w="100%"
        h="100%"
        align="center"
        justify="center"
        style={{ zIndex: 999999999999999 }}
      >
        <Paper p="xl" radius="md" withBorder style={{ width: 'auto', height: 'auto', maxWidth: '500px' }}>
        <Flex direction="column" align="center" justify="center">
            <div className="w-[400px] flex items-center justify-center">
                <Loader size="xl" />
            </div>
            
            <Text mt="md">منتظر باشید ...</Text>
          </Flex>
        </Paper>
      </Flex>
    </>
  );
};

export default DelayedFullScreenLoader;
