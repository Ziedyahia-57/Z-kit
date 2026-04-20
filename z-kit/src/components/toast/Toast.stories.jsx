import { Toast } from './Toast';
import { useEffect } from 'react';

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
    title: "Z-kit/Toast",
    component: Toast,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Toast UI Component",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        type: {
            control: { type: "select" },
            name: "type",
            options: ["success", "error", "warning", "info"],
            description: "Defines the type of the toast",
        },
        message: {
            control: "text",
            name: "message",
            description: "Message of the toast",
        },
        duration: {
            control: "number",
            name: "duration",
            description: "Duration of the toast",
        },
        requiresAction: {
            control: { type: "boolean" },
            name: "Requires Action",
            description: "Defines whether the toast requires an action",
        },
        confirmText: {
            control: "text",
            name: "Confirm Text",
            description: "Text of the confirm button",
            if: { arg: "requiresAction", eq: true },
        },
        cancelText: {
            control: "text",
            name: "Cancel Text",
            description: "Text of the cancel button",
            if: { arg: "requiresAction", eq: true },
        },
        position: {
            control: "select",
            options: ["top", "bottom"],
            name: "Position",
            description: "Defines the position of the toast",
        },
        index: {
            control: "number",
            name: "Index",
            description: "Defines the index of the toast",
        },
        totalToasts: {
            control: "number",
            name: "Total Toasts",
            description: "Defines the total number of toasts",
        },
    }
};

export default meta;

export const toast = {
    args: {
        type: "success",
        message: "You can add at most 100 files to a chat. Please consider starting a new chat.",
        duration: 30000,
        requiresAction: false,
        confirmText: "Confirm",
        cancelText: "Cancel",
        position: "top",
        index: 0,
        totalToasts: 1,
        darkmode: false,
    },
}