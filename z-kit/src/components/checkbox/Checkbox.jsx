import React from "react";
import "./Checkbox.scss";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';

soundManager.loadSound('click', clickSoundFile, 1);

export class Checkbox extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        e.stopPropagation();
        const { enableSound = true, disabled = false, indeterminate = false } = this.props;

        if (disabled || indeterminate) return;

        this.setState({ checked: !this.props.checked }, () => {
            if (enableSound) {
                soundManager.play('click', 1);
            }
            this.props.onClick(this.props.checked);
        });
    }

    render() {
        const { label, details, disabled, checked, indeterminate } = this.props;
        const id = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`checkbox ${disabled ? 'disabled' : ''} `}>
                <div className={`checkbox-wrapper ${indeterminate ? 'indeterminate' : ''}`} onClick={this.handleClick}>
                    <input
                        className="checkbox-button"
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={() => { }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={disabled}
                    />
                    <span className="checkbox-indicator" aria-hidden="true">
                        {indeterminate && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14" /></svg>
                        )}
                        {checked && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {/* ✅ camelCase SVG attrs */}
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        )}
                    </span>
                    <label
                        htmlFor={id}
                        className="checkbox-label"
                        onClick={(e) => e.preventDefault()}
                    >
                        <p>{label}</p>
                    </label>
                    {details && (
                        <label
                            htmlFor={id}
                            className="checkbox-details"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>{details}</p>
                        </label>
                    )}
                </div>
            </div>
        );
    }
}

Checkbox.propTypes = {
    checked: PropTypes.bool,
    label: PropTypes.string.isRequired,
    details: PropTypes.string,
    disabled: PropTypes.bool,
    indeterminate: PropTypes.bool,
    enableSound: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
}

Checkbox.defaultProps = {
    checked: false,
    disabled: false,
    indeterminate: false,
    enableSound: true,
    onClick: () => { },
}