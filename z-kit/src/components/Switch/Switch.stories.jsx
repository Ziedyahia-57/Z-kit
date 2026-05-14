import { Switch } from './Switch';
import { useEffect, useState } from 'react';

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
    title: "Z-kit/Switch",
    component: Switch,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Switch UI Component",
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
            description: "Label text for the switch button",
        },
        details: {
            control: { type: "text" },
            name: "Details",
            description: "Details text for the switch button",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if all switch are disabled",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the switch button is clicked",
        },
    },
};

export default meta;

// Switch group wrapper to manage multiple switch states
const SwitchGroup = ({ switchComponents, globalDisabled }) => {
    const [checkedStates, setCheckedStates] = useState(
        switchComponents.map(switchComponent => switchComponent.checked || false)
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
            {switchComponents.map((switchComponent, index) => (
                <Switch
                    key={index}
                    {...switchComponent}
                    disabled={globalDisabled || switchComponent.disabled}
                    checked={checkedStates[index]}
                    onClick={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export const switchComponent = {
    render: (args) => (
        <SwitchGroup
            globalDisabled={args.disabled}
            switchComponents={[
                {
                    label: 'Default',
                    details: 'Standard spacing for most use cases.',
                    enableSound: args.enableSound,
                    checked: true,
                    disabled: false,
                },
                {
                    label: 'Comfortable',
                    details: 'More space between elements.',
                    enableSound: args.enableSound,
                    checked: false,
                    disabled: false,
                },
                {
                    label: 'Compact',
                    details: 'Minimal spacing for dense layouts.',
                    enableSound: args.enableSound,
                    checked: false,
                    disabled: false,
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