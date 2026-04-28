import React from "react";
import PropTypes from "prop-types";
import './Button.scss';
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';

// Load sound once (could be done in a central location)
soundManager.loadSound('click', clickSoundFile, 1);

export const Button = ({
    variant = "primary",
    size = "medium",
    colorScheme = "primaryColor", // New prop for color scheme
    disabled = false,
    label = "Button",
    icon = null,
    iconPosition = "left",
    buttonType = "label", // "label", "label & icon", "icon"
    onClick,
    enableSound = true,
    className = "", // Allow custom className
    ...props
}) => {

    // Determine if we should show label and icon based on buttonType
    const showLabel = buttonType === 'label' || buttonType === 'label & icon';
    const showIcon = buttonType === 'icon' || buttonType === 'label & icon';
    const isIconOnly = buttonType === 'icon';
    const isTextOnly = buttonType === 'label';
    const isTextWithIcon = buttonType === 'label & icon';

    // Add mode class for styling
    const contentTypeClass = isIconOnly ? 'icon-only' : (isTextOnly ? 'text-only' : 'text-with-icon');

    // Combine all classes
    const buttonClasses = [
        'button',
        size,
        variant,
        colorScheme, // Add color scheme class
        contentTypeClass,
        className
    ].filter(Boolean).join(' ');

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

    const handleClick = (e) => {
        // Play sound using soundManager
        if (enableSound) {
            soundManager.play('click', 1);
        }
        if (onClick) onClick(e);
    };

    return (
        <button
            className={buttonClasses}
            disabled={disabled}
            onClick={handleClick}
            aria-label={isIconOnly ? label : undefined}
            {...props}
        >
            {showIcon && iconPosition === "left" && renderIcon()}
            {showLabel && <span className="button-label">{label}</span>}
            {showIcon && iconPosition === "right" && renderIcon()}
        </button>
    );
};

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    colorScheme: PropTypes.oneOf(['primaryColor', 'warningColor', 'errorColor', 'successColor', 'infoColor']),
    disabled: PropTypes.bool,
    label: PropTypes.string,
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.node
    ]),
    iconPosition: PropTypes.oneOf(['left', 'right']),
    buttonType: PropTypes.oneOf(['label', 'label & icon', 'icon']),
    onClick: PropTypes.func,
    enableSound: PropTypes.bool,
    className: PropTypes.string,
};

Button.defaultProps = {
    variant: 'primary',
    size: 'medium',
    colorScheme: 'primaryColor',
    disabled: false,
    label: 'Button',
    icon: null,
    iconPosition: 'left',
    buttonType: 'label',
    enableSound: true,
    className: '',
};