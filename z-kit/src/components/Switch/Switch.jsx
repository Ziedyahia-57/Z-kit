import React from "react";
import "./Switch.scss";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';

soundManager.loadSound('click', clickSoundFile, 1);

export class Switch extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        e.stopPropagation();
        const { enableSound = true, disabled = false } = this.props;

        if (disabled) return;

        this.setState({ checked: !this.props.checked }, () => {
            if (enableSound) {
                soundManager.play('click', 1);
            }
            this.props.onClick(this.props.checked);
        });
    }

    render() {
        const { label, details, disabled, checked } = this.props;
        const id = `switchComponent-${label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`switchComponent ${disabled ? 'disabled' : ''} `}>
                <div className='switchComponent-wrapper' onClick={this.handleClick}>
                    <input
                        className="switchComponent-button"
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={() => { }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={disabled}
                    />
                    <span className="switchComponent-indicator" aria-hidden="true">
                    </span>
                    <label
                        htmlFor={id}
                        className="switchComponent-label"
                        onClick={(e) => e.preventDefault()}
                    >
                        <p>{label}</p>
                    </label>
                    {details && (
                        <label
                            htmlFor={id}
                            className="switchComponent-details"
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

Switch.propTypes = {
    checked: PropTypes.bool,
    label: PropTypes.string.isRequired,
    details: PropTypes.string,
    disabled: PropTypes.bool,
    enableSound: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
}

Switch.defaultProps = {
    checked: false,
    disabled: false,
    enableSound: true,
    onClick: () => { },
}