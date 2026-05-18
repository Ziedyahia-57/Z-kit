import React from 'react';
import PropTypes from "prop-types";
import './Search.scss';
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import { Loader } from '../spinner/Spinner';

soundManager.loadSound('click', clickSoundFile, 1);

export class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            faviconUrl: null,
            faviconVisible: false,
            showFavicon: false,
            previousDomain: null,
            faviconError: false,
            isLoadingFavicon: false, // New state to track loading
        };
        this.searchInputRef = React.createRef();
        this._debounceTimer = null;
        this.faviconCache = new Map(); // Cache successful favicon URLs

        if (props.enableSound) {
            const preloadAudio = new Audio(clickSoundFile);
            preloadAudio.load();
            window._preloadedAudio = preloadAudio;
        }
    }

    _isCompleteDomain(value) {
        const completeDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

        if (!completeDomainPattern.test(value)) {
            return false;
        }

        const tldPart = value.split('.').pop();

        const validTLDs = ['com', 'org', 'net', 'io', 'co', 'dev', 'app', 'ai', 'gov', 'edu', 'mil', 'info', 'biz', 'tv', 'me'];
        const validSecondLevelTLDs = ['uk', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'in', 'ca', 'au', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi', 'ch', 'at', 'be', 'pl', 'mx', 'kr', 'sg', 'hk', 'tw', 'nz', 'za', 'tn', 'sa'];

        if (validTLDs.includes(tldPart.toLowerCase())) {
            return true;
        }

        if (validSecondLevelTLDs.includes(tldPart.toLowerCase())) {
            return true;
        }

        return false;
    }

    _extractDomain(value) {
        try {
            const urlString = value.startsWith('http') ? value : `https://${value}`;
            const url = new URL(urlString);
            return url.hostname.replace('www.', '');
        } catch {
            return value.replace('www.', '');
        }
    }

    /**
     * Returns the favicon URL using twenty-icons service
     * Zero console errors, reliable, and fast
     */
    _getFaviconUrl(domain) {
        if (!domain) return null;
        // Clean the domain (remove protocol, www, etc.)
        const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
        // Use twenty-icons service - never errors, always returns something
        return `https://twenty-icons.com/${cleanDomain}`;
    }

    /**
     * Silently test if a favicon loads successfully
     * Returns promise that resolves to boolean (true if loads, false if error)
     */
    _testFaviconLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();

            // Silent handlers - no console errors
            img.onload = () => {
                // Check if it's a valid image (not 1x1 or 0x0)
                if (img.naturalWidth > 1 && img.naturalHeight > 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };

            img.onerror = () => {
                resolve(false); // Silently fail, no console error
            };

            // Don't use crossOrigin to avoid CORS errors
            img.src = url;
        });
    }

    /**
     * Debounced favicon fetcher using twenty-icons service
     * Silently handles 404s and falls back to globe icon
     */
    async _debouncedFaviconFetch(value) {
        // Clear existing timer
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        const domain = this._extractDomain(value);

        // Don't fetch if not a valid domain
        if (!this._isCompleteDomain(value)) {
            this.setState({
                showFavicon: false,
                previousDomain: null,
                faviconUrl: null,
                faviconError: false,
                isLoadingFavicon: false,
            });
            return;
        }

        // Debounce the fetch
        this._debounceTimer = setTimeout(async () => {
            const currentDomain = this._extractDomain(this.state.value);

            // Only proceed if domain hasn't changed
            if (currentDomain === domain) {
                // Check cache first
                if (this.faviconCache.has(domain)) {
                    const cachedUrl = this.faviconCache.get(domain);
                    if (cachedUrl) {
                        this.setState({
                            faviconUrl: cachedUrl,
                            showFavicon: true,
                            previousDomain: domain,
                            faviconError: false,
                            isLoadingFavicon: false,
                        }, () => {
                            requestAnimationFrame(() => {
                                this.setState({ faviconVisible: true });
                            });
                        });
                    } else {
                        // Cached as failed - show globe
                        this.setState({
                            showFavicon: false,
                            previousDomain: null,
                            faviconUrl: null,
                            faviconError: true,
                            isLoadingFavicon: false,
                        });
                    }
                    return;
                }

                // Start loading
                this.setState({ isLoadingFavicon: true });

                const faviconUrl = this._getFaviconUrl(domain);

                // Silently test if favicon loads
                const isValid = await this._testFaviconLoad(faviconUrl);

                if (isValid) {
                    // Cache successful URL
                    this.faviconCache.set(domain, faviconUrl);
                    this.setState({
                        faviconUrl: faviconUrl,
                        showFavicon: true,
                        previousDomain: domain,
                        faviconError: false,
                        isLoadingFavicon: false,
                    }, () => {
                        requestAnimationFrame(() => {
                            this.setState({ faviconVisible: true });
                        });
                    });
                } else {
                    // Cache failure (null means show globe)
                    this.faviconCache.set(domain, null);
                    this.setState({
                        showFavicon: false,
                        previousDomain: null,
                        faviconUrl: null,
                        faviconError: true,
                        isLoadingFavicon: false,
                    });
                }
            }
        }, this.props.faviconDebounce ?? 600);
    }

    componentDidUpdate(prevProps) {
        const { enableFavicon, faviconDebounce } = this.props;

        if (faviconDebounce !== prevProps.faviconDebounce && this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        if (!enableFavicon && prevProps.enableFavicon) {
            if (this._debounceTimer) {
                clearTimeout(this._debounceTimer);
            }
            this.setState({
                faviconUrl: null,
                faviconVisible: false,
                showFavicon: false,
                previousDomain: null,
                faviconError: false,
                isLoadingFavicon: false,
            });
        }
    }

    componentWillUnmount() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
    }

    handleChange = (e) => {
        const value = e.target.value;

        if (this.state.faviconVisible) {
            this.setState({ faviconVisible: false });
        }

        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }

        // Use the new debounced favicon fetcher
        if (this.props.enableFavicon) {
            this._debouncedFaviconFetch(value);
        }
    }

    emptySearch = () => {
        const { enableSound = true } = this.props;

        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        this.setState({
            value: '',
            faviconUrl: null,
            faviconVisible: false,
            showFavicon: false,
            previousDomain: null,
            faviconError: false,
            isLoadingFavicon: false,
        });
        this.searchInputRef.current?.focus();

        if (this.props.onChange) {
            this.props.onChange('');
        }

        if (enableSound) {
            soundManager.play('click', 1);
        }
    }

    renderIcons = () => {
        const { value, faviconUrl, faviconVisible, showFavicon, faviconError, isLoadingFavicon } = this.state;
        const { enableFavicon = true } = this.props;

        const isEmpty = !value;
        const isDomain = this._isCompleteDomain(value);

        // Show loader when favicon is loading
        const showLoader = isDomain && enableFavicon && isLoadingFavicon;

        // Show globe when:
        // 1. Input is a domain and favicon hasn't been requested yet, OR
        // 2. Favicon failed to load (404)
        const showGlobe = isDomain && enableFavicon && !showLoader && (!showFavicon || faviconError);

        return (
            <>
                <div className="search-icon-container search-icon-container--left">
                    {/* Search icon — only when input is not a domain */}
                    {!showFavicon && !showGlobe && !showLoader && (
                        <span className="search-icon search-icon--search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21 21-4.34-4.34" />
                                <circle cx="11" cy="11" r="8" />
                            </svg>
                        </span>
                    )}

                    {/* Loader — domain detected, favicon is loading */}
                    {showLoader && (
                        <span className="search-icon search-icon--loader">
                            <Loader size="small" />
                        </span>
                    )}

                    {/* Globe — domain detected, favicon not yet resolved or failed (404) */}
                    {showGlobe && (
                        <span className="search-icon search-icon--globe">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                        </span>
                    )}

                    {/* Favicon — using twenty-icons service (silent 404 handling) */}
                    {showFavicon && enableFavicon && faviconUrl && isDomain && !faviconError && (
                        <span className={`search-icon search-icon--favicon ${faviconVisible ? 'blur-in' : ''}`}>
                            <img
                                src={faviconUrl}
                                alt=""
                                width="16"
                                height="16"
                                // Silent error handling - if image fails, switch to globe
                                onError={() => {
                                    // Only update if this domain is still current
                                    const currentDomain = this._extractDomain(this.state.value);
                                    if (currentDomain === this.state.previousDomain) {
                                        // Cache the failure
                                        this.faviconCache.set(currentDomain, null);
                                        this.setState({
                                            showFavicon: false,
                                            faviconError: true,
                                            faviconUrl: null,
                                            isLoadingFavicon: false,
                                        });
                                    }
                                }}
                            />
                        </span>
                    )}
                </div>

                {!isEmpty && (
                    <div className="search-icon-container search-icon-container--right">
                        <span className="search-icon search-icon--close" onClick={this.emptySearch}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </span>
                    </div>
                )}
            </>
        );
    }

    render() {
        return (
            <div className="search">
                <div className="search-wrapper">
                    {this.renderIcons()}
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
    enableFavicon: PropTypes.bool,
    faviconDebounce: PropTypes.number,
}

Search.defaultProps = {
    placeholder: 'Search..',
    disabled: false,
    enableSound: true,
    enableFavicon: true,
    faviconDebounce: 600,
}