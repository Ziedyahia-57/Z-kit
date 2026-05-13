import { Radio } from './Radio';
import { useEffect } from 'react';

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
    title: "Z-kit/Radio",
    component: Radio,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Radio UI Component",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        label: {
            control: { type: "text" },
            name: "Label",
            description: "Label text for the radio button",
        },
        details: {
            control: { type: "text" },
            name: "Details",
            description: "Details text for the radio button",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the button is disabled",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    },
};

export default meta;

export const radio = {
    args: {
        darkmode: false,
        label: 'label',
        details: "details",
        disabled: false,
        enableSound: true,
        onClick: () => { },
    },
};