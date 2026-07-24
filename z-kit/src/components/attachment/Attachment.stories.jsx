import { Attachment } from "./Attachment";
import { useEffect } from "react";

// Storybook maps args straight onto whatever `meta.component` is, so we do the
// indeterminate -> progress translation here rather than via a story-level
// `render` override. Attachment itself already treats `progress={undefined}`
// as unknown (see its `hasKnownProgress` check), so this wrapper just decides
// whether to forward the numeric progress or hide it.
const AttachmentDemo = (props) => <Attachment {...props} />;

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
    title: "Z-kit/Attachment",
    component: AttachmentDemo,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                component: "File attachment row with uploading, complete, and error states.",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        name: {
            control: { type: "text" },
            name: "Name",
            description: "File name — drives the icon shown via its extension",
        },
        size: {
            control: { type: "number" },
            name: "Size (bytes)",
            description: 'Raw byte count; formatted automatically (e.g. 2500000 → "2.4 MB")',
        },
        status: {
            control: { type: "select" },
            options: ["uploading", "complete", "error"],
            name: "Status",
            description: "Which UI state to render",
        },
        indeterminate: {
            control: { type: "boolean" },
            name: "Indeterminate",
            description: "Toggles an indeterminate uploading animation. Hides the Progress control when enabled.",
            if: { arg: "status", eq: "uploading" },
        },
        progress: {
            control: { type: "range", min: 0, max: 100, step: 1 },
            name: "Progress",
            description: "0-100; only visible and applied when Indeterminate is false.",
            if: { arg: "indeterminate", eq: false },
        },
        errorMessage: {
            control: { type: "text" },
            name: "Error message",
            description: "Shown in place of the file size when status is 'error'",
            if: { arg: "status", eq: "error" },
        },
        onCancel: {
            action: "cancel",
            name: "onCancel",
            description: "Called when the action button is clicked while uploading",
        },
        onRetry: {
            action: "retry",
            name: "onRetry",
            description: "Called when the action button is clicked while in an error state",
        },
        onRemove: {
            action: "remove",
            name: "onRemove",
            description: "Called when the action button is clicked once complete",
        },
    },
};

export default meta;

export const attachment = {
    args: {
        darkmode: false,
        name: "quarterly-report.pdf",
        size: 2_500_000,
        status: "uploading",
        indeterminate: true,
        progress: 42,
    }
};