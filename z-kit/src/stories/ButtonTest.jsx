import React from "react";
import PropTypes from "prop-types"
import './ButtonTest.scss'

// Color utility functions
const hexToRgb = (hex) => {
    const cleanHex = hex.replace('#', '');

    let r, g, b;
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
        return null;
    }

    return { r, g, b };
};

const darkenColor = (color, percent) => {
    if (!color) return color;

    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const r = Math.max(0, Math.floor(rgb.r * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - percent / 100)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - percent / 100)));

    return `rgb(${r}, ${g}, ${b})`;
};

const lightenColor = (color, percent) => {
    if (!color) return color;

    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)));

    return `rgb(${r}, ${g}, ${b})`;
};

export const ButtonTest = ({
    variant = "primary",
    size = "medium",
    disabled = false,
    label = "Button",
    icon = null,
    iconPosition = "left",
    buttonType = "label", // "label", "label & icon", "icon"
    primaryColor = '#1a1a1a',
    secondaryColor = '#272727',
    onClick,
    ...props
}) => {
    // Create CSS custom properties object
    const customProperties = {
        '--button-primary-color': primaryColor,
        '--button-secondary-color': secondaryColor,
        '--button-primary-dark': darkenColor(primaryColor, 15),
        '--button-secondary-dark': darkenColor(secondaryColor, 15),
        '--button-primary-light': lightenColor(primaryColor, 90),
        '--button-secondary-light': lightenColor(secondaryColor, 90),
    };

    // Determine if we should show label and icon based on buttonType
    const showLabel = buttonType === 'label' || buttonType === 'label & icon';
    const showIcon = buttonType === 'icon' || buttonType === 'label & icon';
    const isIconOnly = buttonType === 'icon';
    const isTextOnly = buttonType === 'label';
    const isTextWithIcon = buttonType === 'label & icon';

    // Add mode class for styling
    const buttonModeClass = isIconOnly ? 'icon-only' : (isTextOnly ? 'text-only' : 'text-with-icon');

    // Render icon if needed
    const renderIcon = () => {
        if (!showIcon) return null;

        // Use provided icon or default to play icon
        const iconToRender = icon || 'play';

        // If icon is a string (icon name), map to SVG
        if (typeof iconToRender === 'string') {
            const iconMap = {
                'play': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>,
                'pause': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
                'star': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                'heart': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
                'check': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
                'plus': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
            };
            return iconMap[iconToRender] || iconMap['play'];
        }

        // If icon is a React element, clone it to add class
        if (React.isValidElement(iconToRender)) {
            return React.cloneElement(iconToRender, {
                className: `button-icon ${iconToRender.props.className || ''}`,
                'aria-hidden': 'true',
            });
        }

        return iconToRender;
    };

    return (
        <button
            className={`button ${size} ${variant} ${buttonModeClass}`}
            disabled={disabled}
            onClick={onClick}
            style={customProperties}
            aria-label={isIconOnly ? label : undefined}
            {...props}
        >
            {showIcon && iconPosition === "left" && renderIcon()}
            {showLabel && <span className="button-label">{label}</span>}
            {showIcon && iconPosition === "right" && renderIcon()}
        </button>
    );
};

ButtonTest.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    disabled: PropTypes.bool,
    label: PropTypes.string,
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.node
    ]),
    iconPosition: PropTypes.oneOf(['left', 'right']),
    buttonType: PropTypes.oneOf(['label', 'label & icon', 'icon']),
    primaryColor: PropTypes.string,
    secondaryColor: PropTypes.string,
    onClick: PropTypes.func,
};