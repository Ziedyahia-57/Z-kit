import { ButtonTest } from "./ButtonTest";

const meta = {
  title: "Z-kit/ButtonTest",
  component: ButtonTest,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        story: "Adjustable Button UI",
      },
    },
  },
  argTypes: {
    primaryColor: {
      control: "color",
      name: "Primary Color",
      description: "Main color used for primary and outline variants",
    },
    secondaryColor: {
      control: "color",
      name: "Secondary Color",
      description: "Secondary color used for secondary and ghost variants",
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost"],
      description: "Defines the variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large", "xlarge"],
      description: "Defines the size of the button",
    },
    buttonType: {
      control: "radio",
      options: ["label", "label & icon", "icon"],
      name: "Button Type",
      description: "Choose button display mode",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Defines if the button is disabled",
    },
    label: {
      control: "text",
      description: "Label of the button",
      if: { arg: "buttonType", neq: "icon" }, // Only show for label & icon
    },
    icon: {
      control: { type: "select" },
      options: ["play", "pause", "star", "heart", "check", "plus"],
      name: "Icon (when applicable)",
      description: "Icon to display when button type includes icon",
      if: { arg: "buttonType", neq: "label" }, // Only show when icon is used
    },
    iconPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      name: "Icon Position",
      description: "Position of icon relative to label",
      if: { arg: "buttonType", eq: "label & icon" }, // Only show for label & icon
    },
    onClick: {
      action: "clicked",
      description: "Defines the action to be performed when the button is clicked",
    },
  },
};

export default meta;
// 👇 Type helper to reduce boilerplate

export const Button = {
  args: {
    variant: "primary",
    primaryColor: "#1a1a1a",
    secondaryColor: "#272727",
    label: "Button",
    size: "medium",
    disabled: false,
    icon: false,
  },
};

// export const Template = (args) => <ButtonTest {...args} />;
