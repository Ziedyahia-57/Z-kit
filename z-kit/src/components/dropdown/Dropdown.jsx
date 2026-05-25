import React, { useState, useContext, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./Dropdown.scss";
import { Separator } from "../separator/Separator";
import { Kbd } from "../kbd/Kbd";
import { Search } from "../search/Search";

export const DropdownSearchContext = React.createContext({ query: "", matchingTexts: null });

// Shared context so only one submenu per group can be open at a time
export const DropdownSubmenuContext = React.createContext({ activeItem: null, setActiveItem: () => { } });

const getGroupItems = (children) =>
    React.Children.toArray(children).flatMap(child => {
        if (!React.isValidElement(child)) return [];
        if (child.type === GroupItem) return [child];
        if (child.type === QuickActions) return getGroupItems(child.props.children);
        return [];
    });

const getItemText = (item) =>
    React.Children.toArray(item.props.children)
        .filter(c => typeof c === "string")
        .join("")
        .trim()
        .toLowerCase();

export const Dropdown = ({ children, search, maxHeight }) => {
    const [query, setQuery] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [height, setHeight] = useState("auto");
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const dropdownRef = useRef(null);
    const innerRef = useRef(null);
    const isInitializedRef = useRef(false);

    const childrenArray = React.Children.toArray(children);

    const allMatchingTexts = query
        ? new Set(
            childrenArray.flatMap(child => {
                if (!React.isValidElement(child)) return [];
                const items = getGroupItems(
                    child.type === DropdownGroup ? child.props.children : [child]
                );
                return items
                    .filter(item => getItemText(item).includes(query.toLowerCase()))
                    .map(item => getItemText(item));
            })
        )
        : null;

    const visibleChildren = childrenArray.filter(child => {
        if (!React.isValidElement(child) || child.type !== DropdownGroup) return true;

        return getGroupItems(child.props.children).some(item =>
            getItemText(item).includes(query.toLowerCase())
        );
    });

    useEffect(() => {
        if (!innerRef.current || !dropdownRef.current) return;

        const dropdownEl = dropdownRef.current;
        const innerEl = innerRef.current;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const innerHeight = entry.contentRect.height - 18;

                const style = window.getComputedStyle(dropdownEl);
                const paddingTop = parseFloat(style.paddingTop) || 0;
                const paddingBottom = parseFloat(style.paddingBottom) || 0;
                const borderTop = parseFloat(style.borderTopWidth) || 0;
                const borderBottom = parseFloat(style.borderBottomWidth) || 0;
                const verticalSpacing = paddingTop + paddingBottom + borderTop + borderBottom;

                const contentHeight = innerHeight + verticalSpacing;
                const maxH = typeof maxHeight === "string" ? parseFloat(maxHeight) : maxHeight;

                if (maxH && contentHeight > maxH) {
                    setHeight(`${maxH}px`);
                    setIsOverflowing(true);
                } else {
                    setHeight(`${contentHeight}px`);
                    setIsOverflowing(false);
                }

                if (!isInitializedRef.current) {
                    isInitializedRef.current = true;
                    requestAnimationFrame(() => {
                        setIsInitialized(true);
                    });
                }
            }
        });

        resizeObserver.observe(innerEl);

        return () => {
            resizeObserver.disconnect();
        };
    }, [maxHeight]);

    const handleSearchChange = (value) => {
        const newQuery = typeof value === "string" ? value : value?.target?.value ?? "";
        setQuery(newQuery);

        // Clear all active submenus when typing in search
        if (newQuery) {
            window.dispatchEvent(new CustomEvent('clearDropdownSubmenus'));
        }
    };

    return (
        <DropdownSearchContext.Provider value={{ query, matchingTexts: allMatchingTexts }}>
            <div
                ref={dropdownRef}
                className={`dropdown${isHovered ? " is-hovered" : ""}${isInitialized ? " is-initialized" : ""}`}
                style={{
                    height: height,
                    maxHeight: maxHeight,
                    overflowY: isOverflowing ? "auto" : "hidden"
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div ref={innerRef} className="dropdown-inner">
                    {search && (
                        <Search
                            enableFavicon={false}
                            onChange={handleSearchChange}
                        />
                    )}
                    {visibleChildren.map((child, index) => {
                        const isLastGroup = index === visibleChildren.length - 1;
                        return (
                            <React.Fragment key={index}>
                                {child}
                                {!isLastGroup && <Separator orientation="horizontal" />}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </DropdownSearchContext.Provider>
    );
};

export const DropdownGroup = ({ children }) => {
    // One active submenu item per group — prevents multiple submenus open simultaneously
    const [activeItem, setActiveItem] = useState(null);

    // Listen for clear submenus event (triggered by search input)
    useEffect(() => {
        const handleClearSubmenus = () => {
            setActiveItem(null);
        };

        window.addEventListener('clearDropdownSubmenus', handleClearSubmenus);

        return () => {
            window.removeEventListener('clearDropdownSubmenus', handleClearSubmenus);
        };
    }, []);

    const childrenArray = React.Children.toArray(children);

    const siblingTexts = childrenArray
        .filter(child => React.isValidElement(child) && child.type === GroupItem)
        .map(item =>
            React.Children.toArray(item.props.children)
                .filter(c => typeof c === "string")
                .join("")
                .trim()
        );

    const childrenWithSiblings = childrenArray.map(child => {
        if (React.isValidElement(child) && child.type === GroupTitle) {
            return React.cloneElement(child, { siblings: siblingTexts });
        }
        return child;
    });

    return (
        <DropdownSubmenuContext.Provider value={{ activeItem, setActiveItem }}>
            <div className="dropdown-group">
                <p>{childrenWithSiblings}</p>
            </div>
        </DropdownSubmenuContext.Provider>
    );
};

export const GroupTitle = ({ children, siblings = [] }) => {
    const { matchingTexts } = useContext(DropdownSearchContext);

    const hasVisibleSibling = !matchingTexts || siblings.some(text =>
        matchingTexts.has(text.trim().toLowerCase())
    );

    if (!hasVisibleSibling) return null;

    return (
        <div className="group-title">
            <label className="title-label">
                {children}
            </label>
        </div>
    );
};

const globalConeLockRef = { current: false };
let globalLockTimer = null;

// Create a registry to track all GroupItem instances
const groupItemRegistry = new Map();
let hoveredItemId = null;

// Track mouse position globally
let globalMouseX = 0;
let globalMouseY = 0;

// Add global mouse move listener to track position
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        globalMouseX = e.clientX;
        globalMouseY = e.clientY;

        // Find which GroupItem is being hovered
        let newHoveredId = null;
        for (const [id, instance] of groupItemRegistry.entries()) {
            if (instance.isHovered(globalMouseX, globalMouseY)) {
                newHoveredId = id;
                break;
            }
        }
        hoveredItemId = newHoveredId;
    });
}

export const GroupItem = ({
    children,
    onClick,
    shortcut,
    mode,
    danger,
    debugSafetyCone = false,
    coneDuration = 215,
}) => {
    const { matchingTexts } = useContext(DropdownSearchContext);

    const itemId = useRef(Math.random().toString(36).slice(2)).current;
    const { activeItem, setActiveItem } = useContext(DropdownSubmenuContext);
    const hovered = activeItem === itemId;

    const [leaving, setLeaving] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [headPos, setHeadPos] = useState({ x: 0, y: 0 });
    const [shouldRenderSubmenu, setShouldRenderSubmenu] = useState(false);

    const itemRef = useRef(null);
    const submenuRef = useRef(null);
    const closeTimerRef = useRef(null);
    const openTimerRef = useRef(null);
    const coneFrozenRef = useRef(false);
    const animationTimerRef = useRef(null);

    // ── parse children ───────────────────────────────────────────────────────
    let submenuElement = null;
    let iconElement = null;
    let textContent = "";
    const restChildren = [];

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            if (child.type === Dropdown) {
                submenuElement = child;
            } else if (child.type === Disc || child.props?.className === "disc") {
                iconElement = child;
            } else if (child.type && typeof child.type === 'string' && child.type.toLowerCase() === 'svg') {
                // Handle direct SVG element
                iconElement = child;
            } else if (child.type && typeof child.type === 'function' && child.type.name === 'Svg') {
                // Handle React component that returns SVG
                iconElement = child;
            } else if (child.props?.viewBox && child.props?.xmlns) {
                // Heuristic: treat as SVG if it has viewBox and xmlns props
                iconElement = child;
            } else {
                restChildren.push(child);
            }
        } else if (typeof child === "string") {
            textContent += child;
        } else {
            restChildren.push(child);
        }
    });

    const text = textContent.trim();
    const hasSubmenu = !!submenuElement;

    // ✅ ALL HOOKS MUST BE BEFORE CONDITIONAL RETURN
    // Register/unregister this instance
    useEffect(() => {
        groupItemRegistry.set(itemId, {
            isHovered: (x, y) => {
                if (!itemRef.current) return false;
                const rect = itemRef.current.getBoundingClientRect();
                return x >= rect.left && x <= rect.right &&
                    y >= rect.top && y <= rect.bottom;
            },
            openSubmenu: () => {
                if (hasSubmenu && !globalConeLockRef.current && activeItem !== itemId) {
                    openSubmenu();
                }
            },
            hasSubmenu,
            itemId
        });

        return () => {
            groupItemRegistry.delete(itemId);
        };
    }, [hasSubmenu, activeItem, itemId]);

    // Update render state when hovered/leaving changes
    useEffect(() => {
        if (hovered) {
            setShouldRenderSubmenu(true);
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
                animationTimerRef.current = null;
            }
        } else if (leaving) {
            animationTimerRef.current = setTimeout(() => {
                setShouldRenderSubmenu(false);
                animationTimerRef.current = null;
            }, 125);
        }
    }, [hovered, leaving]);

    // Listen for clear submenus event to close this submenu
    useEffect(() => {
        const handleClearSubmenus = () => {
            if (activeItem === itemId) {
                // Close this submenu immediately
                cancelCloseTimer();
                cancelOpenTimer();
                setLeaving(false);
                setActiveItem(null);
            }
        };

        window.addEventListener('clearDropdownSubmenus', handleClearSubmenus);

        return () => {
            window.removeEventListener('clearDropdownSubmenus', handleClearSubmenus);
        };
    }, [activeItem, itemId]);

    // ── helpers ──────────────────────────────────────────────────────────────
    const cancelCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const cancelOpenTimer = () => {
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }
    };

    const releaseGlobalConeLock = () => {
        if (globalLockTimer) {
            clearTimeout(globalLockTimer);
            globalLockTimer = null;
        }
        globalConeLockRef.current = false;
    };

    const acquireGlobalConeLock = () => {
        globalConeLockRef.current = true;
        if (globalLockTimer) {
            clearTimeout(globalLockTimer);
        }
        globalLockTimer = setTimeout(() => {
            globalConeLockRef.current = false;
            globalLockTimer = null;

            if (hoveredItemId) {
                const instance = groupItemRegistry.get(hoveredItemId);
                if (instance && instance.hasSubmenu && instance.openSubmenu) {
                    setTimeout(() => {
                        instance.openSubmenu();
                    }, 10);
                }
            }
        }, coneDuration); // your desired duration
    };

    const pointInRect = (px, py, rect) =>
        px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;

    const pointInTriangle = (px, py, p1, p2, p3) => {
        const sign = (a, b, c) => (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
        const pt = { x: px, y: py };
        const d1 = sign(pt, p1, p2);
        const d2 = sign(pt, p2, p3);
        const d3 = sign(pt, p3, p1);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        return !(hasNeg && hasPos);
    };

    const isInCone = (mx, my) => {
        if (!submenuRef.current) return false;
        const sr = submenuRef.current.getBoundingClientRect();
        const p1 = { x: sr.left, y: sr.top };
        const p2 = { x: sr.left, y: sr.bottom };
        const p3 = headPos;
        return pointInTriangle(mx, my, p1, p2, p3);
    };

    // ── open / close ─────────────────────────────────────────────────────────
    const openSubmenu = () => {
        if (globalConeLockRef.current) {
            return;
        }

        cancelCloseTimer();
        cancelOpenTimer();

        if (hasSubmenu && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            const submenuWidth = 222;
            const spaceRight = window.innerWidth - rect.right;
            const openLeft = spaceRight < submenuWidth + 8;
            setPos({
                top: rect.top,
                left: openLeft ? rect.left - submenuWidth - 4 : rect.right + 4,
            });
            setHeadPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }

        coneFrozenRef.current = false;
        setLeaving(false);
        setActiveItem(itemId);
        acquireGlobalConeLock(); // lock immediately so sibling mouseenter is blocked
    };

    const closeSubmenu = (immediate = false) => {
        cancelCloseTimer();
        cancelOpenTimer();
        coneFrozenRef.current = false;

        if (immediate) {
            setLeaving(false);
            setActiveItem((id) => (id === itemId ? null : id));
        } else {
            setLeaving(true);
            closeTimerRef.current = setTimeout(() => {
                setActiveItem((id) => (id === itemId ? null : id));
                setLeaving(false);
                closeTimerRef.current = null;
            }, 150);
        }
    };

    // ── cone debug overlay ────────────────────────────────────────────────────
    const drawSafeZone = () => {
        const existingCone = document.getElementById(`safety-cone-${itemId}`);
        if (!debugSafetyCone || !hovered || !hasSubmenu || !submenuRef.current) {
            if (existingCone) existingCone.remove();
            const strokeOverlay = document.getElementById(`safety-cone-stroke-${itemId}`);
            if (strokeOverlay) strokeOverlay.remove();
            return;
        }

        const sr = submenuRef.current.getBoundingClientRect();
        const p1 = { x: sr.left, y: sr.top };
        const p2 = { x: sr.left, y: sr.bottom };
        const p3 = headPos;

        const minX = Math.min(p1.x, p2.x, p3.x);
        const maxX = Math.max(p1.x, p2.x, p3.x);
        const minY = Math.min(p1.y, p2.y, p3.y);
        const maxY = Math.max(p1.y, p2.y, p3.y);

        let coneSvg = existingCone;
        if (!coneSvg) {
            coneSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            coneSvg.id = `safety-cone-${itemId}`;
            coneSvg.style.position = "fixed";
            coneSvg.style.pointerEvents = "none";
            coneSvg.style.zIndex = "99999";
            document.body.appendChild(coneSvg);
        }

        Object.assign(coneSvg.style, {
            top: `${minY}px`,
            left: `${minX}px`,
            width: `${maxX - minX}px`,
            height: `${maxY - minY}px`,
        });

        // Clear previous polygon
        while (coneSvg.firstChild) {
            coneSvg.removeChild(coneSvg.firstChild);
        }

        // Create polygon for the cone
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        const points = [p1, p2, p3]
            .map(p => `${p.x - minX},${p.y - minY}`)
            .join(" ");
        polygon.setAttribute("points", points);
        polygon.setAttribute("fill", "hsla(130, 100%, 50%, 0.25)");
        polygon.setAttribute("stroke", "hsla(130, 100%, 50%, 0.5)");
        polygon.setAttribute("stroke-width", "1");
        polygon.setAttribute("stroke-dasharray", "4 3");
        coneSvg.appendChild(polygon);
    };

    // ── mouse handlers ────────────────────────────────────────────────────────
    const handleMouseEnterItem = () => {
        hoveredItemId = itemId; // track which item the cursor is over

        if (globalConeLockRef.current) {
            return; // lock is held, do nothing until it expires
        }

        cancelCloseTimer();
        cancelOpenTimer();
        openTimerRef.current = setTimeout(() => {
            openSubmenu();
            openTimerRef.current = null;
        }, 50);
    };

    const handleMouseLeaveItem = () => {
        cancelOpenTimer();
    };

    const handleMouseMove = (e) => {
        if (!hovered || !hasSubmenu) return;

        const mx = e.clientX;
        const my = e.clientY;

        const itemRect = itemRef.current?.getBoundingClientRect();
        const submenuRect = submenuRef.current?.getBoundingClientRect();

        const onItem = itemRect ? pointInRect(mx, my, itemRect) : false;
        const onSubmenu = submenuRect ? pointInRect(mx, my, submenuRect) : false;
        const onCone = isInCone(mx, my);

        if (onSubmenu) {
            cancelCloseTimer();
            coneFrozenRef.current = false;
            setLeaving(false);
            releaseGlobalConeLock();
            return;
        }

        if (onItem && !onCone) {
            cancelCloseTimer();
            coneFrozenRef.current = false;
            setLeaving(false);
            setHeadPos({ x: mx, y: my });
            releaseGlobalConeLock();
            if (debugSafetyCone) drawSafeZone();
            return;
        }

        if (onItem && onCone) {
            cancelCloseTimer();
            coneFrozenRef.current = true;
            setLeaving(false);
            releaseGlobalConeLock();
            if (debugSafetyCone) drawSafeZone();
            return;
        }

        if (onCone && !onItem) {
            coneFrozenRef.current = true;
            setLeaving(false);
            acquireGlobalConeLock();
            if (debugSafetyCone) drawSafeZone();

            if (!closeTimerRef.current) {
                closeTimerRef.current = setTimeout(() => {
                    closeTimerRef.current = null;
                    closeSubmenu(true);
                }, coneDuration);
            }
            return;
        }

        // Cursor is off item, off submenu, off cone — but DON'T release the lock here.
        // The lock will expire on its own timer. Just close the submenu.
        cancelCloseTimer();
        coneFrozenRef.current = false;
        closeSubmenu(true);
        if (debugSafetyCone) drawSafeZone();
    };

    const handleMouseEnterSubmenu = () => {
        cancelCloseTimer();
        coneFrozenRef.current = false;
        setLeaving(false);
        releaseGlobalConeLock();
    };

    const handleMouseLeaveSubmenu = () => {
        // handleMouseMove takes over
    };

    // ── effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (hovered && hasSubmenu) {
            window.addEventListener("mousemove", handleMouseMove);
            if (debugSafetyCone) {
                window.addEventListener("scroll", drawSafeZone);
                window.addEventListener("resize", drawSafeZone);
            }
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("scroll", drawSafeZone);
                window.removeEventListener("resize", drawSafeZone);
                cancelCloseTimer();
                cancelOpenTimer();
                const coneSvg = document.getElementById(`safety-cone-${itemId}`);
                if (coneSvg) coneSvg.remove();
            };
        }
    }, [hovered, hasSubmenu, headPos, debugSafetyCone]);

    useEffect(() => {
        return () => {
            cancelCloseTimer();
            cancelOpenTimer();
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
            const coneSvg = document.getElementById(`safety-cone-${itemId}`);
            if (coneSvg) coneSvg.remove();
        };
    }, []);

    // ✅ NOW do the conditional return AFTER all hooks
    const isVisible = !matchingTexts || matchingTexts.has(text.toLowerCase());
    if (!isVisible) return null;

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div
                ref={itemRef}
                className={`group-item${hasSubmenu ? " has-submenu" : ""}${danger ? " danger" : ""}`}
                onClick={onClick}
                onMouseEnter={handleMouseEnterItem}
                onMouseLeave={handleMouseLeaveItem}
            >
                {iconElement}
                {text && <span className={`item-label${danger ? " danger" : ""}`}>{text}</span>}
                {hasSubmenu && (
                    <svg
                        className="item-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                )}
                {shortcut && (
                    <div className="item-shortcut">
                        <Kbd mode={mode}>{shortcut}</Kbd>
                    </div>
                )}
                {hasSubmenu && shouldRenderSubmenu && submenuElement &&
                    ReactDOM.createPortal(
                        <div
                            ref={submenuRef}
                            className={`submenu-dropdown-portal${leaving ? " is-leaving" : ""}${hovered && !leaving ? " is-visible" : ""}`}
                            style={{ top: pos.top, left: pos.left, position: "fixed", zIndex: 1000 }}
                            onMouseEnter={handleMouseEnterSubmenu}
                            onMouseLeave={handleMouseLeaveSubmenu}
                        >
                            {submenuElement}
                        </div>,
                        document.body
                    )}
            </div>
        </>
    );
};

export const Disc = (props) => {
    return <div className="disc" style={{ background: `var(--${props.color}-500)` }}></div>;
};

export const QuickActions = ({ children }) => {
    return (
        <div className="quick-actions">
            {children}
        </div>
    );
};