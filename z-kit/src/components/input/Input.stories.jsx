import { Input, PasswordInput, EmailInput, PhoneInput } from './Input';
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
    title: "Z-kit/Input",
    component: Input,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Text Input UI Component",
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
        placeholder: {
            control: { type: "text" },
            name: "Placeholder",
            description: "Placeholder text for the input",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the button is disabled",
        },
        error: {
            control: { type: "boolean" },
            name: "Error",
            description: "Defines if the button is in an error state",
            if: { arg: "disabled", neq: "true" },
        },
        errorText: {
            control: { type: "text" },
            name: "Error Text",
            description: "Placeholder text for the textarea",
        },
        showIcon: {
            control: { type: "boolean" },
            name: "Show Icon",
            description: "Toggle icon visibility inside the input",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    }
}

export default meta;

export const input = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false,
        placeholder: "Placeholder",
        showIcon: true,
    }
}
export const passwordInput = {
    args: {
        darkmode: false,
        label: "Password",
        disabled: false,
        placeholder: "Placeholder",
        showIcon: true,
    },
    render: (args) => {
        return (<PasswordInput {...args} />)
    }
}

export const emailInput = {
    args: {
        darkmode: false,
        label: "email",
        disabled: false,
        placeholder: "Placeholder",
        showIcon: true,
    },
    render: (args) => {
        return (<EmailInput {...args} />)
    }
}

export const phoneInput = {
    args: {
        darkmode: false,
        label: "phone",
        disabled: false,
        placeholder: "Placeholder",
        showIcon: true,
    },
    render: (args) => {
        return (<PhoneInput {...args} />)
    }
}