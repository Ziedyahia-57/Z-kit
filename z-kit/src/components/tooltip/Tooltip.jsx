import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import './Tooltip.scss';
import { Kbd, KbdGroup } from "../kbd/Kbd";

// A tiny pub/sub so that only one tooltip is ever open at a time across the app.
// When any tooltip opens, it broadcasts its id; every other mounted tooltip hears
// this and closes itself immediately.
const tooltipBus = new EventTarget();

const OPEN_DELAY = 300;  // debounce before showing on hover, avoids flicker on fast mouse travel
const CLOSE_DELAY = 100; // small grace period on mouse-leave (lets you move mouse into the tooltip itself, if hoverable)

export const Tooltip = ({
    children,
    titleChildren,
    textChildren,
    title,
    text,
    shortcut = [],
    shortcutMethod = "separated",
    shortcutPosition = "title",
    direction = 'top',
    disabled = false,
}) => {
    const id = useId();
    const [isVisible, setIsVisible] = useState(false);
    const [computedDirection, setComputedDirection] = useState(direction);
    const [shift, setShift] = useState({ x: 0, y: 0 });
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);
    const openTimer = useRef(null);
    const closeTimer = useRef(null);
    const isVisibleRef = useRef(false); // mirrors state for use inside stable listeners

    useEffect(() => { isVisibleRef.current = isVisible; }, [isVisible]);

    const clearTimers = () => {
        if (openTimer.current) clearTimeout(openTimer.current);
        if (closeTimer.current) clearTimeout(closeTimer.current);
        openTimer.current = null;
        closeTimer.current = null;
    };

    const openNow = useCallback(() => {
        clearTimers();
        tooltipBus.dispatchEvent(new CustomEvent('tooltip:open', { detail: { id } }));
        setIsVisible(true);
    }, [id]);

    const openDelayed = useCallback(() => {
        if (disabled) return;
        clearTimers();
        openTimer.current = setTimeout(openNow, OPEN_DELAY);
    }, [disabled, openNow]);

    const close = useCallback((immediate = false) => {
        clearTimers();
        if (immediate) {
            setIsVisible(false);
        } else {
            closeTimer.current = setTimeout(() => setIsVisible(false), CLOSE_DELAY);
        }
    }, []);

    // Global listeners: escape key, clicks outside, scroll, resize, window blur,
    // and "another tooltip just opened" — all of these should dismiss this tooltip.
    useEffect(() => {
        const onOtherTooltipOpen = (e) => {
            if (e.detail.id !== id) close(true);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && isVisibleRef.current) close(true);
        };
        const onScrollOrResize = () => {
            if (isVisibleRef.current) close(true);
        };
        const onPointerDownOutside = (e) => {
            if (isVisibleRef.current && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                close(true);
            }
        };
        const onWindowBlur = () => {
            if (isVisibleRef.current) close(true);
        };

        tooltipBus.addEventListener('tooltip:open', onOtherTooltipOpen);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('scroll', onScrollOrResize, true); // capture so any scrollable ancestor counts
        window.addEventListener('resize', onScrollOrResize);
        document.addEventListener('mousedown', onPointerDownOutside, true);
        document.addEventListener('touchstart', onPointerDownOutside, true);
        window.addEventListener('blur', onWindowBlur);

        return () => {
            tooltipBus.removeEventListener('tooltip:open', onOtherTooltipOpen);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
            document.removeEventListener('mousedown', onPointerDownOutside, true);
            document.removeEventListener('touchstart', onPointerDownOutside, true);
            window.removeEventListener('blur', onWindowBlur);
        };
    }, [id, close]);

    // Make sure timers don't fire after unmount
    useEffect(() => () => clearTimers(), []);

    // Helper function to render shortcut
    const renderShortcut = () => {
        if (!shortcut || shortcut.length === 0) return null;

        if (shortcutMethod === "grouped") {
            return <Kbd mode="icons">{shortcut.join(" + ")}</Kbd>;
        }

        if (shortcutMethod === "separated") {
            return (
                <KbdGroup>
                    {shortcut.map((key, index) => (
                        <Kbd key={index} mode="icons">{key}</Kbd>
                    ))}
                </KbdGroup>
            );
        }

        if (shortcutMethod === "linked") {
            return (
                <KbdGroup>
                    {shortcut.map((key, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <p>+</p>}
                            <Kbd mode="icons">{key}</Kbd>
                        </React.Fragment>
                    ))}
                </KbdGroup>
            );
        }

        return null;
    };

    const handleMouseMove = useCallback((e) => {
        const tooltip = tooltipRef.current;
        if (!tooltip || !isVisible) return;

        const tooltipRect = tooltip.getBoundingClientRect();
        let pos;

        if (computedDirection === 'top' || computedDirection === 'bottom') {
            pos = e.clientX - tooltipRect.left;
            pos = Math.max(10, Math.min(tooltipRect.width - 10, pos));
        } else {
            pos = e.clientY - tooltipRect.top;
            pos = Math.max(10, Math.min(tooltipRect.height - 10, pos));
        }

        tooltip.style.setProperty('--arrow-pos', `${pos}px`);
    }, [isVisible, computedDirection]);

    useLayoutEffect(() => {
        if (!isVisible) return;
        const wrapper = wrapperRef.current;
        const tooltip = tooltipRef.current;
        if (!wrapper || !tooltip) return;

        // Reset arrow to center when tooltip appears
        tooltip.style.setProperty('--arrow-pos', '50%');

        const margin = 8;
        const triggerRect = wrapper.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Flip to the opposite side if there's no room in the requested direction
        let nextDirection = direction;
        if (direction === 'top' && triggerRect.top - tooltipRect.height - margin < 0) {
            nextDirection = 'bottom';
        } else if (direction === 'bottom' && triggerRect.bottom + tooltipRect.height - margin > vh) {
            nextDirection = 'top';
        } else if (direction === 'left' && triggerRect.left - tooltipRect.width - margin < 0) {
            nextDirection = 'right';
        } else if (direction === 'right' && triggerRect.right + tooltipRect.width - margin > vw) {
            nextDirection = 'left';
        }

        // Slide along the perpendicular axis so the body never clips the viewport edge
        let shiftX = 0;
        let shiftY = 0;

        if (nextDirection === 'top' || nextDirection === 'bottom') {
            const centerX = triggerRect.left + triggerRect.width / 2;
            const halfWidth = tooltipRect.width / 2;
            const overflowLeft = margin - (centerX - halfWidth);
            const overflowRight = centerX + halfWidth - (vw - margin);
            if (overflowLeft > 0) shiftX = overflowLeft;
            else if (overflowRight > 0) shiftX = -overflowRight;
        } else {
            const centerY = triggerRect.top + triggerRect.height / 2;
            const halfHeight = tooltipRect.height / 2;
            const overflowTop = margin - (centerY - halfHeight);
            const overflowBottom = centerY + halfHeight - (vh - margin);
            if (overflowTop > 0) shiftY = overflowTop;
            else if (overflowBottom > 0) shiftY = -overflowBottom;
        }

        setComputedDirection(nextDirection);
        setShift({ x: shiftX, y: shiftY });
    }, [isVisible, direction]);

    return (
        <div
            className="tooltip"
            ref={wrapperRef}
            onMouseEnter={openDelayed}
            onMouseLeave={() => close(false)}
            onMouseMove={handleMouseMove}
            onFocus={openNow}
            onBlur={() => close(false)}
            onMouseDown={() => close(true)}
            onTouchStart={openNow}
        >
            {children}
            <div
                ref={tooltipRef}
                className={`tooltip-wrapper ${computedDirection} ${isVisible ? 'visible' : ''}`}
                style={{ '--shift-x': `${shift.x}px`, '--shift-y': `${shift.y}px` }}
                role="tooltip"
            >
                <div className={`tooltip-header ${titleChildren || (shortcut && shortcut.length > 0) ? 'inline' : ''}`}>
                    <span className="tooltip-title"><p>{title}</p></span>
                    {shortcutPosition === "title" && renderShortcut()}
                    {titleChildren}
                </div>

                {text &&
                    <div className={`tooltip-content ${textChildren || (shortcut && shortcut.length > 0) ? 'inline' : ''}`}>
                        <span className="tooltip-text"><p>{text}</p></span>
                        {shortcutPosition === "content" && renderShortcut()}
                        {textChildren}
                    </div>
                }
            </div>
        </div>
    );
};