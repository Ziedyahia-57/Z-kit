import { toast } from './Toast';
import { Button } from '../button/Button';
import { useEffect } from 'react';

const withDarkModeControl = (Story, context) => {
    const { darkmode = false } = context.args;

    useEffect(() => {
        const main = document.querySelector(".sb-show-main");

        if (darkmode) {
            document.body.setAttribute("data-dark", "true");
            main?.style.setProperty("background", "var(--gray-950)", "important");
        } else {
            document.body.removeAttribute("data-dark");
            main?.style.setProperty("background", "var(--gray-25)", "important");
        }

        return () => {
            document.body.removeAttribute("data-dark");
            main?.style.removeProperty("background");
        };
    }, [darkmode]);

    return <Story />;
};

const meta = {
    title: "Z-kit/Toast",
    component: toast,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                component: "Toast UI Component - Displays temporary notifications with support for multiple types, positions, and actions.",
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
        description: {
            control: "text",
            name: "description",
            description: "Description of the toast",
        },
        duration: {
            control: "number",
            name: "duration",
            description: "Duration of the toast in milliseconds",
        },
        cancelText: {
            control: "text",
            name: "Cancel Text",
            description: "Text of the cancel button",
        },
        confirmText: {
            control: "text",
            name: "Confirm Text",
            description: "Text of the confirm button",
        },
        position: {
            control: "select",
            options: ["top-left", "top-middle", "top-right", "bottom-left", "bottom-middle", "bottom-right"],
            name: "Position",
            description: "Defines the position of the toast",
        },
        enableSound: {
            control: { type: "boolean" },
            name: "Enable Sound",
            description: "Enable/disable sound effects",
        },
        neutral: {
            control: { type: "boolean" },
            name: "Neutral",
            description: "When true, applies gray styling to all toast types (overrides type-specific colors)",
        }
    }
};

export default meta;

const ToastDemo = (args) => {
    const showToast = () => {
        toast({
            type: args.type,
            message: args.message,
            description: args.description,
            duration: args.duration,
            position: args.position,
            cancel: args.cancelText,
            accept: args.confirmText,
            enableSound: args.enableSound,
            neutral: args.neutral,
            onCancel: () => console.log("Cancel clicked"),
            onAccept: () => console.log("Accept clicked")
        });
    };

    return <Button label="Show Toast" onClick={showToast} />;
};

export const toastStory = {
    render: ToastDemo,
    args: {
        type: "success",
        message: "Upload complete",
        description: "24 files were uploaded and are now available to your team.",
        duration: 5000,
        cancelText: "",
        confirmText: "",
        position: "bottom-left",
        enableSound: true,
        darkmode: false,
        neutral: false,
    },
};