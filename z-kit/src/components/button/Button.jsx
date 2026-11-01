import React from "react";
import './Button.scss';
import { soundManager } from '../../utils/soundUtils.js';
import clickSoundFile from '../../assets/sounds/click.mp3';

// Load sound once (could be done in a central location)
soundManager.loadSound('click', clickSoundFile, 1);

export const Button = ({
    variant = "primary",
    size = "small",
    disabled = false,
    monochrome = false,
    submit = false,
    onClick,
    enableSound = false,
    children
}) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        if (enableSound) {
            soundManager.play('click');
        }
    }

    return (

        < button
            className={`button ${variant} ${size} ${monochrome && 'monochrome'}`}
            disabled={disabled}
            type={submit ? "submit" : "button"}
            onClick={handleClick}
        >
            {children}
        </button >

    )
}