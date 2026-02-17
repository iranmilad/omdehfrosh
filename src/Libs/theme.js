import { rem, Container, Paper, Title, Loader, Checkbox, Button, Modal, NavLink, Drawer, Anchor } from "@mantine/core";

export const CONTAINER_SIZES = {
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
  fontFamily: '"IRANYekanXFaNum-Web", sans-serif',
  headings: { fontFamily: '"IRANYekanXFaNum-Web", sans-serif' },
  fontFamilyMonospace: '"IRANYekanXFaNum-Web", sans-serif',
  primaryColor: "brand",
  defaultRadius: "8px",
  primaryShade: 9,
  colors: {
    brand: [
      "#e8f0fa", // very light icy blue
      "#d2e0f3", // pale soft blue
      "#b7cceb", // light calm blue
      "#9bb7e2", // soft medium blue
      "#7fa1d8", // balanced soft blue
      "#5e87c8", // core cool blue
      "#3f6db3", // deeper muted blue
      "#255595", // rich dark blue
      "#0f427a", // stronger navy-blue tone
      "#093572"  // your target deep navy (#093572)
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
      defaultProps: {
        size: "xxl",
        px: 0  // Remove horizontal padding
      },
      styles: {
        root: {
          paddingLeft: 0,
          paddingRight: 0
        }
      }
    }),
    Button: Button.extend({
      defaultProps: {
        h: 40
      }
    }),
    Paper: Paper.extend({
      defaultProps: {
        shadow: "md",
        p: "md"
      }
    }),
    Title: Title.extend({
      defaultProps: {
        size: "md"
      }
    }),
    Loader: Loader.extend({
      defaultProps: {
        type: "dots"
      }
    }),
    Checkbox: Checkbox.extend({
      defaultProps: {
        radius: "sm"
      }
    }),
    NavLink: NavLink.extend({
      styles: {
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