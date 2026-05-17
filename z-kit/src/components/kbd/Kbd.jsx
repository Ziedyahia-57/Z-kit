import React from "react";
import "./Kbd.scss";
import PropTypes from "prop-types";

export class KbdGroup extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="kbd-group">
                {this.props.children}
            </div>
        )
    }
}

export class Kbd extends React.Component {
    constructor(props) {
        super(props);
    }

    isSpecialKey(key) {
        const normalized = key?.toLowerCase();
        return normalized === "ctrl" ||
            normalized === "shift" ||
            normalized === "alt" ||
            normalized === "bksp" ||
            normalized === "bsp" ||
            normalized === "bs" ||
            normalized === "backspace" ||
            normalized === "enter" ||
            normalized === "win" ||
            normalized === "windows" ||
            normalized === "caps" ||
            normalized === "capslock" ||
            normalized === "tab" ||
            normalized === "up" ||
            normalized === "down" ||
            normalized === "left" ||
            normalized === "right";
    }

    getSpecialKeyType(key) {
        const normalized = key?.toLowerCase();

        if (normalized === "ctrl") return "ctrl";
        if (normalized === "shift") return "shift";
        if (normalized === "alt") return "alt";
        if (normalized === "bksp" || normalized === "bsp" || normalized === "bs" || normalized === "backspace") return "bksp";
        if (normalized === "enter") return "enter";
        if (normalized === "win" || normalized === "windows") return "win";
        if (normalized === "caps" || normalized === "capslock") return "caps";
        if (normalized === "tab") return "tab";
        if (normalized === "up") return "up";
        if (normalized === "down") return "down";
        if (normalized === "left") return "left";
        if (normalized === "right") return "right";

        return null;
    }

    renderIcon(keyType) {
        switch (keyType) {
            case "ctrl":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-command-icon lucide-command"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>;
            case "shift":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"><path d="M9 19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-7.086-7.086a1 1 0 0 0-1.414 0l-7.086 7.086a.707.707 0 0 0 .5 1.207H8a1 1 0 0 1 1 1z" /></svg>;
            case "alt":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-option-icon lucide-option"><path d="M3 3h6l6 18h6" /><path d="M14 3h7" /></svg>;
            case "bksp":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-delete-icon lucide-delete"><path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><path d="m12 9 6 6" /><path d="m18 9-6 6" /></svg>;
            case "enter":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-corner-down-left-icon lucide-corner-down-left"><path d="M20 4v7a4 4 0 0 1-4 4H4" /><path d="m9 10-5 5 5 5" /></svg>;
            case "win":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid2x2-icon lucide-grid-2x2"><path d="M12 3v18" /><path d="M3 12h18" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
            case "caps":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-big-up-dash-icon lucide-arrow-big-up-dash"><path d="M14 16a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-6.939-6.939a1.207 1.207 0 0 0-1.708 0l-6.94 6.94a.707.707 0 0 0 .5 1.206H8a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1z" /><path d="M9 20h6" /></svg>;
            case "tab":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-to-line-icon lucide-arrow-right-to-line"><path d="M17 12H3" /><path d="m11 18 6-6-6-6" /><path d="M21 5v14" /></svg>;
            case "up":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-icon lucide-arrow-up"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>;
            case "down":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-icon lucide-arrow-down"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>;
            case "left":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
            case "right":
                return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>;
            default:
                return null;
        }
    }

    renderContent() {
        const children = this.props.children;

        // If children is not a string, render as is
        if (typeof children !== 'string') {
            return children;
        }

        const useIcons = this.props.mode === "icons";

        if (useIcons) {
            // Parse the string to find and replace special keys
            const parts = children.split(/(\s+|\+)/);

            return parts.map((part, index) => {
                // Skip empty parts
                if (!part) return null;

                const trimmed = part.trim();
                const keyType = this.getSpecialKeyType(trimmed);

                if (keyType && trimmed === part) {
                    // Replace the special key with its icon
                    return <span key={index} className="kbd-icon">
                        {this.renderIcon(keyType)}
                    </span>;
                } else if (part === '+') {
                    return <span key={index} className="kbd-separator">+</span>;
                } else if (part.trim() && !this.isSpecialKey(part)) {
                    // Regular text (but only if it's not just whitespace)
                    return <span key={index} className="kbd-text">{part}</span>;
                } else if (part.trim() === '') {
                    // Skip whitespace-only parts
                    return null;
                } else {
                    return <span key={index}>{part}</span>;
                }
            }).filter(Boolean); // Filter out any null values
        } else {
            // Text mode - render as is
            return children;
        }
    }

    render() {
        const useIcons = this.props.mode === "icons";

        return (
            <div className={`kbd`}>
                {this.renderContent()}
            </div>
        );
    }
}

Kbd.propTypes = {
    mode: PropTypes.oneOf(['text', 'icons']),
    children: PropTypes.node
};

Kbd.defaultProps = {
    mode: 'icon'
};

KbdGroup.propTypes = {
    children: PropTypes.node
};