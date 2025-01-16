import { useState, useEffect } from "react";
import {
  BackgroundImage,
  Box,
  Text,
  Center,
  RingProgress,
  ActionIcon,
} from "@mantine/core";
import { memo, useLayoutEffect } from "react";
import { useFileUploadMutation, useSend } from "../../../../Libs/api";
import { IconTrash } from "@tabler/icons-react";

const Preview = ({ file, url, deleteUrl, items, setItems, preview = true,onChange }) => {
  const deleteMutate = useSend({ url, method: "DELETE" });
  const [imageUrl, setImageUrl] = useState(null);
  const [success, setSuccess] = useState(false);

  useLayoutEffect(() => {
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
    else if (typeof file === "string"){
      setImageUrl(file);
    }
  }, [file]);

  function deleteFile() {
    deleteMutate.mutateAsync(null, {
      onSuccess: () => {
        setItems((item) => item.filter((item) => item !== file));
      },
    });
  }

  return (
    imageUrl !== null && (
      <BackgroundImage
        pos="absolute"
        top={0}
        left={0}
        style={{ overflow: "hidden",zIndex:10 }}
        w="100%"
        h={145}
        radius="lg"
        src={imageUrl}
      >
        {preview === true ? null : (
          <>
            {success && (
              <Box pos="absolute" top={7} right={7}>
                <ActionIcon
                  w={30}
                  h={30}
                  radius="xl"
                  color="dark"
                  onClick={() => deleteFile()}
                  loading={deleteMutate.isLoading}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              </Box>
            )}
            {!success && (
              <Center h="100%">
                <Blur />
                <Progressive
                  file={imageUrl}
                  sendUrl={url}
                  setSuccess={setSuccess}
                  setImageUrl={setImageUrl}
                  onChange={onChange}
                />
              </Center>
            )}
          </>
        )}
      </BackgroundImage>
    )
  );
};

const Blur = memo(function Blur() {
  return (
    <Box
      pos="absolute"
      w="100%"
      h="100%"
      bg="rgba(255,255,255,0.3)"
      style={{ backdropFilter: "blur(10px)", zIndex: 4 }}
    />
  );
});

const Progressive = memo(function Progressive(props) {
  const { mutateAsync, progress, isSuccess } = useFileUploadMutation(
    props.sendUrl
  );
  useEffect(() => {
    let form = new FormData();
    form.append("file", props.file);
    mutateAsync(form, {
      onSuccess: (data) => {
        if (data){
          props.setSuccess(isSuccess);
          props.onChange(data.data.url);
        } 
      },
    });
  }, []);

  return (
    <RingProgress
      style={{ zIndex: 6 }}
      sections={[{ value: progress || 0, color: "primary" }]}
      label={
        <Center>
          <Text c="black" fw={700} ta="center" size="xl">
            {!progress ? 0 : progress}
          </Text>
        </Center>
      }
    />
  );
});

export default Preview;
