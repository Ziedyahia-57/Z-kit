import React from 'react';
import PropTypes from "prop-types";
import './Input.scss';

export class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            showIcon: props.showIcon || false,
            isFocused: false,
        }
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value
        });

        if (this.props.onChange) {
            this.props.onChange(e.target.value);
        }
    }

    handleFocus = () => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    handleBlur = () => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.showIcon !== this.props.showIcon) {
            this.setState({ showIcon: this.props.showIcon });
        }
    }

    renderIcon = () => {
        if (!this.state.showIcon) return null;

        return (
            <span
                className={`input-icon ${this.state.isFocused && this.props.fadeIconOnFocus ? 'fade-out' : ''}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-mail-icon lucide-mail"
                >
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
            </span>
        );
    }

    render() {
        const shouldFadeOut = this.state.isFocused && this.props.fadeIconOnFocus;

        return (
            <div className={`input ${this.state.showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label><p>{this.props.label}</p></label>
                <div className="input-wrapper">
                    {this.renderIcon()}
                    <input
                        type="text"
                        className={`TextInput ${this.props.error ? 'error' : ''}`}
                        id='TextInput'
                        value={this.state.value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                        error={this.props.error}
                    />
                </div>
            </div>
        )
    }
}

Input.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    showIcon: PropTypes.bool,
    fadeIconOnFocus: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
}

Input.defaultProps = {
    label: 'label',
    placeholder: 'placeholder',
    disabled: false,
    error: false,
    showIcon: false,
    fadeIconOnFocus: true,
}