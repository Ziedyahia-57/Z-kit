import { Video } from './Video';
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
    title: "Z-kit/Video",
    component: Video,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Video Input UI Component",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        src: {
            control: { type: "text" },
            name: "Video Link",
            description: "Link for the Video component",
        },
        thumbnail: {
            control: { type: "text" },
            name: "Thumbnail Link",
            description: "Thumbnail for the Video component",
        },
        variant: {
            control: { type: "select" },
            name: "Variant",
            options: ["immersive", 'cinematic'],
            description: "changes the Video component's style and controls",
        },
        centered: {
            control: { type: "boolean" },
            name: "Centered Controls",
            description: "Centers the Video component's controls",
        },
        verified: {
            control: { type: "boolean" },
            name: "Verified",
            description: "Adds a verified badge to the user's profile link",
        },
        title: {
            control: { type: "text" },
            name: "Title",
            description: "Title for the Video component",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    }
}

export default meta;

export const video = {
    args: {
        darkmode: false,
        src: "",
        thumbnail: "",
        variant: "immersive",
        centered: false,
        title: "Video Title",
        verified: true,
    }
}