import { Anchor, Card, Image, Text } from "@mantine/core";

const ProductNotificationCard = ({ notification }) => {
  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Card.Section>
      <Image 
          src={notification.icon} 
          alt="icon" 
          style={{ width: "70px", height: "70px", objectFit: "contain" }} 
        />      
      </Card.Section>
      <Text weight={500} size="lg" mt="md">
        {notification.messageNotifProductAddedTitle}
      </Text>
      <Text size="sm" mt="xs" color="dimmed">
        {notification.messageNotifProductAddedDesc}
      </Text>
      <Card.Section mt="md">
        {/* ✅ Wrap Image inside an <a> to make it clickable */}
        <Anchor href={`/product/${notification.productId}`} underline="hover">
          <Image
            src={notification.img}
            height={50}
            alt="product"
            style={{ objectFit: "cover", borderRadius: "8px", cursor: "pointer" }}
          />
        </Anchor>
      </Card.Section>
    </Card>
  );
};

export default ProductNotificationCard;
