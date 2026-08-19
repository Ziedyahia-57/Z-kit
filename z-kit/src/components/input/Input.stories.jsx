import { Input, PasswordInput, EmailInput, PhoneInput, PaymentInput, ColorInput } from './Input';
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

const withRTLControl = (Story, context) => {
    const { rtl = false } = context.args;

    return (
        <div className={rtl ? "rtl" : ""}>
            <Story />
        </div>
    );
};

const meta = {
    title: "Z-kit/Input",
    component: Input,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
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
        fadeIconOnFocus: {
            control: { type: "boolean" },
            name: "Fade Icon on Focus",
            description: "Defines if the button should fade when focused",
        }
    }
}

export default meta;

export const input = {
    args: {
        darkmode: false,
        label: "label",
        disabled: false,
        placeholder: "Placeholder",
        error: false,
        errorText: "invalid input",
        showIcon: true,
        fadeIconOnFocus: true
    }
}

export const passwordInput = {
    args: {
        darkmode: false,
        label: "Password",
        disabled: false,
        placeholder: "Password",
        showIcon: true,
        fadeIconOnFocus: true
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
        placeholder: "name@example.com",
        showIcon: true,
        fadeIconOnFocus: true
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
        placeholder: "+000 000 000 000",
        showIcon: true,
        fadeIconOnFocus: true
    },
    render: (args) => {
        return (<PhoneInput {...args} />)
    }
}

export const paymentInput = {
    args: {
        darkmode: false,
        label: "Payment",
        disabled: false,
        placeholder: "0000 0000 0000 0000",
        showIcon: true,
        fadeIconOnFocus: true
    },
    render: (args) => {
        return (<PaymentInput {...args} />)
    }
}
export const colorInput = {
    name: "Color Input",
    args: {
        darkmode: false,
        label: "Color",
        withSelect: false,
        disabled: false,
    },
    render: (args) => {
        return <ColorInput {...args} />;
    },
};


/**/
export const inputRTL = {
    name: "Input (rtl)",
    args: {
        darkmode: false,
        label: "الأسم",
        disabled: false,
        placeholder: "الأسم",
        error: false,
        errorText: "قيمة غير صالحة",
        showIcon: true,
        fadeIconOnFocus: true,
        rtl: true,
    },
};

export const passwordInputRTL = {
    name: "Password Input (rtl)",
    args: {
        darkmode: false,
        label: "كلمة المرور",
        disabled: false,
        placeholder: "كلمة المرور",
        showIcon: true,
        fadeIconOnFocus: true,
        rtl: true,
    },
    render: (args) => {
        return <PasswordInput {...args} />;
    },
};

export const emailInputRTL = {
    name: "Email Input (rtl)",
    args: {
        darkmode: false,
        label: "البريد الإلكتروني",
        disabled: false,
        placeholder: "name@example.com",
        showIcon: true,
        fadeIconOnFocus: true,
        rtl: true,
    },
    render: (args) => {
        return <EmailInput {...args} />;
    },
};

export const phoneInputRTL = {
    name: "Phone Input (rtl)",
    args: {
        darkmode: false,
        label: "رقم الهاتف",
        disabled: false,
        placeholder: "+000 000 000 000",
        showIcon: true,
        fadeIconOnFocus: true,
        rtl: true,
    },
    render: (args) => {
        return <PhoneInput {...args} />;
    },
};

export const paymentInputRTL = {
    name: "Payment Input (rtl)",
    args: {
        darkmode: false,
        label: "طريقة الدفع",
        disabled: false,
        placeholder: "0000 0000 0000 0000",
        showIcon: true,
        fadeIconOnFocus: true,
        rtl: true,
    },
    render: (args) => {
        return <PaymentInput {...args} />;
    },
};

export const colorInputRTL = {
    name: "Color Input (rtl)",
    args: {
        darkmode: false,
        label: "اللون",
        withSelect: false,
        disabled: false,
        rtl: true,
    },
    render: (args) => {
        return <ColorInput {...args} />;
    },
};