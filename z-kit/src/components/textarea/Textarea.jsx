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
            charLimitFlash: false,
            initialHeight: 0,
        };
        this.textareaRef = React.createRef();
        this._resizeState = null;
        this.isInternalChange = false;
        this.heightAnimationTimeout = null;
        this._userSetHeight = null; // Tracks manual drag height overrides
    }

    vibrate = (duration = 150) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(duration);
        }
    }

    triggerHeightAnimation = () => {
        const textarea = this.textareaRef.current;
        if (!textarea) return;

        textarea.classList.add('animate-height');

        if (this.heightAnimationTimeout) clearTimeout(this.heightAnimationTimeout);
        this.heightAnimationTimeout = setTimeout(() => {
            textarea.classList.remove('animate-height');
        }, 350);
    }

    handleChange = (e) => {
        const { maxLength } = this.props;
        const newValue = e.target.value;

        if (maxLength > 0 && newValue.length > maxLength) {
            this.vibrate(150);
            this.setState({ charLimitFlash: false }, () => {
                this.setState({ charLimitFlash: true });
                setTimeout(() => this.setState({ charLimitFlash: false }), 500);
            });
            return;
        }

        this.isInternalChange = true;
        this.triggerHeightAnimation();
        this.setState({ value: newValue }, () => {
            this.isInternalChange = false;
        });
        this.autoResize();

        if (this.props.onChange) this.props.onChange(newValue);
    }

    handleKeyDown = (e) => {
        if (this.props.onKeyDown) this.props.onKeyDown(e);
    }

    handleFocus = (e) => {
        this.setState({ isFocused: true });

        if (this.props.showIcon) {
            this.triggerHeightAnimation();
            requestAnimationFrame(() => {
                this.autoResize();
            });
        }

        if (this.props.onFocus) this.props.onFocus(e);
    }

    handleBlur = (e) => {
        this.setState({ isFocused: false });

        if (this.props.showIcon) {
            this.triggerHeightAnimation();
            requestAnimationFrame(() => {
                this.autoResize();
            });
        }

        if (this.props.onBlur) this.props.onBlur(e);
    }

    autoResize = () => {
        const textarea = this.textareaRef.current;
        if (!textarea) return;

        const currentHeight = textarea.offsetHeight;

        // 1. Reset height to auto to measure true scrollHeight
        textarea.style.height = 'auto';

        // 2. Calculate the height the content NEEDS (Removed window.innerHeight * 0.5 limit)
        const neededHeight = Math.max(
            this.state.initialHeight,
            textarea.scrollHeight
        );

        // 3. Determine final target: use the larger of "needed" or "user-set"
        const targetHeight = (this._userSetHeight !== null && this._userSetHeight > neededHeight)
            ? this._userSetHeight
            : neededHeight;

        if (currentHeight === targetHeight) {
            textarea.style.height = `${targetHeight}px`;
            return;
        }

        // 4. Snap back to current height visually
        textarea.style.height = `${currentHeight}px`;

        // 5. Force reflow
        textarea.offsetHeight;

        // 6. Set to target height
        textarea.style.height = `${targetHeight}px`;
    }

    handleWindowResize = () => {
        this.autoResize();
    }

    componentDidMount() {
        const textarea = this.textareaRef.current;
        if (textarea) {
            textarea.style.transition = 'none';
            textarea.style.height = 'auto';

            const intrinsicHeight = textarea.scrollHeight;

            this.setState({ initialHeight: intrinsicHeight });
            textarea.style.minHeight = `${intrinsicHeight}px`;
            textarea.style.height = `${intrinsicHeight}px`;

            window.addEventListener('resize', this.handleWindowResize);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.showIcon !== this.props.showIcon) {
            this.setState({ showIcon: this.props.showIcon });
        }

        // If an external script clears the textarea, reset the manual override
        if (prevProps.value !== this.props.value && this.props.value !== undefined && !this.isInternalChange) {
            if (this.props.value === '') {
                this._userSetHeight = null;
            }
            this.setState({ value: this.props.value }, () => {
                this.autoResize();
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
        window.removeEventListener('resize', this.handleWindowResize);
        if (this.heightAnimationTimeout) clearTimeout(this.heightAnimationTimeout);
    }

    // ── Custom resize handle logic ──────────────────────────────────────
    _onResizePointerDown = (e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        const el = this.textareaRef.current;
        if (!el) return;

        this._resizeState = {
            startX: e.clientX,
            startY: e.clientY,
            startW: el.offsetWidth,
            startH: el.offsetHeight
        };

        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);
    }

    _onPointerMove = (e) => {
        if (!this._resizeState) return;
        e.preventDefault();

        const el = this.textareaRef.current;
        if (!el) return;

        const { startX, startY, startW, startH } = this._resizeState;
        const newW = Math.max(144, startW + (e.clientX - startX));

        el.style.width = `${newW}px`;
        el.style.height = 'auto';

        // The absolute minimum the textarea is allowed to be right now (Removed limit)
        const minAllowedHeight = Math.max(
            this.state.initialHeight,
            el.scrollHeight
        );

        // The height the mouse is trying to drag to
        const rawDragHeight = startH + (e.clientY - startY);

        // Follow the mouse, but don't let it go below the minimum allowed height
        const finalHeight = Math.max(minAllowedHeight, rawDragHeight);

        el.style.height = `${finalHeight}px`;
    }

    _onPointerUp = (e) => {
        const el = this.textareaRef.current;
        if (el) {
            const finalHeight = el.offsetHeight;
            const contentNeeds = Math.max(
                this.state.initialHeight,
                el.scrollHeight // Removed limit
            );

            // If the user dragged it taller than the text needs, save that height!
            if (finalHeight > contentNeeds) {
                this._userSetHeight = finalHeight;
            } else {
                // If they dragged it back down to fit the text, clear the override
                this._userSetHeight = null;
            }
        }

        if (this._resizeState && e.currentTarget) {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        }
        this._resizeState = null;
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

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
                        onKeyDown={this.handleKeyDown}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                    {this.renderResizeHandle()}
                </div>
                <label className={`textarea-error ${this.props.error ? 'visible' : ''}`}>
                    <small>{this.props.errorText}</small>
                </label>
            </div>
        );
    }
}

Textarea.defaultProps = {
    fadeIconOnFocus: true,
    maxLength: 10,
    error: false,
    errorText: 'invalid input',
    placeholder: 'Placeholder',
    disabled: false
};

Textarea.propTypes = {
    label: PropTypes.string.isRequired,
    fadeIconOnFocus: PropTypes.bool,
    maxLength: PropTypes.number,
    error: PropTypes.bool,
    errorText: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};

export default Textarea;