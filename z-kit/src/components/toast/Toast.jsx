import React from "react";
import { createRoot } from 'react-dom/client';
import './Toast.scss';
import PropTypes from "prop-types";
import { Button } from "../button/Button";

let toastId = 0;
const toasts = new Map();
let sharedContainer = null;
let sharedRoot = null;

const MAX_VISIBLE = 3;

const getOrCreateContainer = () => {
    if (!sharedContainer) {
        sharedContainer = document.createElement('div');
        sharedContainer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(sharedContainer);
        sharedRoot = createRoot(sharedContainer);
    }
    return sharedRoot;
};

const renderToasts = () => {
    if (!sharedRoot) return;
    sharedRoot.render(<ToastStack toasts={[...toasts.values()]} />);
};

const ToastStack = ({ toasts }) => {
    const positions = ['top-left', 'top-right', 'top-middle', 'bottom-left', 'bottom-right', 'bottom-middle'];

    return positions.map(position => {
        const group = toasts.filter(t => t.position === position);
        if (!group.length) return null;

        return <ToastPositionStack key={position} position={position} group={group} />;
    });
};

const ToastPositionStack = ({ position, group }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [heights, setHeights] = React.useState({});
    const hoverTimeoutRef = React.useRef(null);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 150);
    };

    React.useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleHeightChange = React.useCallback((id, height) => {
        setHeights(prev => {
            if (prev[id] === height) return prev;
            return { ...prev, [id]: height };
        });
    }, []);

    const visible = group.slice(-MAX_VISIBLE);
    const total = visible.length;

    // Clean up heights for toasts that are no longer visible
    React.useEffect(() => {
        const visibleIds = new Set(visible.map(t => t.id));
        setHeights(prev => {
            const next = { ...prev };
            let changed = false;
            for (const id in next) {
                if (!visibleIds.has(Number(id))) {
                    delete next[id];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [visible]);

    const isBottom = position.startsWith('bottom');

    // Calculate total height of the stack when expanded (sum of all heights + gaps)
    const totalHeight = visible.reduce((sum, t) => sum + (heights[t.id] || 70), 0) + (total - 1) * 8;

    const stackStyle = {
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: isHovered ? 'auto' : 'none',
        height: isHovered ? `${totalHeight}px` : undefined,
        background: 'transparent',
    };

    return (
        <div
            className={`toast-stack ${position}`}
            style={stackStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {visible.map((t, index) => {
                const offset = (total - 1) - index;

                let toastOffset = 0;
                if (isHovered) {
                    let sum = 0;
                    for (let j = index + 1; j < total; j++) {
                        const h = heights[visible[j].id] || 70;
                        sum += h + 8;
                    }
                    toastOffset = sum;
                } else {
                    const frontToastId = visible[total - 1].id;
                    const h0 = heights[frontToastId] || 70;
                    const hi = heights[t.id] || 70;
                    const si = 1 - offset * 0.05;
                    const g = 14;
                    toastOffset = h0 + offset * g - hi * si;
                }

                return (
                    <Toast
                        key={t.id}
                        {...t}
                        offset={offset}
                        total={total}
                        isExpanded={isHovered}
                        toastOffset={toastOffset}
                        onHeightChange={handleHeightChange}
                    />
                );
            })}
        </div>
    );
};

const Toast = ({
    enableSound = true,
    id,
    type = 'success',
    duration = 4000,
    title,
    description,
    position = 'bottom-left',
    action,
    onAction,
    close,
    offset,
    total,
    neutral = false,
    isExpanded,
    toastOffset,
    onHeightChange,
}) => {
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const closeTimerRef = React.useRef(null);
    const remainingRef = React.useRef(duration);
    const startedAtRef = React.useRef(null);
    const elementRef = React.useRef(null);

    const closeToast = React.useCallback(() => {
        setIsLeaving(true);
        setTimeout(close, 300);
    }, [close]);

    const handleAction = () => {
        if (onAction) onAction();
        closeToast();
    };

    // Start / restart the auto-close timer, respecting whatever time is left
    // (used both on mount and when resuming from a hover-pause).
    const startTimer = React.useCallback(() => {
        if (duration <= 0) return;
        startedAtRef.current = Date.now();
        closeTimerRef.current = setTimeout(closeToast, remainingRef.current);
    }, [duration, closeToast]);

    const pauseTimer = React.useCallback(() => {
        if (duration <= 0) return;
        clearTimeout(closeTimerRef.current);
        const elapsed = Date.now() - startedAtRef.current;
        remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
        setIsPaused(true);
    }, [duration]);

    const resumeTimer = React.useCallback(() => {
        if (duration <= 0) return;
        startTimer();
        setIsPaused(false);
    }, [duration, startTimer]);

    React.useLayoutEffect(() => {
        if (!elementRef.current) return;

        const updateHeight = () => {
            if (elementRef.current) {
                onHeightChange(id, elementRef.current.offsetHeight);
            }
        };

        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [id, onHeightChange]);

    React.useEffect(() => {
        if (isExpanded) {
            pauseTimer();
        } else {
            resumeTimer();
        }
        return () => clearTimeout(closeTimerRef.current);
    }, [isExpanded, pauseTimer, resumeTimer]);

    const renderIcon = () => {
        const iconMap = {
            'success': <svg className="success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
            'error': <svg className="error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>,
            'warning': <svg className="warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
            'info': <svg className="info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
        };
        return iconMap[type] || iconMap['info'];
    };

    const isBottom = position.startsWith('bottom');
    const collapsedStyle = {
        transform: isExpanded ? 'scale(1)' : `scale(${1 - offset * 0.05})`,
        transformOrigin: isBottom ? 'bottom center' : 'top center',
        opacity: isExpanded ? 1 : 1 - offset * 0.15,
        zIndex: 100 - offset,
        [isBottom ? 'bottom' : 'top']: `${toastOffset}px`,
    };

    // Determine the actual class name based on neutral prop
    const toastClass = `toast ${neutral ? 'neutral' : type} ${position} ${isLeaving ? 'leaving' : ''}`;

    return (
        <div
            ref={elementRef}
            className={toastClass}
            style={collapsedStyle}
        >
            <div className="content">
                <div className="title">
                    {renderIcon()}
                    <p className="title">{title}</p>
                </div>
                {description && <p className="description">{description}</p>}
            </div>
            <div className="actions">
                {action && <Button variant="secondary" size="small" buttonType="label" onClick={handleAction}>{action}</Button>}
                <Button
                    className="close"
                    variant="ghost"
                    size="small"
                    buttonType="icon"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    }
                    onClick={closeToast}
                    enableSound={enableSound}
                />
            </div>

            {duration > 0 && (
                <div className="timer-track">
                    <div
                        className="timer-fill"
                        style={{
                            animationDuration: `${duration}ms`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

Toast.propTypes = {
    enableSound: PropTypes.bool,
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    position: PropTypes.oneOf(['top-left', 'top-right', 'top-middle', 'bottom-left', 'bottom-right', 'bottom-middle']),
    action: PropTypes.string,
    onAction: PropTypes.func,
    close: PropTypes.func.isRequired,
    offset: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    neutral: PropTypes.bool,
    isExpanded: PropTypes.bool.isRequired,
    toastOffset: PropTypes.number.isRequired,
    onHeightChange: PropTypes.func.isRequired,
};

export const toast = ({
    type = 'success',
    title,
    description,
    position = 'bottom-right',
    duration = 4000,
    action,
    onAction,
    enableSound = true,
    neutral = false
}) => {
    const id = toastId++;

    const close = () => {
        toasts.delete(id);
        renderToasts();
    };

    toasts.set(id, {
        id,
        type,
        title,
        description,
        position,
        duration,
        action: action,
        onAction,
        enableSound,
        neutral,
        close,
    });

    getOrCreateContainer();
    renderToasts();

    return id;
};