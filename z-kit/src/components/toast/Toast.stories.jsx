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

const withRTLControl = (Story, context) => {
    const { rtl = false } = context.args;

    return (
        <div className={rtl ? "rtl" : ""}>
            <Story />
        </div>
    );
};

const meta = {
    title: "Z-kit/Toast",
    component: toast,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
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
        title: {
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
        action: {
            control: "text",
            name: "Action Text",
            description: "Text of the action button",
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
            description: "When true, applies gray styling to all loading bars",
        }
    }
};

export default meta;

const ToastDemo = (args) => {
    const showToast = () => {
        toast({
            type: args.type,
            title: args.title,
            description: args.description,
            action: args.action,
            duration: args.duration,
            position: args.position,
            action: args.action,
            enableSound: args.enableSound,
            neutral: args.neutral,
            onAction: () => console.log("Action clicked")
        });
    };

    return <Button buttonType="label & icon" icon="plus" variant="secondary" onClick={showToast}>Add Event</Button>;
};

export const toastComponent = {
    name: "Toast",
    render: ToastDemo,
    args: {
        type: "success",
        title: "Event Created",
        description: "Sunday, December 03 at 09:00AM.",
        action: "Undo",
        duration: 5000,
        position: "bottom-left",
        enableSound: true,
        darkmode: false,
        neutral: false,
    },
};

export const toastComponentRTL = {
    name: "Toast (rtl)",
    render: ToastDemo,
    args: {
        type: "success",
        title: "تم إنشاء الفعالية",
        description: "الأحد، 3 ديسمبر الساعة 09:00 صباحًا.",
        action: "إلغاء",
        duration: 5000,
        position: "bottom-left",
        enableSound: true,
        darkmode: false,
        neutral: false,
        rtl: true,
    },
};