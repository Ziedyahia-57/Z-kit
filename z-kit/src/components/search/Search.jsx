import React from 'react';
import PropTypes from "prop-types";
import './Search.scss';
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';

// Load sound once (could be done in a central location)
soundManager.loadSound('click', clickSoundFile, 1);


export class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.searchInputRef = React.createRef();

        if (props.enableSound) {
            const preloadAudio = new Audio(clickSoundFile);
            preloadAudio.load();
            // Store in window to prevent garbage collection
            window._preloadedAudio = preloadAudio;
        }
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    emptySearch = () => {
        const { enableSound = true, soundVolume = 1, disabled = false, onToggle } = this.props;


        this.setState({ value: '' });
        this.searchInputRef.current?.focus();

        if (this.props.onChange) {
            this.props.onChange('');
        }

        if (enableSound) {
            soundManager.play('click', 1);
        }
    }

    renderIcon = () => {
        const isEmpty = !this.state.value;

        return (
            <div className="search-icon-container">
                <span
                    className={`search-icon search-icon--search ${isEmpty ? 'visible' : 'hidden'} ${this.props.fadeIconOnInput && !isEmpty ? 'fade-out' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21 21-4.34-4.34" />
                        <circle cx="11" cy="11" r="8" />
                    </svg>
                </span>

                <span
                    className={`search-icon search-icon--close ${!isEmpty ? 'visible' : 'hidden'} ${this.props.fadeIconOnInput && isEmpty ? 'fade-out' : ''}`}
                    onClick={!isEmpty ? this.emptySearch : undefined}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </span>
            </div>
        );
    }

    render() {
        return (
            <div className="search">
                <div className="search-wrapper">
                    {this.renderIcon()}
                    <input
                        type="text"
                        autoComplete='off'
                        className='search-input'
                        id='search-input'
                        ref={this.searchInputRef}
                        value={this.state.value}
                        onChange={this.handleChange}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                </div>
            </div>
        );
    }
}

Search.propTypes = {
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    enableSound: PropTypes.bool,
    onChange: PropTypes.func,
    fadeIconOnInput: PropTypes.bool,
}

Search.defaultProps = {
    placeholder: 'Search..',
    disabled: false,
    enableSound: true,
    fadeIconOnInput: true
}