import { Tag } from './Tag';
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
    title: "Z-kit/Tag",
    component: Tag,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Tag UI Component",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        color: {
            control: { type: "select" },
            name: "color",
            options: ["gray", "red", "orange", "yellow", "lime", "green", "lightBlue", "blue", "purple", "pink"],
            description: "Defines the color of the tag",
        },
        label: {
            control: "text",
            name: "Label",
            description: "Label of the tag",
        },
        tagType: {
            control: "radio",
            options: ["label", "label & icon"],
            name: "Tag Type",
            description: "Choose tag display mode",
        },
        icon: {
            control: { type: "select" },
            options: ["chart", "timer", "star", "check", "plus"],
            name: "Icon (when applicable)",
            description: "Icon to display when tag type includes icon",
            if: { arg: "tagType", neq: "label" },
        },
        removable: {
            control: { type: "boolean" },
            name: "Removable",
            description: "Defines whether the tag is removable",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the button is clicked",
        },
    }
};

export default meta;

export const tag = {
    args: {
        color: "gray",
        label: "Tag",
        tagType: "label & icon",
        icon: "chart",
        removable: false,
        darkmode: false,
    },
};