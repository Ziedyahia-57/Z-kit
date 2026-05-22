import React from 'react';
import PropTypes from 'prop-types';
import './Textarea.scss';

export class Textarea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            showIcon: props.showIcon || false,
            isFocused: false,
            maxLength: props.maxLength || 0,
            charLimitFlash: false,
        };
        this.textareaRef = React.createRef();
        this._resizeState = null;
    }

    handleChange = (e) => {
        const { maxLength } = this.props;
        const newValue = e.target.value;

        if (maxLength > 0 && newValue.length > maxLength) {
            // Re-trigger flash on every keystroke at the limit
            this.setState({ charLimitFlash: false }, () => {
                this.setState({ charLimitFlash: true });
                setTimeout(() => this.setState({ charLimitFlash: false }), 500);
            });
            return;
        }

        this.setState({ value: newValue });
        if (this.props.onChange) this.props.onChange(newValue);
    }

    handleFocus = () => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) this.props.onFocus();
    }

    handleBlur = () => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) this.props.onBlur();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.showIcon !== this.props.showIcon) {
            this.setState({ showIcon: this.props.showIcon });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

    // ── Custom resize handle logic ──────────────────────────────────────
    _onResizePointerDown = (e) => {
        e.preventDefault();
        const el = this.textareaRef.current;
        if (!el) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = el.offsetWidth;
        const startH = el.offsetHeight;

        this._resizeState = { startX, startY, startW, startH };
        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);
    }

    _onPointerMove = (e) => {
        if (!this._resizeState) return;
        const el = this.textareaRef.current;
        if (!el) return;

        const { startX, startY, startW, startH } = this._resizeState;
        const newW = Math.max(144, startW + (e.clientX - startX));
        const newH = Math.max(47, startH + (e.clientY - startY));

        el.style.width = `${newW}px`;
        el.style.height = `${newH}px`;
    }

    _onPointerUp = () => {
        this._resizeState = null;
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }
    // ───────────────────────────────────────────────────────────────────

    renderIcon = () => {
        if (!this.state.showIcon) return null;
        return (
            <span className={`textarea-icon ${this.state.isFocused && this.props.fadeIconOnFocus ? 'fade-out' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" />
                </svg>
            </span>
        );
    }

    renderResizeHandle = () => {
        const { maxLength } = this.props;
        const { value, charLimitFlash } = this.state;

        return (
            <div className="textarea-resize-row">
                {maxLength > 0 && (
                    <small className={`textarea-char-count ${charLimitFlash ? 'flash' : ''} ${value.length >= maxLength ? 'at-limit' : ''}`}>
                        {value.length}/{maxLength}
                    </small>
                )}
                <span
                    className="textarea-resize-handle"
                    onPointerDown={this._onResizePointerDown}
                    aria-hidden="true"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M6.66949 0.5L0.5 6.66949M7.12713 4.04237L4.04238 7.12712"
                            stroke="currentColor" strokeLinecap="round" />
                    </svg>
                </span>
            </div>
        );
    }

    render() {
        const shouldFadeOut = this.state.isFocused && this.props.fadeIconOnFocus;
        const id = `textarea-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`textarea ${this.state.showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label className='textarea-label'><p>{this.props.label}</p></label>
                <div className="textarea-wrapper">
                    {this.renderIcon()}
                    <textarea
                        ref={this.textareaRef}
                        className={`textarea-input ${this.props.error ? 'error' : ''}`}
                        id={id}
                        value={this.state.value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                    {this.renderResizeHandle()}
                </div>
            </div>
        );
    }
}
