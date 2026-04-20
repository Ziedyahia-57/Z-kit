import React from "react";
import './Tag.scss';
import PropTypes from "prop-types";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';

// Load sound once (could be done in a central location)
soundManager.loadSound('click', clickSoundFile, 1);

export const Tag = ({
    color = "orange",
    label = "Tag",
    tagType = "label",
    icon = "chart",
    removable = false,
    onClick,
    enableSound = true,
    soundVolume = 1,
}) => {

    const showIcon = tagType === 'label & icon';
    const colorClass = color;

    const renderIcon = () => {
        if (!showIcon) return null;

        // Use provided icon or default to chart icon
        const iconToRender = icon || 'chart';

        // If icon is a string (icon name), map to SVG
        if (typeof iconToRender === 'string') {
            const iconMap = {
                'chart': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-pie-icon lucide-chart-pie"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" /><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /></svg>,
                'timer': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer-icon lucide-timer"><line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" /></svg>,
                'star': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                'check': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
                'plus': <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
            };
            return iconMap[iconToRender] || iconMap['chart'];
        }

        // If icon is a React element, clone it to add class
        if (React.isValidElement(iconToRender)) {
            return React.cloneElement(iconToRender, {
                className: `tag-icon ${iconToRender.props.className || ''}`,
                'aria-hidden': 'true',
            });
        }

        return iconToRender;
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        // Play sound using soundManager
        if (enableSound) {
            soundManager.play('click', soundVolume);
        }
        if (onClick) onClick(e);
    };

    const handleClick = () => {
        // Play sound using soundManager
        if (enableSound) {
            soundManager.play('click', soundVolume);
        }
        if (onClick) onClick(e);
    };

    return (
        <div className={`tag ${colorClass}`} onClick={handleClick}>
            {showIcon && renderIcon()}
            <p>{label}</p>
            {removable && (
                <div className="close" onClick={handleRemove}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </div>
            )}
        </div>
    );
}

Tag.propTypes = {
    color: PropTypes.oneOf(['gray', 'red', 'orange', 'yellow', 'lime', 'green', 'lightBlue', 'blue', 'purple', 'pink']),
    label: PropTypes.string,
    tagType: PropTypes.oneOf(['label', 'label & icon']),
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.node
    ]),
    removable: PropTypes.bool,
    onClick: PropTypes.func,
    enableSound: PropTypes.bool,
    soundVolume: PropTypes.number,
}

Tag.defaultProps = {
    color: 'orange',
    label: 'Tag',
    tagType: 'label',
    icon: 'chart',
    removable: false,
    enableSound: true,
    soundVolume: 1,
};