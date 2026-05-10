import React from 'react';
import "./Select.scss";
import { motion, useAnimation } from "motion/react";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';

// Load sound once (could be done in a central location)
soundManager.loadSound('click', clickSoundFile, 1);

const ChevronDownIcon = React.forwardRef(({ duration = 0.2, ...props }, ref) => {
    const controls = useAnimation();

    React.useImperativeHandle(ref, () => ({
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
    }));

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <motion.path
                d="M6 9L12 15L18 9"
                variants={{
                    normal: { d: "M6 9L12 15L18 9" },
                    animate: { d: "M6 15L12 9L18 15" },
                }}
                initial="normal"
                animate={controls}
                transition={{ duration }}
            />
        </svg>
    );
});

ChevronDownIcon.displayName = "ChevronDownIcon";

export class Select extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            input: ''
        }
        this.toggleSelect = this.toggleSelect.bind(this)
        this.chevronRef = React.createRef();

        if (props.enableSound) {
            const preloadAudio = new Audio(clickSoundFile);
            preloadAudio.load();
            // Store in window to prevent garbage collection
            window._preloadedAudio = preloadAudio;
        }
    };


    toggleSelect() {
        const { active } = this.state;
        const { enableSound = this.props.enableSound, soundVolume = 1, disabled, onToggle } = this.props;

        if (disabled) return;

        // Play sound using soundManager
        if (enableSound) {
            soundManager.play('click', soundVolume);
        }

        if (active) {
            this.chevronRef.current?.stopAnimation();
        } else {
            this.chevronRef.current?.startAnimation();
        }

        this.setState({ active: !this.state.active }, () => {
            if (onToggle) {
                onToggle(this.state.active);
            }
        });
    }
    render() {
        return (
            <div className="select">
                {this.props.label && <label><p>{this.props.label}</p></label>}
                <button
                    className={`select-wrapper ${this.props.error ? 'error' : ''}`}
                    onClick={this.toggleSelect}
                    aria-expanded={this.state.active}
                    disabled={this.props.disabled}
                    value={this.state.input}
                >
                    {this.state.input !== '' ? <p>{this.state.input}</p> : <p className="placeholder">{this.props.placeholder}</p>}
                    <ChevronDownIcon
                        ref={this.chevronRef}
                        duration={0.2}
                        width={20}
                        height={20}
                        strokeWidth={3}
                    />
                </button>
            </div>
        )
    }
}

Select.defaultProps = {
    label: 'Select',
    placeholder: 'Placeholder',
    disabled: false,
    error: false,
    enableSound: true
}

Select.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    enableSound: PropTypes.bool
}