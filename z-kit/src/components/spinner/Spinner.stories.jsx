import { Spinner, Loader } from './Spinner';
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
    title: "Z-kit/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Spinner/Loader UI Component",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        size: {
            control: { type: "select" },
            name: "Size",
            description: "Choose spinner/Loader size",
        },
    }
}

export default meta;

// Story for Spinner component
export const spinner = {
    args: {
        darkmode: false,
        size: "medium",
    },
    render: (args) => <Spinner {...args} />
}

// Story for Loader component
export const loader = {
    args: {
        darkmode: false,
        size: "medium",
    },
    render: (args) => <Loader {...args} />
}