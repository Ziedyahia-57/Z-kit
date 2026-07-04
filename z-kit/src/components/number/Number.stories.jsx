import { Number } from './Number';
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
    title: "Z-kit/Number",
    component: Number,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Number Input UI Component",
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
            description: "Label for the number input",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the button is disabled",
        },
        orientation: {
            control: { type: "select" },
            options: ["horizontal", "vertical"],
            name: "Button Orientation",
            description: "Toggle icon visibility inside the number input",
        },
        min: {
            control: { type: "number" },
            name: "Min. Number",
            description: "Set the minimum value for the number input",
        },
        max: {
            control: { type: "number" },
            name: "Max. Number",
            description: "Set the maximum value for the number input",
        },

    }
}

export default meta;

export const number = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false,
        min: 0,
        max: 100,
        orientation: "horizontal",
    }
}