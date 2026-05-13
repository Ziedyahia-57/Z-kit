import React from "react";
import "./Radio.scss";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import PropTypes from 'prop-types';

soundManager.loadSound('click', clickSoundFile, 1);

export class Radio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.checked !== this.props.checked) {
            this.setState({ checked: this.props.checked });
        }
    }

    handleClick = (e) => {
        e.stopPropagation();
        const { enableSound = true, disabled = false } = this.props;

        if (disabled) return;

        this.setState({ checked: !this.state.checked }, () => {
            if (enableSound) {
                soundManager.play('click', 1);
            }
            this.props.onClick(this.state.checked);
        });
    }

    render() {
        const id = `radio-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`radio ${this.props.disabled ? 'disabled' : ''}`}>
                <div className="radio-wrapper" onClick={this.handleClick}>
                    <input
                        className="radio-button"
                        type="radio"
                        id={id}
                        checked={this.state.checked}
                        onClick={(e) => e.stopPropagation()}
                        disabled={this.props.disabled}
                    />
                    <span className="radio-indicator" aria-hidden="true" />
                    <label
                        htmlFor={id}
                        className="radio-label"
                        onClick={(e) => e.preventDefault()}
                    >
                        <p>{this.props.label}</p>
                    </label>
                    {this.props.details && (
                        <label
                            htmlFor={id}
                            className="radio-details"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>{this.props.details}</p>
                        </label>
                    )}
                </div>
            </div>
        );
    }
}

Radio.propTypes = {
    checked: PropTypes.bool,
    label: PropTypes.string.isRequired,
    details: PropTypes.string,
    disabled: PropTypes.bool,
    enableSound: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
}

Radio.defaultProps = {
    checked: false,
    label: 'label',
    details: 'this is where label details should be written.',
    disabled: false,
    enableSound: true,
    onClick: () => { },
}