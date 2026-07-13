import { Video } from './Video';
import { useEffect } from 'react';
import defaultCaptions from './test.srt?url';


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
        chapters: {
            control: { type: "array" },
            name: "Chapters",
            description: "Chapters for the Video component",
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
        title: "Tears of Steel",
        username: "Ton Roosendaal",
        src: "",
        captionSrc: defaultCaptions,
        thumbnail: "",
        variant: "immersive",
        centered: false,
        verified: true,
        chapters: [
            { time: 0, title: "Launch Sequence" },
            { time: 23, title: "Thom and Celia's Breakup" },
            { time: 50, title: "Robot Memory Sync" },
            { time: 111, title: "Backstage Preparations" },
            { time: 233, title: "Thom's Final Rehearsal" },
            { time: 292, title: "Memory Overwrite Begins" },
            { time: 343, title: "A Different Approach" },
            { time: 374, title: "Celia Confronts Thom" },
            { time: 407, title: "The Apology" },
            { time: 428, title: "Final Attempt" },
            { time: 493, title: "Critical Moment" },
            { time: 518, title: "Changing the Past" },
            { time: 538, title: "Memory Restored" },
            { time: 559, title: "Epilogue" },
        ],
    }
}