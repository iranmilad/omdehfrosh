import { rem,Container, Paper, Title,Loader,Checkbox, Button, Modal, NavLink, Drawer, Anchor } from "@mantine/core";

export const CONTAINER_SIZES= {
  xxs: rem(300),
  xs: rem(400),
  sm: rem(500),
  md: rem(600),
  lg: rem(700),
  xl: rem(800),
  xxl: rem(1400),
  xxxl: "1720px",
};

const Theme = {
  fontFamily: "IranYekan, sans-serif",
  headings: { fontFamily: "IranYekan, sans-serif" },
  fontFamilyMonospace: "IranYekan, sans-serif",
  primaryColor: "brand",
  defaultRadius: "8px",
  primaryShade: 5,
  colors: {
    brand: [
      "#f0fde6",
      "#e3f6d5",
      "#c8ecad",
      "#abe082",
      "#93d75e",
      "#83d146",
      "#7ace39",
      "#67b62a",
      "#5aa221",
      "#4a8c14"
    ]    
  },
  components: {
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
            ? CONTAINER_SIZES[size]
            : rem(size),
        },
      }),
      defaultProps:{
        size: "xxl"
      }
    }),
    Button: Button.extend({
      defaultProps: {
        h: 40
      }
    }),
    Paper: Paper.extend({
      defaultProps:{
        shadow: "md",
        p:"md"
      }
    }),
    Title: Title.extend({
      defaultProps: {
        size: "md"
      }
    }),
    Loader: Loader.extend({
      defaultProps: {
        type:"dots"
      }
    }),
    Checkbox: Checkbox.extend({
      defaultProps: {
        radius: "sm"
      }
    }),
    NavLink: NavLink.extend({
      styles:{
        chevron: {
          transform: "rotate(90deg)"
        }
      }
    }),
    Anchor: Anchor.extend({
      defaultProps: {
        underline: "never"
      }
    })
  },
};

export default Theme;
