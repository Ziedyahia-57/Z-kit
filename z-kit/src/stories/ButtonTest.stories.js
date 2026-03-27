import { bool } from "prop-types";
import { ButtonTest } from "./ButtonTest";

const meta = {
  title: "Z-kit/ButtonTest",
  component: ButtonTest,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large", "xlarge"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    label: {
      control: "text",
    },
    icon: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
// 👇 Type helper to reduce boilerplate

export const Primary = {
  args: {
    variant: "primary",
    label: "Button",
    size: "medium",
    disabled: false,
    icon: false,
  },
};

// export const Template = (args) => <ButtonTest {...args} />;
