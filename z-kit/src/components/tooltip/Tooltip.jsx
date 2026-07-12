import React, { useState, useRef, useLayoutEffect } from 'react';
import './Tooltip.scss';
import { Kbd, KbdGroup } from "../kbd/Kbd";

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
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [computedDirection, setComputedDirection] = useState(direction);
    const [shift, setShift] = useState({ x: 0, y: 0 });
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);

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

    useLayoutEffect(() => {
        if (!isVisible) return;
        const wrapper = wrapperRef.current;
        const tooltip = tooltipRef.current;
        if (!wrapper || !tooltip) return;

        const margin = 8;
        const triggerRect = wrapper.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Flip to the opposite side if there's no room in the requested direction
        let nextDirection = direction;
        if (direction === 'top' && triggerRect.top - tooltipRect.height - margin < 0) {
            nextDirection = 'bottom';
        } else if (direction === 'bottom' && triggerRect.bottom + tooltipRect.height + margin > vh) {
            nextDirection = 'top';
        } else if (direction === 'left' && triggerRect.left - tooltipRect.width - margin < 0) {
            nextDirection = 'right';
        } else if (direction === 'right' && triggerRect.right + tooltipRect.width + margin > vw) {
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
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
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