import { Date } from './Date';
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
    title: "Z-kit/Date Input",
    component: Date,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Date Input UI Component",
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
            description: "Label for the input",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the date input is disabled",
        },
        error: {
            control: { type: "boolean" },
            name: "Error",
            description: "Defines if the date input is in an error state",
            if: { arg: "disabled", neq: "true" },
        },
        errorText: {
            control: { type: "text" },
            name: "Error Text",
            description: "Placeholder text for the date input",
        }
    }
}

export default meta;

export const date = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false
    }
}