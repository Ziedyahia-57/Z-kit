import { Accordion } from './Accordion';
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
    title: "Z-kit/Accordion",
    component: Accordion,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Accordion UI Component",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        accordionBehavior: {
            control: { type: "radio" },
            options: ["collapseOthers", "leaveOpen"],
            name: "Accordion Behavior",
            description: "Choose whether opening one accordion collapses others or leaves them open",
        },
        accordion1: {
            control: "text",
            name: "Accordion 1 - Question",
            description: "The question of the first accordion",
        },
        answer1: {
            control: "text",
            name: "Accordion 1 - Answer",
            description: "The answer of the first accordion",
        },
        accordion2: {
            control: "text",
            name: "Accordion 2 - Question",
            description: "The question of the second accordion",
        },
        answer2: {
            control: "text",
            name: "Accordion 2 - Answer",
            description: "The answer of the second accordion",
        },
        accordion3: {
            control: "text",
            name: "Accordion 3 - Question",
            description: "The question of the third accordion",
        },
        answer3: {
            control: "text",
            name: "Accordion 3 - Answer",
            description: "The answer of the third accordion",
        },
        disabled: {
            control: "boolean",
            name: "Disable All",
            description: "Disable all accordions",
        },
        enableSound: {
            control: "boolean",
            name: "Enable Sound",
            description: "Enable/disable click sounds",
        },
        soundVolume: {
            control: { type: "range", min: 0, max: 1, step: 0.1 },
            name: "Sound Volume",
            description: "Volume of click sounds (0 to 1)",
        },
    },
};

export default meta;

// Wrapper component for multiple accordions with behavior control
const AccordionGroup = ({
    accordionBehavior = "collapseOthers",
    accordion1 = "What is your return policy?",
    answer1 = "We offer a 30-day return policy for all unused items in their original packaging.",
    accordion2 = "How long does shipping take?",
    answer2 = "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.",
    accordion3 = "Do you offer international shipping?",
    answer3 = "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days.",
    disabled = false,
    enableSound = true,
    soundVolume = 1,
    ...props
}) => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [expandedStates, setExpandedStates] = useState([false, false, false]);

    const accordions = [
        { question: accordion1, answer: answer1 },
        { question: accordion2, answer: answer2 },
        { question: accordion3, answer: answer3 },
    ];

    const handleToggle = (index, isOpen) => {
        if (accordionBehavior === "collapseOthers") {
            // Collapse others - only one open at a time
            // Only update if we're opening, not closing
            if (isOpen) {
                setExpandedIndex(index);
            } else {
                setExpandedIndex(null);
            }
        } else {
            // Leave open - toggle individual accordions
            setExpandedStates(prev => {
                const newStates = [...prev];
                newStates[index] = isOpen;
                return newStates;
            });
        }
    };

    // Get the expanded state for a specific accordion based on behavior
    const getExpandedState = (index) => {
        if (accordionBehavior === "collapseOthers") {
            return expandedIndex === index;
        } else {
            return expandedStates[index];
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accordions.map((accordion, index) => (
                <Accordion
                    key={index}
                    question={accordion.question}
                    answer={accordion.answer}
                    disabled={disabled}
                    enableSound={enableSound}
                    soundVolume={soundVolume}
                    checked={getExpandedState(index)}
                    onToggle={(isOpen) => handleToggle(index, isOpen)}
                />
            ))}
        </div>
    );
};

// Main story with 3 accordions
export const accordion = {
    args: {
        darkmode: false,
        accordionBehavior: "collapseOthers",
        accordion1: "What is your return policy?",
        answer1: "We offer a 30-day return policy for all unused items in their original packaging. Returns are free within the continental US.",
        accordion2: "How long does shipping take?",
        answer2: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Orders over $50 ship free!",
        accordion3: "Do you offer international shipping?",
        answer3: "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Shipping costs vary by destination.",
        disabled: false,
        enableSound: true,
        soundVolume: 1,
    },
    render: (args) => {
        const { accordionBehavior, accordion1, answer1, accordion2, answer2, accordion3, answer3, disabled, enableSound, soundVolume, darkmode } = args;
        return (
            <AccordionGroup
                accordionBehavior={accordionBehavior}
                accordion1={accordion1}
                answer1={answer1}
                accordion2={accordion2}
                answer2={answer2}
                accordion3={accordion3}
                answer3={answer3}
                disabled={disabled}
                enableSound={enableSound}
                soundVolume={soundVolume}
                darkmode={darkmode}
            />
        );
    },
};