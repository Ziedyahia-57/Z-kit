import React, { useState, useRef, useEffect, useContext } from 'react';
import "./Select.scss";
import { motion, useAnimation } from "motion/react";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';
import { DropdownWrapperContext } from '../dropdown/Dropdown';

soundManager.loadSound('click', clickSoundFile, 1);

const ChevronDownIcon = React.forwardRef(({ duration = 0.2, ...props }, ref) => {
    const controls = useAnimation();

    React.useImperativeHandle(ref, () => ({
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
    }));

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <motion.path
                d="M6 9L12 15L18 9"
                variants={{
                    normal: { d: "M6 9L12 15L18 9" },
                    animate: { d: "M6 15L12 9L18 15" },
                }}
                initial="normal"
                animate={controls}
                transition={{ duration }}
            />
        </svg>
    );
});

ChevronDownIcon.displayName = "ChevronDownIcon";

export const Select = React.forwardRef(function Select(
    {
        label = null,
        placeholder = 'Placeholder',
        disabled = false,
        error = false,
        enableSound = true,
        onToggle,
        soundVolume = 1,
        children,
    },
    buttonRef
) {
    const context = useContext(DropdownWrapperContext);

    const [active, setActive] = useState(false);
    const [input, setInput] = useState('');
    const [display, setDisplay] = useState(null);

    const chevronRef = useRef(null);
    // Tracks the last-seen context.isOpen so we only react to *changes*,
    // not every render (mirrors the old componentDidUpdate diff check).
    const prevOpenRef = useRef(context?.isOpen);

    // Equivalent of the old constructor-time audio preload.
    // Empty deps -> runs once on mount, just like the constructor did once per instance.
    useEffect(() => {
        if (enableSound) {
            const preloadAudio = new Audio(clickSoundFile);
            preloadAudio.load();
            window._preloadedAudio = preloadAudio;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setValue = (displayNode, rawText) => {
        setInput(rawText ?? '');
        setDisplay(displayNode ?? null);
        setActive(false);
        chevronRef.current?.stopAnimation();
    };

    // Equivalent of componentDidMount/componentWillUnmount registerSetValue calls.
    useEffect(() => {
        context?.registerSetValue?.(setValue);
        return () => context?.registerSetValue?.(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context]);

    // Equivalent of componentDidUpdate: sync chevron + active state whenever
    // the DropdownWrapper's isOpen changes for ANY reason (button click,
    // outside click, Escape key) — not just when this component's own
    // toggleSelect ran. This is the actual bug fix.
    useEffect(() => {
        const currentOpen = context?.isOpen;
        if (currentOpen === undefined) return; // no DropdownWrapper in the tree

        if (currentOpen !== prevOpenRef.current) {
            prevOpenRef.current = currentOpen;
            if (currentOpen) {
                chevronRef.current?.startAnimation();
            } else {
                chevronRef.current?.stopAnimation();
            }
        }
    }, [context?.isOpen]);

    const toggleSelect = () => {
        if (disabled) return;

        if (enableSound) {
            soundManager.play('click', soundVolume);
        }

        if (context?.toggle) {
            // DropdownWrapper owns open/closed state. Just ask it to toggle;
            // the effect above will sync the chevron + active state once
            // context.isOpen actually changes.
            const willOpen = !context.isOpen;
            context.toggle();
            onToggle?.(willOpen);
        } else {
            // No DropdownWrapper present (standalone usage) — manage locally.
            setActive((prev) => {
                const next = !prev;
                if (next) {
                    chevronRef.current?.startAnimation();
                } else {
                    chevronRef.current?.stopAnimation();
                }
                onToggle?.(next);
                return next;
            });
        }
    };

    const triggerRef = buttonRef ?? context?.triggerRef;
    const resolvedLabel = children ?? label;
    const isExpanded = context?.isOpen ?? active;

    return (
        <div className="select">
            {resolvedLabel && <label><p>{resolvedLabel}</p></label>}
            <button
                ref={triggerRef}
                className={`select-wrapper ${error ? 'error' : ''}`}
                onClick={toggleSelect}
                aria-expanded={isExpanded}
                disabled={disabled}
                value={input}
            >
                {display
                    ? <div className="select-value">{display}</div>
                    : input !== ''
                        ? <p>{input}</p>
                        : <p className="placeholder">{placeholder}</p>
                }
                <ChevronDownIcon
                    ref={chevronRef}
                    duration={0.2}
                    width={20}
                    height={20}
                    strokeWidth={3}
                />
            </button>
        </div>
    );
});

Select.displayName = 'Select';

Select.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    enableSound: PropTypes.bool,
    onToggle: PropTypes.func,
    soundVolume: PropTypes.number,
    children: PropTypes.node,
};