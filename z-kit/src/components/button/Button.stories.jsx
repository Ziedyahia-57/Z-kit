import { Button } from "./Button";
import { useEffect } from "react";

// Decorator that responds to a darkMode arg
const withDarkModeControl = (Story, context) => {
  const { darkmode = false } = context.args;

  useEffect(() => {
    const main = document.querySelector(".sb-show-main");

    if (darkmode) {
      document.body.setAttribute("data-dark", "true");
      main?.style.setProperty("background", "var(--gray-950)", "important");
    } else {
      document.body.removeAttribute("data-dark");
      main?.style.setProperty("background", "var(--gray-25)", "important");
    }

    return () => {
      document.body.removeAttribute("data-dark");
      main?.style.removeProperty("background");
    };
  }, [darkmode]);

  return <Story />;
};

const withRTLControl = (Story, context) => {
  const { rtl = false } = context.args;

  return (
    <div className={rtl ? "rtl" : ""}>
      <Story />
    </div>
  );
};

const meta = {
  title: "Z-kit/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [withDarkModeControl, withRTLControl],
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
      options: ["primary", 'secondary', "outline", "ghost"],
      description: "Defines the variant of the button",
    },
    monochrome: {
      control: { type: "boolean" },
      name: "Monochrome",
      description: "Defines if the button is monochrome",
    },
    size: {
      control: { type: "select" },
      name: "Size",
      options: ["small", "medium", "large", "xlarge"],
      description: "Defines the size of the button",
    },
    disabled: {
      control: { type: "boolean" },
      name: "Disabled",
      description: "Defines if the button is disabled",
    },
    enableSound: {
      control: { type: "boolean" },
      name: "Enable Sound",
      description: "Defines if the button click sound is enabled",
    },
    children: {
      control: "text",
      name: "Label",
      description: "Content of the button",
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
    darkmode: false,
    variant: "primary",
    size: "medium",
    monochrome: false,
    disabled: false,
    submit: false,
    enableSound: true,
    onClick: () => { console.log("Button Clicked") },
  },
  render: (args) => (
    <Button {...args}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      Add
    </Button>
  ),
}
export const buttonRTL = {
  name: "Button (rtl)",
  args: {
    darkmode: false,
    variant: "primary",
    size: "medium",
    monochrome: false,
    disabled: false,
    submit: false,
    enableSound: true,
    onClick: () => { console.log("Button Clicked") },
    rtl: true,
  },
  render: (args) => (
    <Button {...args}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      إضافة
    </Button>
  ),
}