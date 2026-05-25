import React, { useState, useContext, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./Dropdown.scss";
import { Separator } from "../separator/Separator";
import { Kbd } from "../kbd/Kbd";
import { Search } from "../search/Search";

export const DropdownSearchContext = React.createContext({ query: "", matchingTexts: null });

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
                            onChange={(value) => setQuery(typeof value === "string" ? value : value?.target?.value ?? "")}
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
        <div className="dropdown-group">
            <p>{childrenWithSiblings}</p>
        </div>
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

export const GroupItem = ({ children, onClick, shortcut, mode, danger }) => {
    const { matchingTexts } = useContext(DropdownSearchContext);
    const [hovered, setHovered] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const itemRef = useRef(null);

    const childrenArray = React.Children.toArray(children);

    // Separate the nested Dropdown (submenu) from the rest
    const submenu = childrenArray.find(child => React.isValidElement(child) && child.type === Dropdown) ?? null;
    const rest = childrenArray.filter(child => !(React.isValidElement(child) && child.type === Dropdown));

    const iconElement = rest.find(child => React.isValidElement(child));
    const text = rest.filter(child => typeof child === "string").join("").trim();

    const isVisible = !matchingTexts || matchingTexts.has(text.toLowerCase());
    if (!isVisible) return null;

    const handleMouseEnter = () => {
        if (submenu && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            const submenuWidth = 222;
            const spaceRight = window.innerWidth - rect.right;
            const openLeft = spaceRight < submenuWidth + 8;

            setPos({
                top: rect.top,
                left: openLeft ? rect.left - submenuWidth - 4 : rect.right + 4,
            });
        }
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    return (
        <div
            ref={itemRef}
            className={`group-item${submenu ? " has-submenu" : ""}${danger ? " danger" : ""}`}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {iconElement}
            <span className={`item-label${danger ? " danger" : ""}`}>{text}</span>
            {submenu && (
                <svg className="item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            )}
            {shortcut && (
                <div className="item-shortcut">
                    <Kbd mode={mode}>{shortcut}</Kbd>
                </div>
            )}
            {submenu && hovered && ReactDOM.createPortal(
                <div
                    className="submenu-dropdown-portal"
                    style={{ top: pos.top, left: pos.left }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {submenu}
                </div>,
                document.body
            )}
        </div>
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