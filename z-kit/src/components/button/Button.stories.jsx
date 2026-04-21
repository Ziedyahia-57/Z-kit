import { Button } from "./Button";
import { useEffect } from "react";

// Decorator that responds to a darkMode arg
const withDarkModeControl = (Story, context) => {
  const { darkmode = false } = context.args;

  useEffect(() => {
    if (darkmode) {
      document.body.setAttribute("data-dark", "true");
    } else {
      document.body.removeAttribute("data-dark");
    }

    return () => {
      document.body.removeAttribute("data-dark");
    };
  }, [darkmode]);

  return (
    <Story />
  );
};


const meta = {
  title: "Z-kit/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [withDarkModeControl],
  parameters: {
    docs: {
      description: {
        story: "Adjustable Button UI",
      },
    },
  },
  argTypes: {
    darkmode: {
      control: { type: "boolean" },
      name: "Dark Mode",
      description: "Toggle dark mode theme",
    },
    variant: {
      control: { type: "select" },
      name: "Variant",
      options: ["primary", "secondary", "ghost"],
      description: "Defines the variant of the button",
    },
    size: {
      control: { type: "select" },
      name: "Size",
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
      name: "Disabled",
      description: "Defines if the button is disabled",
    },
    label: {
      control: "text",
      name: "Label",
      description: "Label of the button",
      if: { arg: "buttonType", neq: "icon" },
    },
    icon: {
      control: { type: "select" },
      options: ["play", "pause", "star", "heart", "check", "plus"],
      name: "Icon (when applicable)",
      description: "Icon to display when button type includes icon",
      if: { arg: "buttonType", neq: "label" },
    },
    iconPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      name: "Icon Position",
      description: "Position of icon relative to label",
      if: { arg: "buttonType", eq: "label & icon" },
    },
    onClick: {
      action: "clicked",
      name: "onClick",
      description: "Defines the action to be performed when the button is clicked",
    },
  },
};

export default meta;

export const button = {
  args: {
    darkmode: true,
    variant: "primary",
    colorScheme: "primaryColor",
    label: "Button",
    size: "large",
    disabled: false,
    buttonType: "label",
    icon: null,
    iconPosition: "left",
  },
};