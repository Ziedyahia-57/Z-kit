// Toast.jsx
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
const SWIPE_CLOSE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.5; // px/ms — a fast flick closes even under the distance threshold

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

// ─── Per-toast countdown, lives at module scope ─────────────────────────────
// Started the moment a toast is created, independent of whether its React
// component is currently mounted. This is what lets toasts beyond the
// visible window (4th+) keep counting down in the background instead of
// being stuck "paused" until they scroll into view.
const startEntryTimer = (entry) => {
    if (entry.duration <= 0) return;
    entry.startedAt = Date.now();
    entry.timerId = setTimeout(() => entry.close(), entry.remaining);
};

const pauseEntryTimer = (entry) => {
    if (entry.duration <= 0 || entry.timerId == null) return;
    clearTimeout(entry.timerId);
    entry.timerId = null;
    entry.remaining = Math.max(entry.remaining - (Date.now() - entry.startedAt), 0);
};

const resumeEntryTimer = (entry) => {
    if (entry.duration <= 0 || entry.timerId != null) return;
    startEntryTimer(entry);
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
    // Tracks both height (for stack layout) and width (so every toast in the
    // stack can be sized to match the widest one) per toast id.
    const [dimensions, setDimensions] = React.useState({});
    const hoverTimeoutRef = React.useRef(null);
    const containerRef = React.useRef(null);
    // Last known pointer position, updated on every pointermove regardless of
    // hover state, so we can tell whether the pointer is still over the
    // container even when the container itself moved/shrank under it.
    const lastPointerRef = React.useRef({ x: -Infinity, y: -Infinity });

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

    const isPointerInsideContainer = React.useCallback(() => {
        const el = containerRef.current;
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const { x, y } = lastPointerRef.current;
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }, []);

    const handleDimensionsChange = React.useCallback((id, dims) => {
        setDimensions(prev => {
            const existing = prev[id];
            if (existing && existing.height === dims.height && existing.width === dims.width) {
                return prev;
            }
            return { ...prev, [id]: dims };
        });
    }, []);

    const visible = group.slice(-MAX_VISIBLE);
    const total = visible.length;

    // Clean up dimensions for toasts that are no longer visible
    React.useEffect(() => {
        const visibleIds = new Set(visible.map(t => t.id));
        setDimensions(prev => {
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

    // Fixes a stuck-timer bug: isHovered is only ever updated by
    // mouseenter/mouseleave, but when a toast closes the stack's box can
    // shrink or shift out from under a pointer that never moved — no
    // mouseleave fires in that case, so the stack would stay "hovered"
    // until the user moved the mouse in and out again.
    React.useEffect(() => {
        const handlePointerMove = (e) => {
            lastPointerRef.current = { x: e.clientX, y: e.clientY };
            if (isHovered && !isPointerInsideContainer()) {
                handleMouseLeave();
            }
        };
        document.addEventListener('pointermove', handlePointerMove);
        return () => document.removeEventListener('pointermove', handlePointerMove);
    }, [isHovered, isPointerInsideContainer]);

    React.useEffect(() => {
        if (isHovered && !isPointerInsideContainer()) {
            handleMouseLeave();
        }
        // Only needs to re-check when the visible set actually changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible.length]);

    const isBottom = position.startsWith('bottom');

    // Calculate total height of the stack when expanded (sum of all heights + gaps)
    const totalHeight = visible.reduce((sum, t) => sum + (dimensions[t.id]?.height || 70), 0) + (total - 1) * 8;

    // Widest visible toast's width — applied as a `min-width` to every toast
    // in the stack so they all match the largest one instead of jumping
    // narrower whenever the widest toast is removed.
    const maxWidth = visible.reduce((max, t) => {
        const w = dimensions[t.id]?.width || 0;
        return w > max ? w : max;
    }, 0);

    const stackStyle = {
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: isHovered ? 'auto' : 'none',
        height: isHovered ? `${totalHeight}px` : undefined,
        background: 'transparent',
    };

    return (
        <div
            ref={containerRef}
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
                        const h = dimensions[visible[j].id]?.height || 70;
                        sum += h + 8;
                    }
                    toastOffset = sum;
                } else {
                    const frontToastId = visible[total - 1].id;
                    const h0 = dimensions[frontToastId]?.height || 70;
                    const hi = dimensions[t.id]?.height || 70;
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
                        stackMinWidth={maxWidth || undefined}
                        onDimensionsChange={handleDimensionsChange}
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
    stackMinWidth,
    onDimensionsChange,
}) => {
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const elementRef = React.useRef(null);

    // ── Swipe-to-close (touch only) ──
    const [dragX, setDragX] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isSwipingOut, setIsSwipingOut] = React.useState(false);
    const dragStartRef = React.useRef({ x: 0, t: 0, active: false, lastX: 0, lastT: 0 });
    const swipeDirRef = React.useRef(null); // 'left' | 'right'
    // Captured once on mount so the timer-fill bar's animation-duration
    // reflects whatever time was actually left when this toast last became
    // visible, rather than resetting to the full duration on every re-render.
    const initialRemainingRef = React.useRef(null);
    if (initialRemainingRef.current === null) {
        const entry = toasts.get(id);
        initialRemainingRef.current = entry ? entry.remaining : duration;
    }

    const isLeftPos = position === 'top-left' || position === 'bottom-left';
    const isRightPos = position === 'top-right' || position === 'bottom-right';
    // Middle positions allow either direction.

    const closeToast = React.useCallback(() => {
        setIsLeaving(true);
        setTimeout(close, 300);
    }, [close]);

    const handleAction = () => {
        if (onAction) onAction();
        closeToast();
    };

    const pauseTimer = React.useCallback(() => {
        const entry = toasts.get(id);
        if (entry) pauseEntryTimer(entry);
        setIsPaused(true);
    }, [id]);

    const resumeTimer = React.useCallback(() => {
        const entry = toasts.get(id);
        if (entry) resumeEntryTimer(entry);
        setIsPaused(false);
    }, [id]);

    React.useLayoutEffect(() => {
        if (!elementRef.current) return;

        const updateDimensions = () => {
            if (elementRef.current) {
                onDimensionsChange(id, {
                    height: elementRef.current.offsetHeight,
                    width: elementRef.current.offsetWidth,
                });
            }
        };

        updateDimensions();

        const observer = new ResizeObserver(updateDimensions);
        observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [id, onDimensionsChange]);

    React.useEffect(() => {
        if (isExpanded) {
            pauseTimer();
        } else if (!isDragging) {
            resumeTimer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded, pauseTimer, resumeTimer]);

    // If this toast is paused (hover) and then gets pushed out of the
    // visible window by newer toasts before it's resumed, make sure its
    // countdown resumes in the background instead of staying stuck forever.
    React.useEffect(() => {
        return () => {
            const entry = toasts.get(id);
            if (entry) resumeEntryTimer(entry);
        };
    }, [id]);

    // ── Drag handlers (touch only — mouse/pen pointers are ignored) ──
    const handlePointerDown = (e) => {
        if (isSwipingOut) return;
        if (e.pointerType !== 'touch') return;
        if (e.target.closest('button')) return;
        const now = performance.now();
        dragStartRef.current = { x: e.clientX, t: now, active: true, lastX: e.clientX, lastT: now };
        setIsDragging(true);
        pauseTimer();
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragStartRef.current.active) return;
        let delta = e.clientX - dragStartRef.current.x;
        // Clamp to the allowed swipe direction for this toast's position.
        if (isLeftPos && delta > 0) delta = 0;
        if (isRightPos && delta < 0) delta = 0;
        dragStartRef.current.lastX = e.clientX;
        dragStartRef.current.lastT = performance.now();
        setDragX(delta);
    };

    const endDrag = (shouldEvaluateClose) => {
        if (!dragStartRef.current.active) return;
        const { x: startX, t: startT, lastX, lastT } = dragStartRef.current;
        dragStartRef.current.active = false;
        setIsDragging(false);

        let shouldClose = false;
        if (shouldEvaluateClose) {
            const distance = Math.abs(dragX);
            const elapsed = Math.max(lastT - startT, 1);
            const velocity = Math.abs(lastX - startX) / elapsed;
            shouldClose = distance > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
        }

        if (shouldClose) {
            swipeDirRef.current = dragX < 0 ? 'left' : 'right';
            setIsSwipingOut(true);
            setTimeout(close, 200);
        } else {
            setDragX(0);
            if (!isExpanded) resumeTimer();
        }
    };

    const handlePointerUp = () => endDrag(true);
    const handlePointerCancel = () => endDrag(false);

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
    const baseScale = isExpanded ? 1 : 1 - offset * 0.05;
    const baseOpacity = isExpanded ? 1 : 1 - offset * 0.15;

    let transform;
    let opacity;
    let transitionOverride;

    if (isSwipingOut) {
        const dir = swipeDirRef.current;
        transform = `translateX(${dir === 'left' ? '-150%' : '150%'}) scale(${baseScale})`;
        opacity = 0;
        transitionOverride = 'transform 0.2s ease, opacity 0.2s ease';
    } else if (isDragging) {
        // No transition here — the transform is set directly from the
        // pointer's position on every move event, so it tracks the finger 1:1.
        transform = `translateX(${dragX}px) scale(${baseScale})`;
        opacity = Math.max(1 - Math.abs(dragX) / 200, 0.4) * baseOpacity;
        transitionOverride = 'none';
    } else {
        transform = `scale(${baseScale})`;
        opacity = baseOpacity;
        transitionOverride = undefined; // fall back to the CSS transition (smooth snap-back)
    }

    const collapsedStyle = {
        transform,
        transformOrigin: isBottom ? 'bottom center' : 'top center',
        opacity,
        zIndex: 100 - offset,
        [isBottom ? 'bottom' : 'top']: `${toastOffset}px`,
        minWidth: stackMinWidth ? `${stackMinWidth}px` : undefined,
        transition: transitionOverride,
    };

    // Determine the actual class name based on neutral prop
    const toastClass = `toast ${neutral ? 'neutral' : type} ${position} ${isLeaving ? 'leaving' : ''}`;

    return (
        <div
            ref={elementRef}
            className={toastClass}
            style={collapsedStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
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
                            animationDuration: `${initialRemainingRef.current}ms`,
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
    stackMinWidth: PropTypes.number,
    onDimensionsChange: PropTypes.func.isRequired,
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
        const entry = toasts.get(id);
        if (entry?.timerId) clearTimeout(entry.timerId);
        toasts.delete(id);
        renderToasts();
    };

    const entry = {
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
        // Countdown state lives here so it survives the toast being
        // unmounted while hidden behind the visible-3 stack.
        remaining: duration,
        startedAt: null,
        timerId: null,
    };

    toasts.set(id, entry);
    startEntryTimer(entry);

    getOrCreateContainer();
    renderToasts();

    return id;
};