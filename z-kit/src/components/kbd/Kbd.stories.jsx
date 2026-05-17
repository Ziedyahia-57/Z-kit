import { KbdGroup, Kbd } from './Kbd';
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
    title: "Z-kit/Kbd",
    component: Kbd,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Kbd UI Component",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        mode: {
            control: { type: "select" },
            options: ['text', 'icons'],
            name: "Mode",
            description: "Display mode for keyboard shortcuts",
        },
        singleShortcut: {
            control: { type: "text" },
            name: "Single Kbd Shortcut",
            description: "Shortcut text for single Kbd element",
        },
        group1Shortcut1: {
            control: { type: "text" },
            name: "Group 1 - First Shortcut",
            description: "First shortcut in first group",
        },
        group1Shortcut2: {
            control: { type: "text" },
            name: "Group 1 - Second Shortcut",
            description: "Second shortcut in first group",
        },
        group2Shortcut1: {
            control: { type: "text" },
            name: "Group 2 - First Kbd Shortcut",
            description: "First shortcut in second group (inside Kbd)",
        },
        group2Shortcut2: {
            control: { type: "text" },
            name: "Group 2 - Second Kbd Shortcut",
            description: "Second shortcut in second group (inside Kbd)",
        },
    }
}

export default meta;

// Main story with all three variants
export const AllVariants = {
    args: {
        darkmode: false,
        mode: 'icons',
        singleShortcut: 'shift + s',
        group1Shortcut1: 'ctrl',
        group1Shortcut2: 'c',
        group2Shortcut1: 'ctrl',
        group2Shortcut2: 'a',
    },
    render: (args) => {
        const {
            mode,
            singleShortcut,
            group1Shortcut1,
            group1Shortcut2,
            group2Shortcut1,
            group2Shortcut2
        } = args;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Kbd mode={mode}>
                    {singleShortcut}
                </Kbd>




                <KbdGroup>
                    <Kbd mode={mode}>{group1Shortcut1}</Kbd>
                    <Kbd mode={mode}>{group1Shortcut2}</Kbd>
                </KbdGroup>



                <KbdGroup>
                    <Kbd mode={mode}>{group2Shortcut1}</Kbd>
                    <p>+</p>
                    <Kbd mode={mode}>{group2Shortcut2}</Kbd>
                </KbdGroup>

            </div>
        );
    }
};