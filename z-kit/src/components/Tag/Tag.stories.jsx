import { Tag } from "./Tag";
import { useEffect } from "react";

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
    title: "Z-kit/Tag",
    component: Tag,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
    parameters: {
        docs: {
            description: {
                story: "Tag UI Component",
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
            control: "text",
            name: "Label",
            description: "Label of the tag",
        },
        tagType: {
            control: "radio",
            options: ["label", "label & icon"],
            name: "Tag Type",
            description: "Choose tag display mode",
        },
        icon: {
            control: { type: "select" },
            options: ["chart", "timer", "star", "check", "plus"],
            name: "Icon (when applicable)",
            description: "Icon to display when tag type includes icon",
            if: { arg: "tagType", neq: "label" },
        },
        removable: {
            control: { type: "boolean" },
            name: "Removable",
            description: "Defines whether the tag is removable",
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the button is clicked",
        },
    },
};

export default meta;

const colors = [
    "gray",
    "red",
    "orange",
    "yellow",
    "lime",
    "green",
    "lightBlue",
    "blue",
    "purple",
    "pink",
];

export const tag = {
    args: {
        label: "Done",
        tagType: "label & icon",
        icon: "check",
        removable: false,
        darkmode: false,
    },
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
            }}
        >
            {colors.map((color) => (
                <Tag
                    key={color}
                    {...args}
                    color={color}
                />
            ))}
        </div>
    ),
};

export const tagRTL = {
    name: "Tag (rtl)",
    args: {
        label: "منجز",
        tagType: "label & icon",
        icon: "check",
        removable: false,
        darkmode: false,
        rtl: true,
    },
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
            }}
        >
            {colors.map((color) => (
                <Tag
                    key={color}
                    {...args}
                    color={color}
                />
            ))}
        </div>
    ),
};