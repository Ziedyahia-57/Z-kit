import { useEffect } from "react";
import { Tooltip } from "./Tooltip";
import { Button } from "../button/Button";

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

    return <Story />;
};

const meta = {
    title: "Z-kit/Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                component: `
The Tooltip component displays informative content when users hover over or focus on an element.

**Props:**
- \`title\`: (string) The main title text of the tooltip
- \`text\`: (string, optional) The body text of the tooltip
- \`direction\`: (string) Position of the tooltip - 'top', 'bottom', 'left', or 'right'
- \`shortcut\`: (array, optional) Array of keyboard shortcut keys to display
- \`shortcutMethod\`: (string) Display method for shortcuts - 'grouped', 'separated', or 'linked'
- \`shortcutPosition\`: (string) Where to display shortcuts - 'title' or 'content'
- \`titleChildren\`: (ReactNode, optional) Custom content rendered beside the title
- \`textChildren\`: (ReactNode, optional) Custom content rendered beside the text
                `,
                story: "Adjustable Tooltip UI",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: "boolean",
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        title: {
            control: "text",
            description: "Tooltip title text",
        },
        text: {
            control: "text",
            description: "Tooltip body text",
        },
        direction: {
            control: "select",
            options: ["top", "bottom", "left", "right"],
            description: "Tooltip direction",
        },
        shortcut: {
            control: "array",
            description: "Array of keyboard shortcut keys",
        },
        shortcutMethod: {
            control: "select",
            options: ["grouped", "separated", "linked"],
            description: "How to display shortcut keys",
        },
        shortcutPosition: {
            control: "select",
            options: ["title", "content"],
            description: "Where to display the shortcut",
        },
        titleChildren: {
            control: false,
            description: "Optional custom content rendered beside the title",
        },
        textChildren: {
            control: false,
            description: "Optional custom content rendered beside the text",
        },
    },
};

export default meta;

export const Default = {
    args: {
        darkmode: false,
        title: "Copy",
        text: "",
        shortcut: ["Ctrl", "C"],
        shortcutMethod: "separated",
        shortcutPosition: "title",
    },
    render: (args) => (
        <div
            style={{
                width: "100%",
                height: "80vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, auto)",
                    gap: "120px",
                    placeItems: "center",
                }}
            >
                <Tooltip {...args} direction="top">
                    <Button variant="secondary" buttonType="label & icon" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>}>Top</Button>
                </Tooltip>

                <Tooltip {...args} direction="right">
                    <Button variant="secondary" buttonType="label & icon" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>}>Right</Button>
                </Tooltip>

                <Tooltip {...args} direction="bottom">
                    <Button variant="secondary" buttonType="label & icon" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>}>Bottom</Button>
                </Tooltip>

                <Tooltip {...args} direction="left">
                    <Button variant="secondary" buttonType="label & icon" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>}>Left</Button>
                </Tooltip>
            </div>
        </div>
    )
};