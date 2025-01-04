import { Anchor } from "@mantine/core";
import { 
  IconBrandInstagram, 
  IconBrandTelegram, 
  IconBrandX, 
  IconBrandFacebook, 
  IconBrandLinkedin, 
  IconBrandYoutube, 
  IconBrandTwitter, 
  IconBrandPinterest, 
  IconBrandSnapchat, 
  IconBrandWhatsapp 
} from "@tabler/icons-react";

const SocialLink = (props) => {
  switch (props.item.type) {
    case "instagram":
      return (
        <Anchor href={props.item.link} target="_blank" key={props.key}>
          <IconBrandInstagram size={30} className="text-gray-500" />
        </Anchor>
      );
    case "telegram":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandTelegram size={30} className="text-gray-500" />
        </Anchor>
      );
    case "x":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandX size={30} className="text-gray-500" />
        </Anchor>
      );
    case "facebook":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandFacebook size={30} className="text-gray-500" />
        </Anchor>
      );
    case "linkedin":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandLinkedin size={30} className="text-gray-500" />
        </Anchor>
      );
    case "youtube":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandYoutube size={30} className="text-gray-500" />
        </Anchor>
      );
    case "twitter":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandTwitter size={30} className="text-gray-500" />
        </Anchor>
      );
    case "pinterest":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandPinterest size={30} className="text-gray-500" />
        </Anchor>
      );
    case "snapchat":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandSnapchat size={30} className="text-gray-500" />
        </Anchor>
      );
    case "whatsapp":
      return (
        <Anchor href={props.link} target="_blank" key={props.key}>
          <IconBrandWhatsapp size={30} className="text-gray-500" />
        </Anchor>
      );
    default:
      return null;
  }
};

export default SocialLink;
