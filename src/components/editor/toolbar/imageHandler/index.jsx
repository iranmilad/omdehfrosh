import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { useNode } from "@craftjs/core";
import { Image, Box, SimpleGrid, ActionIcon, Flex, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import DropzonePreview from "./preview";
import { shallowEqual, useIsFirstRender } from "@mantine/hooks";
import { IconTrash, IconUpload } from "@tabler/icons-react";

const ImageHandler = ({
  url,
  deleteUrl,
  label,
  items,
  setItems,
  maxFiles,
  maxSize,
  children,
  onChange,
}) => {
  const [files, setFiles] = useState([]);
  const [defaultPreview, setDefaultPreview] = useState(true);
  const previews = files.map((file, index) => {
    return (
      <DropzonePreview
        preview={defaultPreview}
        file={file}
        key={index}
        url={url}
        deleteUrl={deleteUrl}
        setItems={setFiles}
        onChange={successUpload}
      />
    );
  });

  function onDrop(acceptedFiles) {
    setFiles(acceptedFiles);
    setDefaultPreview(false);
  }

  useEffect(() => {
    setFiles(items);
  }, [items]);

  const removeImage = () => {
    onChange("");
    setFiles([]);
  };

  function successUpload(val) {
    setFiles([val]);
    setDefaultPreview(true);
    onChange(val);
  }

  const openRef = useRef(null);
  return (
    <>
    {label && <Text size="xs" mb="sm">{label}</Text>}
      <Box h={145} w="100%" pos="relative">
        {files.length > 0 && files[0] !== "" && (
          <ActionIcon
            style={{ zIndex: 30 }}
            size="sm"
            color="red"
            pos="absolute"
            top={10}
            left={10}
            onClick={removeImage}
          >
            <IconTrash size={14} />
          </ActionIcon>
        )}
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          maxFiles={maxFiles || 1}
          maxSize={maxSize || 2 * 1024 * 1024} // 2MB
          onReject={(e) => {
            e[0].errors.map((item) => {
              if (item.code === "too-many-files") {
                notifications.show({
                  color: "red",
                  message: "فقط میتوانید 1 فایل آپلود کنید",
                });
              } else if (item.code === "file-too-large") {
                notifications.show({
                  color: "red",
                  message: "حجم فایل باید حداکثر 10 مگابایت باشد",
                });
              } else if (item.code === "file-too-small") {
                notifications.show({
                  color: "red",
                  message: "حجم فایل باید حداقل 1 کیلوبایت باشد",
                });
              } else if (item.code === "file-invalid-type") {
                notifications.show({
                  color: "red",
                  message: "نوع فایل نامعتبر است. لطفاً یک فایل مجاز انتخاب کنید",
                });
              } else {
                notifications.show({
                  color: "red",
                  message: `خطای ناشناخته: ${item.code}`,
                });
              }
            });            
          }}
          styles={{
            root: {
              display: "none",
              border: 0,
            },
          }}
          openRef={openRef}
          onDrop={onDrop}
          activateOnClick={false}
        ></Dropzone>
        {(files.length < 1 || files[0] === "") && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            pos="absolute"
            top={0}
            left={0}
            style={{
              zIndex: 20,
              borderRadius: "16px",
              cursor: "pointer",
              backgroundColor: "var(--mantine-color-gray-1)"
            }}
            h={145}
            w="100%"
            onClick={() => openRef.current?.()}
          >
            <IconUpload />
            <Text>آپلود تصویر</Text>
          </Flex>
        )}
        {previews}
      </Box>
    </>
  );
};

const MemoizedImageHandler = React.memo(ImageHandler, (prev, next) => {
  return !shallowEqual(prev, next);
});

export default MemoizedImageHandler;
