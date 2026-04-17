import { Accordion } from './Accordion';
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
    title: "Z-kit/Accordion",
    component: Accordion,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Accordion UI Component",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        // size: {
        //     control: { type: "select" },
        //     name: "Size",
        //     options: ["small", "medium", "large", "xlarge"],
        //     description: "Defines the size of the button",
        // },
        // disabled: {
        //     control: { type: "boolean" },
        //     name: "Disabled",
        //     description: "Defines if the button is disabled",
        // },
        question: {
            control: "text",
            name: "Question",
            description: "The question of the accordion",
        },
        answer: {
            control: "text",
            name: "Answer",
            description: "The answer of the accordion",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    },
};

export default meta;

export const accordion = {
    args: {
        darkmode: false,
        question: "Title",
        answer: "Answer the frequently asked question in a simple sentence, a longish paragraph, or even in a list.",
    },
};