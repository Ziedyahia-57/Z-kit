import { toast } from './Toast2';
import { Button } from '../button/Button';
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
                component: "Toast UI Component",
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
            description: "Duration of the toast",
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
            options: ["top-left", "top-right", "bottom-left", "bottom-right"],
            name: "Position",
            description: "Defines the position of the toast",
        },
        enableSound: {
            control: { type: "boolean" },
            name: "Enable Sound",
            description: "Enable/disable sound effects",
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
        message: "You can add at most 100 files to a chat. Please consider starting a new chat.",
        description: "",
        duration: 3000,
        cancelText: "",
        confirmText: "",
        position: "bottom-left",
        enableSound: true,
        darkmode: false,
    },
};