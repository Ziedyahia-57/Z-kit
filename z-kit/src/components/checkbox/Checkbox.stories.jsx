import { Checkbox } from './Checkbox';
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

const meta = {
    title: "Z-kit/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Checkbox UI Component",
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
            description: "Label text for the checkbox button",
        },
        details: {
            control: { type: "text" },
            name: "Details",
            description: "Details text for the checkbox button",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if all checkboxes are disabled",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the checkbox button is clicked",
        },
    },
};

export default meta;

// Checkbox group wrapper to manage multiple checkbox states
const CheckboxGroup = ({ checkboxes, globalDisabled }) => {
    const [checkedStates, setCheckedStates] = useState(
        checkboxes.map(checkbox => checkbox.checked || false)
    );

    const handleToggle = (index) => {
        setCheckedStates(prev => {
            const newStates = [...prev];
            newStates[index] = !newStates[index];
            return newStates;
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checkboxes.map((checkbox, index) => (
                <Checkbox
                    key={index}
                    {...checkbox}
                    disabled={globalDisabled || checkbox.disabled}
                    checked={checkedStates[index]}
                    onClick={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export const checkbox = {
    render: (args) => (
        <CheckboxGroup
            globalDisabled={args.disabled}
            checkboxes={[
                {
                    label: 'Default',
                    details: 'Standard spacing for most use cases.',
                    enableSound: args.enableSound,
                    checked: true,
                    disabled: false,
                    indeterminate: false,
                },
                {
                    label: 'Comfortable',
                    details: 'More space between elements.',
                    enableSound: args.enableSound,
                    checked: false,
                    disabled: false,
                    indeterminate: false,
                },
                {
                    label: 'Compact',
                    details: 'Minimal spacing for dense layouts.',
                    enableSound: args.enableSound,
                    checked: false,
                    disabled: false,
                    indeterminate: true,
                },
            ]}
        />
    ),
    args: {
        darkmode: false,
        enableSound: true,
        disabled: false, // Global disabled control
        onClick: () => { },
    },
};