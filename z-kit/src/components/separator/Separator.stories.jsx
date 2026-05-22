import React from 'react';
import { Separator } from './Separator';
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

// Helper wrapper to demonstrate separators properly
const DemoContainer = ({ orientation, children }) => {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.body.getAttribute('data-dark') === 'true');
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-dark'] });

        return () => observer.disconnect();
    }, []);

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

        if (orientation === "vertical") {
            return (
                <DemoContainer orientation="vertical">
                    <div>
                        <p>Settings</p>
                        <small>Manage preferences</small>
                    </div>
                    <Separator {...args} />
                    <div>
                        <p>Account</p>
                        <small>Profile & security</small>
                    </div>
                    <Separator {...args} />
                    <div>
                        <p>Help</p>
                        <small>Support & docs</small>
                    </div>
                </DemoContainer>
            );
        }

        return (
            <DemoContainer orientation="horizontal">
                <div>
                    <p>Settings</p>
                    <small>Manage preferences</small>
                </div>
                <Separator {...args} />
                <div>
                    <p>Account</p>
                    <small>Profile & security</small>
                </div>
                <Separator {...args} />
                <div>
                    <p>Help</p>
                    <small>Support & docs</small>
                </div>
            </DemoContainer>
        );
    }
};