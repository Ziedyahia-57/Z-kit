import { Time } from './Time';
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
    title: "Z-kit/Time",
    component: Time,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Time Input UI Component",
            },
        }
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
            description: "Label for the time input",
        },
        placeholder: {
            control: { type: "text" },
            name: "Placeholder",
            description: "Placeholder text for the time input",
        },
        showSeconds: {
            control: { type: "boolean" },
            name: "Use Seconds",
            description: "Defines if the input should display seconds",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the button is disabled",
        },
        error: {
            control: { type: "boolean" },
            name: "Error",
            description: "Defines if the button is in an error state",
            if: { arg: "disabled", neq: "true" },
        },
        errorText: {
            control: { type: "text" },
            name: "Error Text",
            description: "Placeholder text for the textarea",
        },
        showIcon: {
            control: { type: "boolean" },
            name: "Show Icon",
            description: "Toggle icon visibility inside the time input",
        },
        format: {
            control: { type: "select" },
            options: ["auto", "12h", "24h"],
            name: "Time Format",
            description: "Defines the time format for the input",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    }
}

export default meta;

export const time = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false,
        placeholder: "Placeholder",
        showIcon: true,
        showSeconds: false,
        format: "auto",
    }
}