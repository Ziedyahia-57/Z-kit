import React from "react";
import "./Checkbox.scss";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';

soundManager.loadSound('click', clickSoundFile, 1);

export class Checkbox extends React.Component {
    constructor(props) {
        super(props);
        this.animationKey = 0;
        this.shouldAnimate = false;
        this.animationTimeout = null;
    }

    // Remove componentDidUpdate entirely — no more DOM manipulation

    handleClick = (e) => {
        e.stopPropagation();
        const { enableSound = true, disabled = false, indeterminate = false } = this.props;

        if (disabled || indeterminate) return;

        const newChecked = !this.props.checked;
        this.shouldAnimate = newChecked;

        if (newChecked) {
            // Increment key so React fully remounts the SVG, resetting SMIL from t=0
            this.animationKey++;
        }

        if (enableSound) {
            soundManager.play('click', 1);
        }
        this.props.onClick(newChecked);
    }

    render() {
        const { label, details, disabled, checked, indeterminate, speed = 3.75 } = this.props;
        const t = (s) => `${(s / speed).toFixed(4)}s`;
        const id = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;


        // Final frame path — shown statically for pre-checked boxes
        const FINAL_PATH = "M-35.5,0C-35.5,0,-13.5,23.5,-13.5,23.5C-13.5,23.5,30.125,-26.125,30.125,-26.125";

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                            </svg>
                        )}
                        {checked && (
                            this.shouldAnimate ? (
                                <svg
                                    key={this.animationKey}
                                    fill="none"
                                    height="16"
                                    width="16"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        d="M3.998,12.291"
                                    >
                                        <set fill="freeze" dur="0.033s" begin={t(0.167)} to="M3.998,12.291" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.200)} to="M3.998,12.291C3.998,12.291,4.467,12.746,5.127,13.388" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.233)} to="M3.998,12.291C3.998,12.291,5.359,13.612,6.709,14.922" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.267)} to="M3.998,12.291C3.998,12.291,6.935,15.142,8.464,16.625" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.300)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,9.66,17.19,10.156,16.679" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.333)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,10.332,16.496,11.684,15.098" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.367)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,11.034,15.772,13.05,13.687" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.400)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,11.741,15.04,14.248,12.449" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.433)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,12.445,14.313,15.291,11.371" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.467)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,13.14,13.594,16.193,10.439" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.500)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,13.823,12.888,16.968,9.638" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.533)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,14.495,12.195,17.631,8.955" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.567)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,15.152,11.514,18.19,8.375" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.600)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,15.799,10.848,18.66,7.891" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.633)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,16.431,10.193,19.045,7.491" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.667)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,17.053,9.55,19.358,7.169" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.700)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,17.663,8.92,19.602,6.918" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.733)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,18.262,8.301,19.783,6.73" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.767)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,18.852,7.692,19.908,6.601" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.800)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,19.432,7.092,19.98,6.526" attributeName="d" />
                                        <set fill="freeze" dur="0.033s" begin={t(0.833)} to="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,20.002,6.502,20.002,6.502" attributeName="d" />
                                    </path>
                                </svg>
                            ) : (
                                <svg fill="none" height="16" width="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        d="M3.998,12.291C3.998,12.291,9.363,17.498,9.363,17.498C9.363,17.498,20.002,6.502,20.002,6.502"
                                    />
                                </svg>
                            )
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
    speed: PropTypes.number,
}

Checkbox.defaultProps = {
    checked: false,
    disabled: false,
    indeterminate: false,
    enableSound: true,
    onClick: () => { },
    speed: 3.75,
}