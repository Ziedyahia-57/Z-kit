import React from 'react';
import { Separator } from './Separator';
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
    title: "Z-kit/Separator",
    component: Separator,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                component: "Separator UI Component - A visual divider for separating content",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        orientation: {
            control: { type: "select" },
            options: ["horizontal", "vertical"],
            name: "Orientation",
            description: "Set the orientation of the separator",
        },
    }
}

export default meta;

// Hook to check dark mode
const useDarkMode = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.body.getAttribute('data-dark') === 'true');
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-dark'] });

        return () => observer.disconnect();
    }, []);

    return isDark;
};

// Helper wrapper to demonstrate separators properly
const DemoContainer = ({ orientation, children }) => {
    const isDark = useDarkMode();
    const background = isDark ? 'var(--gray-950)' : 'var(--gray-50)';
    const border = isDark ? 'var(--gray-800)' : 'var(--gray-200)';

    if (orientation === "vertical") {
        return (
            <div style={{
                display: 'flex',
                height: 'fitContent',
                width: 'fitContent',
                alignItems: 'center',
                justifySelf: 'center',
                gap: '20px',
                padding: '20px',
                border: `1px solid ${border}`,
                borderRadius: '8px',
                background: background,
                transition: 'background 0.2s ease'
            }}>
                {children}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: "column",
            justifySelf: 'center',
            width: 'fitContent',
            gap: '20px',
            padding: '20px',
            border: `1px solid ${border}`,
            borderRadius: '8px',
            background: background,
            transition: 'background 0.2s ease'
        }}>
            {children}
        </div>
    );
};

// Story for Separator component
export const separator = {
    args: {
        darkmode: false,
        orientation: "horizontal",
    },
    render: (args) => {
        const { orientation } = args;
        const isDark = useDarkMode();
        const pColor = isDark ? 'var(--gray-50)' : 'var(--gray-950)';
        const smallColor = isDark ? 'var(--gray-400)' : 'var(--gray-600)';

        if (orientation === "vertical") {
            return (
                <DemoContainer orientation="vertical">
                    <div>
                        <p style={{ color: pColor, margin: 0 }}>Settings</p>
                        <small style={{ color: smallColor }}>Manage preferences</small>
                    </div>
                    <Separator {...args} />
                    <div>
                        <p style={{ color: pColor, margin: 0 }}>Account</p>
                        <small style={{ color: smallColor }}>Profile & security</small>
                    </div>
                    <Separator {...args} />
                    <div>
                        <p style={{ color: pColor, margin: 0 }}>Help</p>
                        <small style={{ color: smallColor }}>Support & docs</small>
                    </div>
                </DemoContainer>
            );
        }

        return (
            <DemoContainer orientation="horizontal">
                <div>
                    <p style={{ color: pColor, margin: 0 }}>Settings</p>
                    <small style={{ color: smallColor }}>Manage preferences</small>
                </div>
                <Separator {...args} />
                <div>
                    <p style={{ color: pColor, margin: 0 }}>Account</p>
                    <small style={{ color: smallColor }}>Profile & security</small>
                </div>
                <Separator {...args} />
                <div>
                    <p style={{ color: pColor, margin: 0 }}>Help</p>
                    <small style={{ color: smallColor }}>Support & docs</small>
                </div>
            </DemoContainer>
        );
    }
};