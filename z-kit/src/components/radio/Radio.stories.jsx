import { Radio } from './Radio';
import { useEffect, useState } from 'react';

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
    title: "Z-kit/Radio",
    component: Radio,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
    parameters: {
        docs: {
            description: {
                story: "Radio UI Component",
            },
        },
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
            description: "Label text for the radio button",
        },
        details: {
            control: { type: "text" },
            name: "Details",
            description: "Details text for the radio button",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the radio button is disabled",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the radio button is clicked",
        },
    },
};

export default meta;

// Interactive wrapper to manage radio group state
const RadioGroup = ({ radios, globalDisabled }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {radios.map((radio, index) => (
                <Radio
                    key={index}
                    {...radio}
                    disabled={globalDisabled || radio.disabled}
                    checked={selectedIndex === index}
                    onClick={() => setSelectedIndex(index)}
                />
            ))}
        </div>
    );
};

export const radio = {
    render: (args) => (
        <RadioGroup
            globalDisabled={args.disabled}
            radios={[
                {
                    label: 'default',
                    details: 'Standard spacing for most use cases.',
                    disabled: false,
                    enableSound: args.enableSound,
                    checked: args.checked,
                },
                {
                    label: 'Comfortable',
                    details: 'More space between elements.',
                    disabled: false,
                    enableSound: args.enableSound,
                },
                {
                    label: 'Compact',
                    details: 'Minimal spacing for dense layouts.',
                    disabled: false,
                    enableSound: args.enableSound,
                },
            ]}
        />
    ),
    args: {
        darkmode: false,
        disabled: false,
        enableSound: true,
        onClick: () => { },
    },
};

export const radioRTL = {
    name: "Radio (rtl)",
    render: (args) => (
        <RadioGroup
            globalDisabled={args.disabled}
            radios={[
                {
                    label: 'افتراضي',
                    details: 'المسافات القياسية لمعظم الاستخدامات.',
                    disabled: false,
                    enableSound: args.enableSound,
                    checked: args.checked,
                },
                {
                    label: 'مريح',
                    details: 'مساحة أكبر بين العناصر.',
                    disabled: false,
                    enableSound: args.enableSound,
                },
                {
                    label: 'مضغوط',
                    details: 'مسافات أقل للتخطيطات الكثيفة.',
                    disabled: false,
                    enableSound: args.enableSound,
                },
            ]}
        />
    ),
    args: {
        darkmode: false,
        disabled: false,
        enableSound: true,
        onClick: () => { },
        rtl: true,
    },
};