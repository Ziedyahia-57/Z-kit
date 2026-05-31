import React from 'react';
import "./Select.scss";
import { motion, useAnimation } from "motion/react";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';
import { DropdownWrapperContext } from '../dropdown/Dropdown';

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

class SelectBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            input: '',
            display: null,
        };
        this.toggleSelect = this.toggleSelect.bind(this);
        this.setValue = this.setValue.bind(this);
        this.chevronRef = React.createRef();

        if (props.enableSound) {
            const preloadAudio = new Audio(clickSoundFile);
            preloadAudio.load();
            window._preloadedAudio = preloadAudio;
        }
    }

    componentDidMount() {
        this.context?.registerSetValue?.(this.setValue);
    }

    componentWillUnmount() {
        this.context?.registerSetValue?.(null);
    }

    setValue(displayNode, rawText) {
        this.setState({
            input: rawText ?? '',
            display: displayNode ?? null,
            active: false,
        });
        this.chevronRef.current?.stopAnimation();
    }

    toggleSelect() {
        const { enableSound, soundVolume = 1, disabled, onToggle } = this.props;

        if (disabled) return;

        if (enableSound) {
            soundManager.play('click', soundVolume);
        }

        if (this.state.active) {
            this.chevronRef.current?.stopAnimation();
        } else {
            this.chevronRef.current?.startAnimation();
        }

        this.setState({ active: !this.state.active }, () => {
            if (onToggle) onToggle(this.state.active);
        });

        this.context?.toggle?.();
    }

    render() {
        const { error, disabled, label, placeholder, buttonRef, children } = this.props;
        const { input, display } = this.state;
        const triggerRef = buttonRef ?? this.context?.triggerRef;
        const resolvedLabel = children ?? label;

        return (
            <div className="select">
                {resolvedLabel && <label><p>{resolvedLabel}</p></label>}
                <button
                    ref={triggerRef}
                    className={`select-wrapper ${error ? 'error' : ''}`}
                    onClick={this.toggleSelect}
                    aria-expanded={this.state.active}
                    disabled={disabled}
                    value={input}
                >
                    {display
                        ? <div className="select-value">{display}</div>
                        : input !== ''
                            ? <p>{input}</p>
                            : <p className="placeholder">{placeholder}</p>
                    }
                    <ChevronDownIcon
                        ref={this.chevronRef}
                        duration={0.2}
                        width={20}
                        height={20}
                        strokeWidth={3}
                    />
                </button>
            </div>
        );
    }
}

SelectBase.contextType = DropdownWrapperContext;

SelectBase.defaultProps = {
    label: null,
    placeholder: 'Placeholder',
    disabled: false,
    error: false,
    enableSound: true
};

SelectBase.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    enableSound: PropTypes.bool,
    onToggle: PropTypes.func,
    soundVolume: PropTypes.number,
    buttonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    children: PropTypes.node
};

export const Select = React.forwardRef((props, ref) => (
    <SelectBase {...props} buttonRef={ref} />
));

Select.displayName = 'Select';