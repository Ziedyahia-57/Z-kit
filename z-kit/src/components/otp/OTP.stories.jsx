import { OTP } from './OTP';
import { useEffect } from 'react';


// Decorator that responds to a darkMode arg
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
    title: "Z-kit/OTP Input",
    component: OTP,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "OTP Input UI Component",
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
            description: "Label for the input",
        },
        slots: {
            control: { type: "number" },
            name: "Slots",
            description: "Control the number of slots for the input",
        },
        allowAlphanumeric: {
            control: { type: "boolean" },
            name: "Allow Alpha Numerals",
            description: "Defines if the OTP input allows alpha numerals",
        },
        autofocus: {
            control: { type: "boolean" },
            name: "Autofocus",
            description: "Defines if the OTP input is focused on load",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the OTP input is disabled",
        },
        error: {
            control: { type: "boolean" },
            name: "Error",
            description: "Defines if the OTP input is in an error state",
            if: { arg: "disabled", neq: "true" },
        },
        errorText: {
            control: { type: "text" },
            name: "Error Text",
            description: "Placeholder text for the OTP input",
        }
    }
}

export default meta;

export const otp = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false,
        slots: 6,
    }
}