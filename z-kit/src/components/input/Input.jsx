import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from "prop-types";
import './Input.scss';
import { Loader } from '../spinner/Spinner'; //used by phone and payment inputs
import { Dropdown, DropdownWrapper, DropdownTrigger, DropdownGroup, GroupTitle, GroupItem } from '../dropdown/Dropdown'; //used by color input
import { Select } from '../select/Select'; //used by color input

/*____________________ Input ____________________ */

export function Input(props) {
    const {
        label = "Input",
        placeholder = "Placeholder",
        disabled,
        error,
        errorText,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
        showIcon,
    } = props;

    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e) => {
        setValue(e.target.value);

        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) {
            onFocus();
        }
        e.target.select()
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    const renderIcon = () => {
        if (!showIcon) return null;

        const fadeClass = showIcon && isFocused && fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span
                className={`input-icon ${fadeClass}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`input ${showIcon ? 'has-icon' : ''} ${showIcon && shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className='input-label'><p>{label}</p></label>}
            <div className="input-wrapper">
                {renderIcon()}
                <input
                    type="text"
                    autoComplete='off'
                    className={`text-input ${error ? 'error' : ''}`}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
}

Input.propTypes = {
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    // error: PropTypes.bool,
    // errorText: PropTypes.string,
    showIcon: PropTypes.bool,
    fadeIconOnFocus: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
}

Input.defaultProps = {
    label: 'label',
    details: 'details',
    placeholder: 'placeholder',
    disabled: false,
    // error: false,
    // errorText: 'invalid input',
    showIcon: false,
    fadeIconOnFocus: true
}

/*____________________ Password Input ____________________ */


export function PasswordInput(props) {
    const {
        label = "Password",
        placeholder = "Password",
        disabled,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
        showIcon,
    } = props;

    const [value, setValue] = useState('');

    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');

    const handleChange = (e) => {
        setValue(e.target.value);
        setError(false);

        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) {
            onFocus();
        };
        e.target.select();
    };

    const handleBlur = () => {
        const password = value;
        let isValid = true;
        let errorMessage = "";

        // Check minimum length
        if (password.length < 8) {
            isValid = false;
            errorMessage = "Password must be at least 8 characters";
        }
        // Check for at least one number
        else if (!/\d/.test(password)) {
            isValid = false;
            errorMessage = "Password must contain at least one number";
        }
        // Check for at least one uppercase letter
        else if (!/[A-Z]/.test(password)) {
            isValid = false;
            errorMessage = "Password must contain at least one uppercase letter";
        }
        // Check for at least one lowercase letter
        else if (!/[a-z]/.test(password)) {
            isValid = false;
            errorMessage = "Password must contain at least one lowercase letter";
        }
        // Check for at least one special character
        else if (!/[!@#$%^&*(),-.?":{}|<>]/.test(password)) {
            isValid = false;
            errorMessage = "Password must contain at least one special character";
        }

        setIsFocused(false);
        setError(!isValid);
        setErrorText(isValid ? "" : errorMessage);

        if (onBlur) {
            onBlur();
        }
    };

    const renderIcon = () => {
        if (!showIcon) return null;

        const fadeClass = showIcon && isFocused && fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span
                className={`input-icon ${fadeClass}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock-keyhole-icon lucide-lock-keyhole"><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`input ${showIcon ? 'has-icon' : ''} ${showIcon && shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className='input-label'><p>{label}</p></label>}
            <div className="input-wrapper">
                {renderIcon()}
                <input
                    type="password"
                    autoComplete='off'
                    className={`password-input ${error ? 'error' : ''}`}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
}

/*____________________ Email Input ____________________ */


export function EmailInput(props) {
    const {
        label = "Email",
        placeholder = "name@example.com",
        disabled,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
        showIcon,
    } = props;

    const [value, setValue] = useState('');

    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');

    const handleChange = (e) => {
        setValue(e.target.value);
        setError(false);

        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
        e.target.select();
    };

    const handleBlur = () => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = regex.test(value);

        setIsFocused(false);
        setError(!isValid);
        setErrorText(isValid ? "" : "Invalid Email");  // Clear error when valid

        if (onBlur) {
            onBlur();
        }
    };

    const renderIcon = () => {
        if (!showIcon) return null;

        const fadeClass = showIcon && isFocused && fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span
                className={`input-icon ${fadeClass}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`input ${showIcon ? 'has-icon' : ''} ${showIcon && shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className='input-label'><p>{label}</p></label>}
            <div className="input-wrapper">
                {renderIcon()}
                <input
                    type="email"
                    autoComplete='off'
                    className={`email-input ${error ? 'error' : ''}`}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
}

/*____________________ Phone Input ____________________ */

// Inline SVG flag renderer using country-flag-icons
const CountryFlag = ({ countryCode, width = 20, height = 15 }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    if (!countryCode) return null;

    return (
        <span className={`flag ${isVisible ? 'blur-in' : ''}`}>
            <img
                src={`/flags/${countryCode.toLowerCase()}.svg`}
                onLoad={() => setIsVisible(true)}
                onError={() => setIsVisible(true)}
            />
        </span>
    );
};

// Dial code → ISO country code map (most common + extended)
const DIAL_CODES = [
    { code: '+1', country: 'US', min: 12, max: 12 },
    { code: '+7', country: 'RU', min: 12, max: 12 },
    { code: '+20', country: 'EG', min: 13, max: 13 },
    { code: '+27', country: 'ZA', min: 12, max: 12 },
    { code: '+30', country: 'GR', min: 11, max: 15 },
    { code: '+31', country: 'NL', min: 12, max: 12 },
    { code: '+32', country: 'BE', min: 11, max: 11 },
    { code: '+33', country: 'FR', min: 12, max: 12 },
    { code: '+34', country: 'ES', min: 12, max: 12 },
    { code: '+36', country: 'HU', min: 12, max: 12 },
    { code: '+39', country: 'IT', min: 13, max: 14 },
    { code: '+40', country: 'RO', min: 12, max: 13 },
    { code: '+41', country: 'CH', min: 12, max: 13 },
    { code: '+44', country: 'GB', min: 13, max: 13 },
    { code: '+45', country: 'DK', min: 11, max: 11 },
    { code: '+46', country: 'SE', min: 12, max: 13 },
    { code: '+47', country: 'NO', min: 11, max: 11 },
    { code: '+48', country: 'PL', min: 12, max: 12 },
    { code: '+49', country: 'DE', min: 13, max: 15 },
    { code: '+51', country: 'PE', min: 12, max: 13 },
    { code: '+52', country: 'MX', min: 13, max: 13 },
    { code: '+53', country: 'CU', min: 11, max: 11 },
    { code: '+54', country: 'AR', min: 14, max: 14 },
    { code: '+55', country: 'BR', min: 14, max: 15 },
    { code: '+56', country: 'CL', min: 12, max: 12 },
    { code: '+57', country: 'CO', min: 13, max: 13 },
    { code: '+58', country: 'VE', min: 13, max: 13 },
    { code: '+60', country: 'MY', min: 12, max: 13 },
    { code: '+61', country: 'AU', min: 12, max: 12 },
    { code: '+62', country: 'ID', min: 12, max: 14 },
    { code: '+63', country: 'PH', min: 13, max: 13 },
    { code: '+64', country: 'NZ', min: 11, max: 13 },
    { code: '+65', country: 'SG', min: 11, max: 11 },
    { code: '+66', country: 'TH', min: 12, max: 12 },
    { code: '+81', country: 'JP', min: 13, max: 13 },
    { code: '+82', country: 'KR', min: 12, max: 13 },
    { code: '+84', country: 'VN', min: 12, max: 13 },
    { code: '+86', country: 'CN', min: 14, max: 14 },
    { code: '+90', country: 'TR', min: 13, max: 13 },
    { code: '+91', country: 'IN', min: 13, max: 13 },
    { code: '+92', country: 'PK', min: 13, max: 13 },
    { code: '+93', country: 'AF', min: 12, max: 12 },
    { code: '+94', country: 'LK', min: 12, max: 12 },
    { code: '+95', country: 'MM', min: 11, max: 13 },
    { code: '+98', country: 'IR', min: 13, max: 13 },
    { code: '+212', country: 'MA', min: 13, max: 13 },
    { code: '+213', country: 'DZ', min: 13, max: 13 },
    { code: '+216', country: 'TN', min: 12, max: 12 },
    { code: '+218', country: 'LY', min: 13, max: 13 },
    { code: '+220', country: 'GM', min: 11, max: 11 },
    { code: '+221', country: 'SN', min: 13, max: 13 },
    { code: '+222', country: 'MR', min: 12, max: 12 },
    { code: '+223', country: 'ML', min: 12, max: 12 },
    { code: '+224', country: 'GN', min: 13, max: 13 },
    { code: '+225', country: 'CI', min: 12, max: 12 },
    { code: '+226', country: 'BF', min: 12, max: 12 },
    { code: '+227', country: 'NE', min: 12, max: 12 },
    { code: '+228', country: 'TG', min: 12, max: 12 },
    { code: '+229', country: 'BJ', min: 12, max: 12 },
    { code: '+230', country: 'MU', min: 11, max: 11 },
    { code: '+231', country: 'LR', min: 11, max: 11 },
    { code: '+232', country: 'SL', min: 12, max: 12 },
    { code: '+233', country: 'GH', min: 13, max: 13 },
    { code: '+234', country: 'NG', min: 14, max: 14 },
    { code: '+235', country: 'TD', min: 12, max: 12 },
    { code: '+236', country: 'CF', min: 12, max: 12 },
    { code: '+237', country: 'CM', min: 13, max: 13 },
    { code: '+238', country: 'CV', min: 11, max: 11 },
    { code: '+239', country: 'ST', min: 11, max: 11 },
    { code: '+240', country: 'GQ', min: 13, max: 13 },
    { code: '+241', country: 'GA', min: 11, max: 11 },
    { code: '+242', country: 'CG', min: 13, max: 13 },
    { code: '+243', country: 'CD', min: 13, max: 13 },
    { code: '+244', country: 'AO', min: 13, max: 13 },
    { code: '+245', country: 'GW', min: 11, max: 11 },
    { code: '+246', country: 'IO', min: 11, max: 11 },
    { code: '+247', country: 'SH', min: 10, max: 10 },
    { code: '+248', country: 'SC', min: 11, max: 11 },
    { code: '+249', country: 'SD', min: 13, max: 13 },
    { code: '+250', country: 'RW', min: 13, max: 13 },
    { code: '+251', country: 'ET', min: 13, max: 13 },
    { code: '+252', country: 'SO', min: 12, max: 12 },
    { code: '+253', country: 'DJ', min: 12, max: 12 },
    { code: '+254', country: 'KE', min: 13, max: 13 },
    { code: '+255', country: 'TZ', min: 13, max: 13 },
    { code: '+256', country: 'UG', min: 13, max: 13 },
    { code: '+257', country: 'BI', min: 12, max: 12 },
    { code: '+258', country: 'MZ', min: 13, max: 13 },
    { code: '+260', country: 'ZM', min: 13, max: 13 },
    { code: '+261', country: 'MG', min: 13, max: 13 },
    { code: '+262', country: 'RE', min: 13, max: 13 },
    { code: '+263', country: 'ZW', min: 13, max: 13 },
    { code: '+264', country: 'NA', min: 13, max: 13 },
    { code: '+265', country: 'MW', min: 13, max: 13 },
    { code: '+266', country: 'LS', min: 12, max: 12 },
    { code: '+267', country: 'BW', min: 12, max: 12 },
    { code: '+268', country: 'SZ', min: 12, max: 12 },
    { code: '+269', country: 'KM', min: 11, max: 11 },
    { code: '+290', country: 'SH', min: 10, max: 10 },
    { code: '+291', country: 'ER', min: 11, max: 11 },
    { code: '+297', country: 'AW', min: 11, max: 11 },
    { code: '+298', country: 'FO', min: 10, max: 10 },
    { code: '+299', country: 'GL', min: 10, max: 10 },
    { code: '+350', country: 'GI', min: 12, max: 12 },
    { code: '+351', country: 'PT', min: 13, max: 13 },
    { code: '+352', country: 'LU', min: 13, max: 13 },
    { code: '+353', country: 'IE', min: 13, max: 13 },
    { code: '+354', country: 'IS', min: 11, max: 11 },
    { code: '+355', country: 'AL', min: 12, max: 12 },
    { code: '+356', country: 'MT', min: 12, max: 12 },
    { code: '+357', country: 'CY', min: 12, max: 12 },
    { code: '+358', country: 'FI', min: 12, max: 13 },
    { code: '+359', country: 'BG', min: 12, max: 13 },
    { code: '+370', country: 'LT', min: 12, max: 12 },
    { code: '+371', country: 'LV', min: 12, max: 12 },
    { code: '+372', country: 'EE', min: 11, max: 12 },
    { code: '+373', country: 'MD', min: 12, max: 12 },
    { code: '+374', country: 'AM', min: 12, max: 12 },
    { code: '+375', country: 'BY', min: 13, max: 13 },
    { code: '+376', country: 'AD', min: 10, max: 10 },
    { code: '+377', country: 'MC', min: 12, max: 13 },
    { code: '+378', country: 'SM', min: 10, max: 14 },
    { code: '+379', country: 'VA', min: 10, max: 10 },
    { code: '+380', country: 'UA', min: 13, max: 13 },
    { code: '+381', country: 'RS', min: 12, max: 13 },
    { code: '+382', country: 'ME', min: 12, max: 12 },
    { code: '+383', country: 'XK', min: 12, max: 12 },
    { code: '+385', country: 'HR', min: 12, max: 13 },
    { code: '+386', country: 'SI', min: 12, max: 12 },
    { code: '+387', country: 'BA', min: 12, max: 12 },
    { code: '+389', country: 'MK', min: 12, max: 12 },
    { code: '+420', country: 'CZ', min: 13, max: 13 },
    { code: '+421', country: 'SK', min: 13, max: 13 },
    { code: '+423', country: 'LI', min: 11, max: 11 },
    { code: '+500', country: 'FK', min: 9, max: 9 },
    { code: '+501', country: 'BZ', min: 11, max: 11 },
    { code: '+502', country: 'GT', min: 12, max: 12 },
    { code: '+503', country: 'SV', min: 12, max: 12 },
    { code: '+504', country: 'HN', min: 12, max: 12 },
    { code: '+505', country: 'NI', min: 12, max: 12 },
    { code: '+506', country: 'CR', min: 12, max: 12 },
    { code: '+507', country: 'PA', min: 12, max: 12 },
    { code: '+508', country: 'PM', min: 10, max: 10 },
    { code: '+509', country: 'HT', min: 12, max: 12 },
    { code: '+590', country: 'GP', min: 13, max: 13 },
    { code: '+591', country: 'BO', min: 12, max: 12 },
    { code: '+592', country: 'GY', min: 11, max: 11 },
    { code: '+593', country: 'EC', min: 13, max: 13 },
    { code: '+594', country: 'GF', min: 13, max: 13 },
    { code: '+595', country: 'PY', min: 13, max: 13 },
    { code: '+596', country: 'MQ', min: 13, max: 13 },
    { code: '+597', country: 'SR', min: 11, max: 11 },
    { code: '+598', country: 'UY', min: 12, max: 12 },
    { code: '+599', country: 'CW', min: 11, max: 11 },
    { code: '+670', country: 'TL', min: 11, max: 11 },
    { code: '+672', country: 'NF', min: 10, max: 10 },
    { code: '+673', country: 'BN', min: 11, max: 11 },
    { code: '+674', country: 'NR', min: 11, max: 11 },
    { code: '+675', country: 'PG', min: 11, max: 12 },
    { code: '+676', country: 'TO', min: 9, max: 11 },
    { code: '+677', country: 'SB', min: 11, max: 11 },
    { code: '+678', country: 'VU', min: 11, max: 11 },
    { code: '+679', country: 'FJ', min: 11, max: 11 },
    { code: '+680', country: 'PW', min: 11, max: 11 },
    { code: '+681', country: 'WF', min: 10, max: 10 },
    { code: '+682', country: 'CK', min: 9, max: 9 },
    { code: '+683', country: 'NU', min: 8, max: 8 },
    { code: '+685', country: 'WS', min: 9, max: 11 },
    { code: '+686', country: 'KI', min: 9, max: 12 },
    { code: '+687', country: 'NC', min: 10, max: 10 },
    { code: '+688', country: 'TV', min: 9, max: 9 },
    { code: '+689', country: 'PF', min: 10, max: 10 },
    { code: '+690', country: 'TK', min: 8, max: 8 },
    { code: '+691', country: 'FM', min: 11, max: 11 },
    { code: '+692', country: 'MH', min: 11, max: 11 },
    { code: '+880', country: 'BD', min: 14, max: 14 },
    { code: '+886', country: 'TW', min: 13, max: 13 },
    { code: '+960', country: 'MV', min: 11, max: 11 },
    { code: '+961', country: 'LB', min: 11, max: 12 },
    { code: '+962', country: 'JO', min: 12, max: 12 },
    { code: '+963', country: 'SY', min: 12, max: 13 },
    { code: '+964', country: 'IQ', min: 14, max: 14 },
    { code: '+965', country: 'KW', min: 12, max: 12 },
    { code: '+966', country: 'SA', min: 13, max: 13 },
    { code: '+967', country: 'YE', min: 13, max: 13 },
    { code: '+968', country: 'OM', min: 12, max: 12 },
    { code: '+970', country: 'PS', min: 12, max: 12 },
    { code: '+971', country: 'AE', min: 13, max: 13 },
    { code: '+972', country: 'PS', min: 13, max: 13 },
    { code: '+973', country: 'BH', min: 12, max: 12 },
    { code: '+974', country: 'QA', min: 12, max: 12 },
    { code: '+975', country: 'BT', min: 12, max: 12 },
    { code: '+976', country: 'MN', min: 12, max: 12 },
    { code: '+977', country: 'NP', min: 14, max: 14 },
    { code: '+992', country: 'TJ', min: 13, max: 13 },
    { code: '+993', country: 'TM', min: 12, max: 12 },
    { code: '+994', country: 'AZ', min: 13, max: 13 },
    { code: '+995', country: 'GE', min: 13, max: 13 },
    { code: '+996', country: 'KG', min: 13, max: 13 },
    { code: '+998', country: 'UZ', min: 13, max: 13 }
];

function detectCountry(value) {
    if (!value.startsWith('+')) return null;

    // Match longest prefix first
    const sorted = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
    return sorted.find(entry => value.startsWith(entry.code)) || null;
}

function sanitizePhone(raw) {
    // Allow only digits and a leading +
    let result = '';
    let hasPlus = false;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === '+') {
            if (!hasPlus && i === 0) { hasPlus = true; result += ch; }
            // Skip any subsequent +
        } else if (/\d/.test(ch)) {
            result += ch;
        }
        // All other chars are dropped
    }
    return result;
}

export function PhoneInput(props) {
    const {
        label = "Phone",
        placeholder = "+000 000 000 000",
        disabled,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
        showIcon,
    } = props;

    const [value, setValue] = useState('');

    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [detectedCountry, setDetectedCountry] = useState(null);
    const [isValidating, setIsValidating] = useState(false); // only shown when there is NO detected country
    const [flagKey, setFlagKey] = useState(0); // bumped on country change to replay blur-in + shine

    const handleChange = (e) => {
        const sanitized = sanitizePhone(e.target.value);
        const nextDetectedCountry = detectCountry(sanitized);

        const prevCode = detectedCountry?.country ?? null;
        const nextCode = nextDetectedCountry?.country ?? null;
        const countryChanged = prevCode !== nextCode;

        setValue(sanitized);
        setError(false);
        setErrorText('');
        setDetectedCountry(nextDetectedCountry);
        if (countryChanged) {
            setFlagKey((prev) => prev + 1);
        }

        if (onChange) {
            onChange(sanitized);
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus();
        e.target.select();
    };

    const handleBlur = () => {
        const digits = value.replace(/\D/g, '');
        const totalLen = value.startsWith('+') ? digits.length + 1 : digits.length;

        // Only show the loader when there is no flag to preserve —
        // i.e. the phone icon slot, not the flag slot.
        const showLoader = !detectedCountry && !!value;
        setIsFocused(false);
        setIsValidating(showLoader);

        setTimeout(() => {
            let nextError = false;
            let nextErrorText = '';

            if (!value) {
                // Empty — no error on blur if untouched
            } else if (detectedCountry) {
                if (totalLen < detectedCountry.min) {
                    nextError = true;
                    nextErrorText = `Phone number too short`;
                } else if (totalLen > detectedCountry.max) {
                    nextError = true;
                    nextErrorText = `Phone number too long`;
                }
            } else if (value.startsWith('+')) {
                nextError = true;
                nextErrorText = 'Unrecognized country code';
            } else {
                if (digits.length < 7) {
                    nextError = true;
                    nextErrorText = 'Phone number too short (min 7 digits)';
                } else if (digits.length > 15) {
                    nextError = true;
                    nextErrorText = 'Phone number too long (max 15 digits)';
                }
            }

            setIsValidating(false);
            setError(nextError);
            setErrorText(nextErrorText);
        }, 0);

        if (onBlur) onBlur();
    };

    const renderIcon = () => {
        if (!showIcon) return null;

        const fadeClass = showIcon && isFocused && fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span className={`input-icon ${fadeClass}`}>
                {detectedCountry ? (
                    <CountryFlag
                        key={flagKey}
                        countryCode={detectedCountry.country}
                        width={20}
                        height={16}
                    />
                ) : isValidating ? (
                    <Loader size="small" />
                ) : (
                    <svg
                        className='phone-icon'
                        xmlns="http://www.w3.org/2000/svg"
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                    </svg>
                )}
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`input ${showIcon ? 'has-icon' : ''} ${showIcon && shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className="input-label"><p>{label}</p></label>}
            <div className="input-wrapper">
                {renderIcon()}
                <input
                    type="tel"
                    autoComplete="off"
                    className={`phone-input ${error ? 'error' : ''}`}
                    id={id}
                    value={formatNumber(value, 3)}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    inputmode="numeric"
                    maxLength={16}
                />
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
}
/*____________________ Payment Input ____________________ */

// Shared dark-mode watcher — reused by CardProvider and the default fallback icon.
function useIsDark() {
    const [isDark, setIsDark] = useState(
        typeof document !== 'undefined' && document.body.getAttribute('data-dark') === 'true'
    );

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const sync = () => setIsDark(document.body.getAttribute('data-dark') === 'true');
        sync();

        const observer = new MutationObserver(sync);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-dark'] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

// ==================== ICON COMPONENTS ====================

const AmexIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 14" fill="none">
            <path d="M20 12.1333C20 13.1642 19.1471 14 18.0952 14H1.90476C0.852857 14 0 13.1642 0 12.1333V1.86667C0 0.8358 0.852857 0 1.90476 0H18.0952C19.1471 0 20 0.8358 20 1.86667V12.1333Z" fill={isDark ? '#0667F9' : '#0552C6'} stroke="none" />
            <path d="M3.22502 4.70312L1.25 9.29231H3.61438L3.90749 8.56061H4.57748L4.8706 9.29231H7.47311V8.73385L7.70501 9.29231H9.05123L9.28313 8.72205V9.29231H14.6957L15.3538 8.57961L15.97 9.29231L18.75 9.29821L16.7688 7.01053L18.75 4.70312H16.0132L15.3725 5.40266L14.7756 4.70312H8.88754L8.38192 5.88763L7.86445 4.70312H5.50501V5.24258L5.24254 4.70312H3.22502ZM3.68251 5.3548H4.83502L6.14505 8.46675V5.3548H7.40758L8.41942 7.58605L9.35195 5.3548H10.6082V8.64784H9.84379L9.83755 6.06743L8.72316 8.64784H8.03939L6.91876 6.06743V8.64784H5.34625L5.04814 7.90958H3.43752L3.14002 8.64719H2.29749L3.68251 5.3548ZM11.3075 5.3548H14.4156L15.3663 6.433L16.3475 5.3548H17.2982L15.8538 7.00988L17.2982 8.6459H16.3044L15.3538 7.55517L14.3675 8.6459H11.3075V5.3548ZM4.24317 5.91196L3.71254 7.22711H4.77319L4.24317 5.91196ZM12.075 6.03662V6.63777H13.7707V7.30779H12.075V7.96407H13.9769L14.8606 6.99743L14.0144 6.03605H12.075V6.03662Z" fill="white" stroke="none" />
        </svg>
    );
};

const VisaIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 14" fill="none">
            <path d="M20 12.1333C20 13.1642 19.1471 14 18.0952 14H1.90476C0.852857 14 0 13.1642 0 12.1333V1.86667C0 0.8358 0.852857 0 1.90476 0H18.0952C19.1471 0 20 0.8358 20 1.86667V12.1333Z" fill={isDark ? '#0667F9' : '#0552C6'} stroke="none" />
            <path d="M5.9194 4.3247L4.70366 8.13193C4.70366 8.13193 4.39486 6.52144 4.3643 6.31922C3.67217 4.66109 2.65088 4.75345 2.65088 4.75345L3.85458 9.67193V9.67095H5.31801L7.34162 4.3247H5.9194ZM7.07819 9.67193H8.40736L9.21106 4.3247H7.86523L7.07819 9.67193ZM16.4851 4.3247H15.0865L12.906 9.67193H14.2263L14.4986 8.90825H16.1634L16.305 9.67193H17.5148L16.4851 4.3247ZM14.8671 7.88693L15.5907 5.86616L15.9694 7.88693H14.8671ZM11.0967 5.88318C11.0967 5.58859 11.3273 5.36936 11.9884 5.36936C12.418 5.36936 12.9101 5.697 12.9101 5.697L13.1259 4.57457C13.1259 4.57457 12.4972 4.32422 11.88 4.32422C10.4824 4.32422 9.76153 5.02616 9.76153 5.91477C9.76153 7.52186 11.6037 7.30165 11.6037 8.12707C11.6037 8.26852 11.4967 8.59568 10.7296 8.59568C9.96014 8.59568 9.45227 8.29964 9.45227 8.29964L9.2231 9.37686C9.2231 9.37686 9.71523 9.67144 10.6662 9.67144C11.6194 9.67144 12.9416 8.92283 12.9416 7.84755C12.9416 6.55401 11.0967 6.46068 11.0967 5.88318Z" fill="white" stroke="none" />
            <path d="M4.54254 7.21451L4.09532 4.90646C4.09532 4.90646 3.893 4.40625 3.36708 4.40625C2.84115 4.40625 1.31152 4.40625 1.31152 4.40625C1.31152 4.40625 3.93236 5.21903 4.54254 7.21451Z" fill="#FFC107" stroke="none" />
        </svg>
    );
};

const DinersClubIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 14" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.9043 0.125H18.0957C19.0806 0.125246 19.8747 0.907107 19.875 1.86621V12.1338C19.8747 13.0929 19.0806 13.8748 18.0957 13.875H1.9043C0.919406 13.8748 0.125251 13.0929 0.125 12.1338V1.86621C0.125252 0.907107 0.919406 0.125246 1.9043 0.125Z" fill={isDark ? '#333333' : '#f2f2f2'} stroke={isDark ? '#4C4C4C' : '#666666'} strokeWidth="0.25" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3.17592 8.40513C3.17592 8.12113 3.0346 8.13977 2.89941 8.13681V8.05469C3.01663 8.06066 3.13682 8.06066 3.25435 8.06066C3.38061 8.06066 3.55204 8.05469 3.77475 8.05469C4.55365 8.05469 4.97792 8.6008 4.97792 9.16005C4.97792 9.47302 4.80344 10.2592 3.73858 10.2592C3.5853 10.2592 3.44375 10.253 3.30243 10.253C3.16718 10.253 3.0346 10.2559 2.89941 10.2592V10.1771C3.0797 10.1579 3.16718 10.1518 3.17592 9.93705V8.40513ZM3.47069 9.88636C3.47069 10.1296 3.6363 10.1579 3.78361 10.1579C4.43351 10.1579 4.64678 9.64327 4.64678 9.17272C4.64678 8.58215 4.28589 8.15585 3.70544 8.15585C3.58185 8.15585 3.52497 8.16508 3.47069 8.16849V9.88636Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M5.08325 10.1788H5.14025C5.22446 10.1788 5.28467 10.1788 5.28467 10.0744V9.21856C5.28467 9.07981 5.23963 9.06062 5.12818 8.99762V8.94722C5.26956 8.90258 5.43815 8.84302 5.45005 8.8335C5.47122 8.82082 5.48901 8.81746 5.50432 8.81746C5.51905 8.81746 5.52525 8.83643 5.52525 8.86195V10.0744C5.52525 10.1788 5.59153 10.1788 5.67587 10.1788H5.72677V10.261C5.62449 10.261 5.51905 10.2548 5.41111 10.2548C5.30284 10.2548 5.19446 10.2577 5.08325 10.261V10.1788ZM5.40505 8.33123C5.3267 8.33123 5.25767 8.25545 5.25767 8.17337C5.25767 8.09426 5.32998 8.02148 5.40505 8.02148C5.48311 8.02148 5.55249 8.08803 5.55249 8.17337C5.55249 8.25878 5.48615 8.33123 5.40505 8.33123Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6.01257 9.23651C6.01257 9.11989 5.97936 9.08832 5.83822 9.02822V8.96826C5.96733 8.92409 6.09057 8.88285 6.23512 8.81641C6.24423 8.81641 6.25295 8.82274 6.25295 8.84798V9.05334C6.42467 8.92409 6.57209 8.81641 6.77391 8.81641C7.02922 8.81641 7.11943 9.01229 7.11943 9.25864V10.0733C7.11943 10.1778 7.18581 10.1778 7.26991 10.1778H7.32419V10.26C7.21857 10.26 7.11343 10.2537 7.00526 10.2537C6.89691 10.2537 6.78854 10.2566 6.68026 10.26V10.1778H6.73454C6.81878 10.1778 6.87867 10.1778 6.87867 10.0733V9.2557C6.87867 9.07547 6.77391 8.98712 6.60226 8.98712C6.50591 8.98712 6.3525 9.06906 6.25295 9.13886V10.0733C6.25295 10.1778 6.31943 10.1778 6.40367 10.1778H6.45771V10.26C6.3525 10.26 6.24719 10.2537 6.13871 10.2537C6.03067 10.2537 5.92226 10.2566 5.81409 10.26V10.1778H5.86833C5.95247 10.1778 6.01257 10.1778 6.01257 10.0733V9.23651Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7.55282 9.38837C7.54669 9.41679 7.54669 9.46408 7.55282 9.57154C7.57055 9.87148 7.75444 10.1177 7.99482 10.1177C8.16048 10.1177 8.28989 10.0229 8.401 9.90631L8.443 9.95051C8.30458 10.1431 8.1332 10.3075 7.88675 10.3075C7.40834 10.3075 7.31213 9.82082 7.31213 9.61882C7.31213 8.99972 7.70907 8.81641 7.91941 8.81641C8.16334 8.81641 8.4252 8.97749 8.428 9.31237C8.428 9.33156 8.428 9.35028 8.4252 9.36929L8.398 9.38837H7.55282ZM8.08544 9.2872C8.16048 9.2872 8.16927 9.24607 8.16927 9.20802C8.16927 9.04723 8.0761 8.91771 7.90758 8.91771C7.72427 8.91771 7.59786 9.05957 7.56182 9.2872H8.08544Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M8.49731 10.1778H8.57859C8.66249 10.1778 8.72273 10.1778 8.72273 10.0733V9.18604C8.72273 9.08832 8.61152 9.06906 8.56635 9.04382V8.99661C8.7859 8.89863 8.90628 8.81641 8.9338 8.81641C8.95138 8.81641 8.96042 8.82593 8.96042 8.85765V9.14194H8.96676C9.04173 9.0188 9.16828 8.81641 9.35166 8.81641C9.42683 8.81641 9.52297 8.87006 9.52297 8.98386C9.52297 9.06906 9.46611 9.14524 9.3819 9.14524C9.28835 9.14524 9.28835 9.06906 9.18297 9.06906C9.13193 9.06906 8.96345 9.14194 8.96345 9.33156V10.0733C8.96345 10.1778 9.02356 10.1778 9.10783 10.1778H9.27607V10.26C9.11066 10.2566 8.98476 10.2537 8.85528 10.2537C8.73194 10.2537 8.60556 10.2566 8.49731 10.26V10.1778Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M9.65533 9.82075C9.69454 10.0292 9.81461 10.2063 10.0346 10.2063C10.2118 10.2063 10.2779 10.0925 10.2779 9.98202C10.2779 9.60916 9.62237 9.72929 9.62237 9.22084C9.62237 9.04379 9.75782 8.81641 10.0887 8.81641C10.1848 8.81641 10.3141 8.84505 10.4313 8.90826L10.4524 9.23014H10.3833C10.3532 9.03129 10.2481 8.91764 10.0554 8.91764C9.93506 8.91764 9.82089 8.99016 9.82089 9.12601C9.82089 9.49576 10.5185 9.38185 10.5185 9.87774C10.5185 10.086 10.3593 10.3074 10.0012 10.3074C9.88102 10.3074 9.7394 10.2631 9.63444 10.1999L9.6012 9.83668L9.65533 9.82075Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M13.2345 8.62691H13.1595C13.1023 8.25775 12.8526 8.10912 12.5159 8.10912C12.1696 8.10912 11.6675 8.35214 11.6675 9.11013C11.6675 9.74835 12.1008 10.2064 12.5639 10.2064C12.8614 10.2064 13.1086 9.99152 13.1686 9.65968L13.2378 9.67854L13.1686 10.1398C13.0423 10.222 12.7023 10.3075 12.5035 10.3075C11.8 10.3075 11.3549 9.83047 11.3549 9.11987C11.3549 8.47224 11.9053 8.00781 12.4949 8.00781C12.7384 8.00781 12.973 8.09018 13.2046 8.17552L13.2345 8.62691Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M13.3433 10.1787H13.4002C13.4847 10.1787 13.5447 10.1787 13.5447 10.0743V8.31552C13.5447 8.11001 13.4997 8.10378 13.3853 8.06895V8.01837C13.5055 7.97739 13.632 7.92065 13.6953 7.88245C13.728 7.8638 13.7522 7.84766 13.7611 7.84766C13.7795 7.84766 13.7854 7.86685 13.7854 7.89223V10.0743C13.7854 10.1787 13.8517 10.1787 13.9358 10.1787H13.9867V10.2609C13.8847 10.2609 13.7795 10.2547 13.6711 10.2547C13.5629 10.2547 13.4547 10.2576 13.3433 10.2609V10.1787Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M15.2745 10.0873C15.2745 10.1444 15.3074 10.1473 15.3584 10.1473C15.3947 10.1473 15.4396 10.1444 15.4791 10.1444V10.2108C15.3496 10.2233 15.1029 10.2897 15.0456 10.3087L15.0306 10.299V10.0432C14.8503 10.1979 14.7118 10.3087 14.498 10.3087C14.3356 10.3087 14.1672 10.1979 14.1672 9.93294V9.12415C14.1672 9.04192 14.1553 8.96296 13.9871 8.94739V8.88721C14.0954 8.8841 14.3356 8.86523 14.3748 8.86523C14.4082 8.86523 14.4082 8.88721 14.4082 8.95684V9.7716C14.4082 9.86643 14.4082 10.1378 14.6698 10.1378C14.7719 10.1378 14.9073 10.0559 15.0335 9.94547V9.09566C15.0335 9.03255 14.8892 8.99782 14.7811 8.9664V8.90959C15.0516 8.89033 15.2202 8.86523 15.2503 8.86523C15.2745 8.86523 15.2745 8.88721 15.2745 8.92208V10.0873Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M15.8729 9.04477C15.9932 8.93759 16.1556 8.81731 16.3211 8.81731C16.6701 8.81731 16.8806 9.13666 16.8806 9.48084C16.8806 9.89447 16.5917 10.3084 16.1614 10.3084C15.9391 10.3084 15.8217 10.2323 15.7434 10.1976L15.6534 10.2703L15.5903 10.2356C15.6172 10.0493 15.6324 9.86615 15.6324 9.67339V8.31552C15.6324 8.11001 15.5871 8.10378 15.4728 8.06895V8.01837C15.5932 7.97739 15.7194 7.92065 15.7826 7.88245C15.8158 7.8638 15.8397 7.84766 15.8489 7.84766C15.8668 7.84766 15.8729 7.86692 15.8729 7.89223V9.04477ZM15.8729 9.90388C15.8729 10.0238 15.9813 10.2262 16.1827 10.2262C16.5045 10.2262 16.6398 9.89447 16.6398 9.61325C16.6398 9.27222 16.3934 8.98803 16.1589 8.98803C16.0471 8.98803 15.9541 9.06395 15.8729 9.13666V9.90388Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6.71863 4.88132C6.71863 3.27381 7.9597 1.9707 9.49056 1.9707C11.0215 1.9707 12.2626 3.27381 12.2626 4.88132C12.2626 6.4888 11.0215 7.79199 9.49056 7.79199C7.9597 7.79199 6.71863 6.4888 6.71863 4.88132Z" fill="#FFFFFE" stroke="none" />
            <path fillRule="evenodd" clipRule="evenodd" d="M11.167 4.82386C11.1659 4.07851 10.7222 3.44282 10.0969 3.19108V6.45654C10.7222 6.20447 11.1659 5.56936 11.167 4.82386ZM8.90418 6.45589V3.19141C8.27949 3.44394 7.83646 4.07872 7.8348 4.82386C7.83646 5.56885 8.27949 6.20356 8.90418 6.45589ZM9.50087 2.0638C8.04915 2.06438 6.87301 3.29959 6.87277 4.82386C6.87301 6.34799 8.04915 7.58297 9.50087 7.58323C10.9526 7.58297 12.129 6.34799 12.1293 4.82386C12.129 3.29959 10.9526 2.06438 9.50087 2.0638ZM9.49442 7.8437C7.90587 7.85166 6.59839 6.50031 6.59839 4.85536C6.59839 3.05759 7.90587 1.81413 9.49442 1.81445H10.2389C11.8087 1.81413 13.2414 3.05701 13.2414 4.85536C13.2414 6.49973 11.8087 7.8437 10.2389 7.8437H9.49442Z" fill="#0069AA" stroke="none" />

            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M2.896 12.0972H2.91898C2.97784 12.0972 3.04004 12.0887 3.04004 11.9993V11.0989C3.04004 11.0094 2.97784 11.0008 2.91898 11.0008H2.896V10.9492C2.95981 10.9492 3.05801 10.956 3.13842 10.956C3.2202 10.956 3.31828 10.9492 3.39522 10.9492V11.0008H3.37211C3.31351 11.0008 3.25118 11.0094 3.25118 11.0989V11.9993C3.25118 12.0887 3.31351 12.0972 3.37211 12.0972H3.39522V12.1488C3.31673 12.1488 3.21828 12.1422 3.13675 12.1422C3.0564 12.1422 2.95981 12.1488 2.896 12.1488V12.0972Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M3.39527 12.1578C3.31609 12.1578 3.21814 12.1509 3.13667 12.1509C3.05656 12.1509 2.96029 12.1578 2.89604 12.1578H2.88892V12.0914H2.9189C2.97832 12.0899 3.03234 12.0849 3.03284 12.0009V11.1006C3.03234 11.0165 2.97832 11.011 2.9189 11.0099H2.88892V10.9434H2.89604C2.96029 10.9434 3.05842 10.9501 3.13847 10.9501C3.21987 10.9501 3.31788 10.9434 3.39527 10.9434H3.40258V11.0099H3.37247C3.31299 11.011 3.25866 11.0165 3.25835 11.1006V12.0009C3.25866 12.0849 3.31299 12.0899 3.37247 12.0914H3.40258V12.1578H3.39527ZM3.3882 12.1431L3.38826 12.1065H3.37247C3.31392 12.1065 3.24435 12.0958 3.24397 12.0009V11.1006C3.24435 11.0056 3.31392 10.995 3.37247 10.995H3.3882V10.9582C3.31268 10.9583 3.21783 10.9652 3.13847 10.9652C3.06072 10.9652 2.96661 10.9588 2.90323 10.9582V10.995H2.9189C2.97726 10.995 3.04696 11.0056 3.04696 11.1006V12.0009C3.04696 12.0958 2.97726 12.1065 2.9189 12.1065H2.90323V12.1431C2.96661 12.1425 3.05904 12.1362 3.13667 12.1362C3.21641 12.1362 3.31101 12.1426 3.3882 12.1431Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M4.51967 11.8101L4.52295 11.8067V11.1624C4.52295 11.0214 4.42953 11.0008 4.38046 11.0008H4.3444V10.9492C4.42146 10.9492 4.49674 10.956 4.57357 10.956C4.64067 10.956 4.70805 10.9492 4.77491 10.9492V11.0008H4.75057C4.6816 11.0008 4.60467 11.0145 4.60467 11.219V12.001C4.60467 12.0612 4.60629 12.1213 4.61433 12.1746H4.55212L3.70936 11.188V11.8962C3.70936 12.0459 3.73705 12.0972 3.86309 12.0972H3.89095V12.1488C3.82057 12.1488 3.75026 12.1421 3.67988 12.1421C3.6064 12.1421 3.531 12.1488 3.45728 12.1488V12.0972H3.48026C3.59315 12.0972 3.62753 12.0164 3.62753 11.8793V11.1552C3.62753 11.0591 3.552 11.0008 3.47865 11.0008H3.45728V10.9492C3.51935 10.9492 3.58329 10.956 3.64536 10.956C3.69464 10.956 3.74209 10.9492 3.79115 10.9492L4.51967 11.8101Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M4.61436 12.1835L4.54698 12.1811L3.71636 11.209V11.8978C3.71833 12.0473 3.73995 12.0898 3.86319 12.0914H3.89826V12.1578H3.89098C3.82019 12.1578 3.74974 12.1509 3.67991 12.1509C3.60664 12.1509 3.53142 12.1578 3.45726 12.1578H3.45007V12.0914H3.48031C3.58847 12.0908 3.6194 12.0178 3.62057 11.8809V11.1571C3.62026 11.0656 3.54877 11.0099 3.47876 11.0099H3.45007V10.9434H3.45726C3.51983 10.9434 3.58388 10.9501 3.64529 10.9501C3.69412 10.9501 3.7414 10.9434 3.79657 10.946L4.51588 11.7962V11.1641C4.51505 11.0276 4.42819 11.011 4.38057 11.0099H4.33726V10.9434H4.3445C4.42181 10.9434 4.49716 10.9501 4.5736 10.9501C4.64022 10.9501 4.70729 10.9434 4.77495 10.9434H4.78216V11.0099H4.7506C4.68302 11.0117 4.61371 11.018 4.61171 11.2207V12.0026C4.61171 12.0628 4.6135 12.1228 4.62136 12.1749L4.62288 12.1835H4.61436ZM4.55222 12.1685H4.6064C4.59909 12.1168 4.59778 12.0598 4.59778 12.0026V11.2207C4.59778 11.0144 4.68012 10.995 4.7506 10.9948H4.76785V10.9582C4.70333 10.9588 4.63871 10.965 4.5736 10.965C4.49864 10.965 4.42578 10.9588 4.35181 10.9582L4.35164 10.9948H4.38057C4.43088 10.995 4.53005 11.0184 4.53005 11.1641L4.52788 11.8137L4.52467 11.8171L4.51909 11.8226L3.79119 10.9582C3.74257 10.9582 3.69523 10.965 3.64529 10.965C3.58533 10.965 3.52386 10.9588 3.46451 10.9582L3.4642 10.9948H3.47876C3.55552 10.995 3.6345 11.0565 3.6345 11.1571V11.8809C3.6345 12.0184 3.59802 12.1062 3.48031 12.1067L3.46451 12.1062V12.1431C3.53538 12.1425 3.60843 12.1362 3.67991 12.1362C3.74819 12.1362 3.81633 12.1425 3.88388 12.1431V12.1067H3.86319C3.73436 12.1062 3.70247 12.0473 3.70236 11.8978V11.1704L4.55222 12.1685ZM4.51588 11.8083V11.8077L4.51457 11.8066L4.51588 11.8083Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M5.02019 11.0357C4.8973 11.0357 4.8925 11.0668 4.86799 11.1921H4.81885C4.8253 11.144 4.8334 11.0959 4.8385 11.0461C4.84505 10.9977 4.84833 10.9498 4.84833 10.9001H4.88757C4.90074 10.9517 4.94164 10.9498 4.98605 10.9498H5.83026C5.87467 10.9498 5.9155 10.9481 5.91885 10.8965L5.95795 10.9035C5.95161 10.9498 5.94492 10.9962 5.94016 11.0427C5.93692 11.0891 5.93692 11.1354 5.93692 11.1818L5.88774 11.2009C5.8844 11.1374 5.8763 11.0357 5.76661 11.0357H5.49816V11.95C5.49816 12.0826 5.55554 12.0978 5.63399 12.0978H5.66519V12.1494C5.60133 12.1494 5.48671 12.1428 5.3985 12.1428C5.30016 12.1428 5.1855 12.1494 5.12161 12.1494V12.0978H5.15285C5.24305 12.0978 5.28864 12.0893 5.28864 11.9536V11.0357H5.02019Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M5.66532 12.1576C5.60081 12.1576 5.48632 12.1508 5.39846 12.1508C5.30029 12.1508 5.18577 12.1576 5.1216 12.1576H5.1146V12.0912H5.15284C5.24305 12.089 5.27929 12.0878 5.28132 11.9545V11.044H5.02019V11.0289H5.2955V11.9545C5.2955 12.0924 5.24253 12.1064 5.15284 12.1065H5.1286V12.1428C5.19315 12.1423 5.30343 12.136 5.39846 12.136C5.48367 12.136 5.59301 12.1423 5.65788 12.1428V12.1065H5.63398C5.55477 12.1064 5.49108 12.086 5.49108 11.9509V11.0289H5.7666C5.87639 11.0294 5.89094 11.1273 5.89436 11.1913L5.92981 11.1776C5.92981 11.1327 5.92998 11.0877 5.93288 11.0426C5.93774 10.9982 5.94367 10.9545 5.94981 10.9105L5.92495 10.9061C5.91732 10.9561 5.87119 10.9588 5.83019 10.9582H4.9775C4.93894 10.9582 4.89701 10.9563 4.88229 10.9083H4.85526C4.85501 10.9558 4.85191 11.0019 4.84574 11.0477C4.84084 11.0949 4.83332 11.1403 4.82739 11.1858H4.86232C4.88381 11.0659 4.89784 11.0272 5.02019 11.0289V11.044C4.89894 11.0465 4.9016 11.0678 4.87491 11.1947L4.87374 11.2006H4.81067L4.81153 11.1917C4.81822 11.1437 4.82653 11.0954 4.83129 11.0456C4.83812 10.9979 4.84119 10.9502 4.84119 10.9009V10.8933H4.89319L4.89443 10.8987C4.90543 10.9421 4.93574 10.9424 4.9775 10.9432H5.83019C5.87577 10.9424 5.90898 10.9418 5.91177 10.8968L5.91232 10.8887L5.91977 10.8902L5.96605 10.8979L5.96488 10.9055C5.95836 10.9516 5.95198 10.9979 5.94701 11.044C5.94398 11.09 5.94398 11.1362 5.94398 11.1826V11.1878L5.93922 11.1898L5.88129 11.2121L5.88091 11.2022C5.87639 11.1375 5.87008 11.044 5.7666 11.044H5.50536V11.9509C5.50694 12.0805 5.55591 12.0896 5.63398 12.0912H5.67225V12.1576H5.66532Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M6.01025 12.0972H6.03332C6.09205 12.0972 6.15443 12.0887 6.15443 11.9993V11.0989C6.15443 11.0094 6.09205 11.0008 6.03332 11.0008H6.01025V10.9492C6.10977 10.9492 6.28039 10.956 6.4176 10.956C6.55532 10.956 6.72532 10.9492 6.8366 10.9492C6.83374 11.0231 6.83529 11.1368 6.84015 11.2123L6.79081 11.2259C6.78294 11.1142 6.76332 11.025 6.59139 11.025H6.36415V11.475H6.55856C6.65674 11.475 6.67812 11.4168 6.68784 11.3239H6.73691C6.73363 11.391 6.73191 11.458 6.73191 11.525C6.73191 11.5904 6.73363 11.6557 6.73691 11.7209L6.68784 11.7311C6.67812 11.6281 6.67322 11.5612 6.56015 11.5612H6.36415V11.9613C6.36415 12.0732 6.45867 12.0732 6.5635 12.0732C6.75998 12.0732 6.84663 12.0594 6.89577 11.8637L6.94143 11.8755C6.92018 11.9668 6.90067 12.0576 6.88598 12.1488C6.78108 12.1488 6.59287 12.1422 6.44587 12.1422C6.29822 12.1422 6.10363 12.1488 6.01025 12.1488V12.0972Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M6.88581 12.1578C6.78081 12.1578 6.59247 12.1506 6.44564 12.1506C6.29819 12.1506 6.10364 12.1578 6.01016 12.1578H6.0033V12.0914H6.03323C6.09243 12.0904 6.14633 12.0849 6.14709 12.0009V11.1006C6.14633 11.0166 6.09243 11.011 6.03323 11.0099H6.0033V10.9434H6.01016C6.11016 10.9434 6.2804 10.9501 6.41757 10.9501C6.55516 10.9501 6.72512 10.9434 6.83657 10.9434H6.84381L6.84357 10.9513C6.8425 10.977 6.84185 11.0076 6.84185 11.0399C6.84185 11.0993 6.84357 11.1644 6.84678 11.2133L6.84709 11.2194L6.84157 11.2212L6.78402 11.237L6.78378 11.2282C6.77412 11.1166 6.75988 11.0355 6.59136 11.0338H6.37074L6.37061 11.4691H6.55847C6.65281 11.4681 6.66968 11.4175 6.68081 11.3248L6.68119 11.3178H6.74412L6.74402 11.3257C6.74085 11.3929 6.73892 11.4597 6.73892 11.5266C6.73892 11.5916 6.74085 11.6569 6.74402 11.7222L6.74412 11.7284L6.73819 11.7298L6.68119 11.7417L6.68081 11.7337C6.66947 11.6288 6.66874 11.5712 6.56012 11.57H6.37074V11.963C6.37099 12.0674 6.45674 12.0669 6.5634 12.0674C6.7605 12.0662 6.83943 12.0561 6.88874 11.8633L6.8904 11.8564L6.8973 11.8575L6.94974 11.8718L6.94826 11.8789C6.92702 11.9699 6.9075 12.0607 6.89271 12.1517L6.89147 12.1578H6.88581ZM6.87974 12.143C6.89405 12.0561 6.91271 11.9693 6.93278 11.8828L6.90057 11.8742C6.85157 12.0665 6.75657 12.0837 6.5634 12.0824C6.46026 12.0824 6.35716 12.0824 6.35661 11.963V11.5553H6.56012C6.67443 11.5541 6.68595 11.6264 6.69412 11.7242L6.72947 11.7166C6.7263 11.6532 6.72467 11.5896 6.72467 11.5266C6.72467 11.4621 6.7263 11.3977 6.72947 11.3328H6.69412C6.68492 11.4226 6.65819 11.4852 6.55847 11.4841H6.35661V11.019H6.59136C6.76154 11.0175 6.78974 11.11 6.79716 11.2181L6.83243 11.2081C6.82957 11.1596 6.82764 11.0973 6.82764 11.0399C6.82764 11.0105 6.8284 10.9826 6.82933 10.9582C6.71812 10.9588 6.55212 10.965 6.41757 10.965C6.28309 10.965 6.11754 10.9588 6.01736 10.9582V10.9948H6.03323C6.09143 10.995 6.16109 11.0056 6.16147 11.1006V12.0009C6.16109 12.0958 6.09143 12.1062 6.03323 12.1067H6.01736V12.143C6.11264 12.1426 6.30185 12.1362 6.44564 12.1362C6.59012 12.1362 6.77426 12.1426 6.87974 12.143Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M7.16238 11.1312C7.16238 11.0059 7.09682 11.0008 7.04603 11.0008H7.01648V10.9492C7.06889 10.9492 7.17038 10.956 7.27031 10.956C7.36831 10.956 7.447 10.9492 7.53372 10.9492C7.73965 10.9492 7.92338 11.0075 7.92338 11.2518C7.92338 11.4063 7.8251 11.5007 7.69586 11.5543L7.97558 11.994C8.02155 12.0667 8.05403 12.0871 8.13444 12.0972V12.1488C8.08031 12.1488 8.02793 12.1422 7.9741 12.1422C7.92338 12.1422 7.87076 12.1488 7.82027 12.1488C7.69413 11.9753 7.58603 11.7898 7.47972 11.5919H7.37186V11.9599C7.37186 12.0922 7.43065 12.0972 7.50565 12.0972H7.53534V12.1488C7.44186 12.1488 7.34731 12.1422 7.25382 12.1422C7.17527 12.1422 7.09831 12.1488 7.01648 12.1488V12.0972H7.04603C7.10679 12.0972 7.16238 12.0681 7.16238 12.0046V11.1312ZM7.37186 11.5299H7.45182C7.61569 11.5299 7.70393 11.4647 7.70393 11.2618C7.70393 11.109 7.61062 11.0111 7.46479 11.0111C7.41565 11.0111 7.39472 11.0163 7.37186 11.018V11.5299Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M8.13447 12.1578C8.07957 12.1578 8.02754 12.1509 7.97371 12.1509C7.92381 12.1509 7.87147 12.1578 7.81447 12.155C7.68888 11.9819 7.5813 11.7974 7.47561 11.6012H7.37888V11.9612C7.38068 12.0905 7.43005 12.0896 7.50571 12.0914H7.54243V12.1578H7.53519C7.44164 12.1578 7.34654 12.1509 7.25378 12.1509C7.17561 12.1509 7.09871 12.1578 7.0165 12.1578H7.0094V12.0914H7.04605C7.10492 12.0909 7.15468 12.064 7.15492 12.0062V11.1329C7.15368 11.011 7.09688 11.0116 7.04605 11.0099H7.0094V10.9434H7.0165C7.06947 10.9434 7.17054 10.9501 7.27033 10.9501C7.36805 10.9501 7.44654 10.9434 7.53378 10.9434C7.74012 10.9438 7.93002 11.0035 7.9305 11.2531C7.9305 11.4082 7.83288 11.5051 7.70668 11.5592L7.9815 11.9915C8.0273 12.0628 8.05578 12.0807 8.1354 12.0914L8.14137 12.0924V12.1578H8.13447ZM7.37181 11.5861H7.48364L7.48568 11.5899C7.59226 11.7873 7.69981 11.9729 7.8203 12.1431C7.87012 12.1431 7.92271 12.1362 7.97371 12.1362C8.02592 12.1362 8.07647 12.1422 8.1273 12.143V12.1052C8.05057 12.0954 8.01454 12.0711 7.96985 11.9999L7.68492 11.5525L7.69299 11.5491C7.82116 11.496 7.91616 11.4042 7.91619 11.2531C7.91616 11.0147 7.7395 10.9594 7.53378 10.9582C7.44757 10.9582 7.36892 10.9652 7.27033 10.9652C7.17419 10.9652 7.07705 10.9588 7.0235 10.9582V10.9948H7.04605C7.09688 10.995 7.16916 11.0038 7.16916 11.1329V12.0062C7.16916 12.0752 7.10764 12.1065 7.04605 12.1067H7.0235V12.143C7.10219 12.1426 7.17692 12.1362 7.25378 12.1362C7.34519 12.1362 7.43761 12.1426 7.52812 12.143V12.1067H7.50571C7.43116 12.1065 7.36457 12.0968 7.36457 11.9612V11.5861H7.37181ZM7.37181 11.5389H7.36457V11.0127L7.37081 11.0122C7.39326 11.0103 7.4153 11.0056 7.46481 11.0056C7.61388 11.0056 7.71095 11.1072 7.71109 11.2639C7.71064 11.4691 7.61699 11.5389 7.45185 11.5389H7.37181ZM7.45185 11.5243C7.61388 11.5226 7.69554 11.4636 7.69712 11.2639C7.69616 11.1138 7.60737 11.0206 7.46481 11.02C7.42064 11.02 7.39974 11.0243 7.37888 11.0264V11.5243H7.45185Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M9.24563 11.8101L9.24849 11.8067V11.1624C9.24849 11.0214 9.15549 11.0008 9.10635 11.0008H9.07049V10.9492C9.14742 10.9492 9.22245 10.956 9.29959 10.956C9.36687 10.956 9.43345 10.9492 9.50107 10.9492V11.0008H9.47642C9.40763 11.0008 9.33076 11.0145 9.33076 11.219V12.001C9.33076 12.0612 9.33235 12.1213 9.34042 12.1746H9.27845L8.43563 11.188V11.8962C8.43563 12.0459 8.46328 12.0972 8.58928 12.0972H8.61718V12.1488C8.54683 12.1488 8.47635 12.1421 8.406 12.1421C8.33211 12.1421 8.25697 12.1488 8.18335 12.1488V12.0972H8.20611C8.31911 12.0972 8.35366 12.0164 8.35366 11.8793V11.1552C8.35366 11.0591 8.27828 11.0008 8.20466 11.0008H8.18335V10.9492C8.24532 10.9492 8.30963 10.956 8.37169 10.956C8.42035 10.956 8.46804 10.9492 8.51725 10.9492L9.24563 11.8101Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M9.34037 12.1835L9.27316 12.1811L8.44241 11.2092V11.8978C8.44434 12.0475 8.46589 12.0898 8.5893 12.0914H8.62399V12.1578H8.61689C8.54613 12.1578 8.47589 12.1506 8.40575 12.1506C8.33268 12.1506 8.25706 12.1578 8.18334 12.1578H8.17603V12.0914H8.20613C8.31423 12.0909 8.3452 12.0178 8.34627 11.8805V11.1569C8.34606 11.0653 8.27471 11.0099 8.20468 11.0099H8.17603V10.9434H8.18334C8.24582 10.9434 8.30989 10.9501 8.37168 10.9501C8.41975 10.9501 8.46713 10.9434 8.52203 10.9456L9.24158 11.7962V11.1641C9.24113 11.0276 9.15396 11.0107 9.10637 11.0099H9.0632V10.9434H9.07034C9.14765 10.9434 9.22309 10.9501 9.29961 10.9501C9.36627 10.9501 9.4333 10.9434 9.50078 10.9434H9.50803V11.0099H9.47644C9.40889 11.0116 9.33934 11.018 9.33772 11.2207V12.0026C9.33772 12.0628 9.33913 12.1224 9.34751 12.175L9.3483 12.1835H9.34037ZM9.27844 12.1685H9.33206C9.32489 12.1172 9.32347 12.0598 9.32347 12.0026V11.2207C9.32358 11.0144 9.40637 10.9953 9.47644 10.9948H9.49365V10.9582C9.42923 10.9588 9.36454 10.965 9.29961 10.965C9.2244 10.965 9.15147 10.9588 9.07744 10.9582V10.9948H9.10637C9.15682 10.9953 9.25592 11.0184 9.25592 11.1641L9.25358 11.8137L9.25061 11.8171L9.24547 11.8227L8.51727 10.9582C8.46858 10.9582 8.42109 10.965 8.37168 10.965C8.31096 10.965 8.24978 10.9588 8.19034 10.9582V10.9948H8.20468C8.28171 10.9953 8.36044 11.0562 8.36044 11.1569V11.8805C8.36044 12.0184 8.32347 12.1062 8.20613 12.1067L8.19034 12.1065V12.143C8.26103 12.1425 8.33392 12.1362 8.40575 12.1362C8.47437 12.1362 8.5424 12.1425 8.61006 12.143V12.1067H8.5893C8.46051 12.1065 8.4284 12.0475 8.42803 11.8978V11.1707L9.27844 12.1685ZM9.24158 11.8083V11.8079L9.24037 11.8066L9.24158 11.8083Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M9.76431 11.9032C9.74783 11.9615 9.72807 12.0066 9.72807 12.0371C9.72807 12.0888 9.79704 12.0973 9.85086 12.0973H9.86914V12.1489C9.80342 12.1452 9.73662 12.1423 9.67076 12.1423C9.61183 12.1423 9.55324 12.1452 9.49414 12.1489V12.0973H9.50411C9.5678 12.0973 9.622 12.0577 9.64628 11.9855L9.90817 11.197C9.92955 11.1332 9.95904 11.0473 9.969 10.9836C10.021 10.9648 10.0868 10.9307 10.1178 10.9098C10.1228 10.908 10.1259 10.9062 10.1308 10.9062C10.1358 10.9062 10.1388 10.9063 10.1424 10.9116C10.1472 10.9253 10.152 10.9408 10.1571 10.9545L10.4584 11.8534C10.478 11.9134 10.4975 11.977 10.5184 12.0288C10.5384 12.077 10.5728 12.0973 10.627 12.0973H10.6368V12.1489C10.563 12.1452 10.4892 12.1423 10.411 12.1423C10.3308 12.1423 10.2487 12.1452 10.1652 12.1489V12.0973H10.1832C10.2207 12.0973 10.2849 12.0905 10.2849 12.0475C10.2849 12.0253 10.2701 11.9789 10.2518 11.9237L10.1881 11.7244H9.81659L9.76431 11.9032ZM10.0033 11.1419H9.99986L9.84776 11.6283H10.1536L10.0033 11.1419Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10.6363 12.1559C10.5627 12.1526 10.4889 12.1487 10.411 12.1487C10.3308 12.1487 10.2491 12.1526 10.1656 12.1559L10.158 12.1563V12.0891H10.1832C10.2212 12.0891 10.2774 12.0802 10.2775 12.0471C10.2779 12.0275 10.2632 11.9804 10.2452 11.9258L10.1829 11.7313H9.82185L9.77096 11.905C9.75447 11.9635 9.73458 12.0089 9.73489 12.0368C9.73544 12.0788 9.79654 12.0891 9.85085 12.0891H9.87603V12.1563L9.86858 12.1559C9.80316 12.1526 9.73637 12.1487 9.67089 12.1487C9.61247 12.1487 9.5533 12.1526 9.49468 12.1559L9.48706 12.1563V12.0891H9.50406C9.56489 12.089 9.61568 12.0525 9.63934 11.9827L9.90147 11.1939C9.92261 11.1303 9.95234 11.0448 9.96647 10.9761C10.0178 10.9578 10.0837 10.9231 10.1151 10.9024C10.1197 10.9007 10.1242 10.8985 10.1308 10.8985C10.1348 10.8982 10.1436 10.8993 10.1489 10.9083C10.1536 10.9224 10.1588 10.9378 10.1637 10.9517L10.4651 11.8505C10.4843 11.9107 10.5039 11.9742 10.5254 12.0251C10.5443 12.0709 10.5744 12.089 10.627 12.0891H10.6435V12.1563L10.6363 12.1559ZM10.1723 12.1406C10.2533 12.1376 10.3328 12.1343 10.411 12.1343C10.4869 12.1343 10.5583 12.1376 10.6294 12.1406V12.1046H10.627C10.5708 12.105 10.5322 12.0819 10.5122 12.0312C10.4909 11.9792 10.471 11.9154 10.4516 11.8553L10.1503 10.9564C10.1453 10.9426 10.1407 10.9273 10.1364 10.9151C10.1348 10.9134 10.1352 10.9134 10.1339 10.9134H10.1308C10.1275 10.9134 10.1255 10.9144 10.1213 10.9155C10.0898 10.937 10.0242 10.9709 9.97551 10.9843C9.96554 11.0494 9.93606 11.1353 9.91478 11.1989L9.65292 11.9876C9.62803 12.0623 9.57047 12.1047 9.50406 12.1046H9.5013V12.1406C9.55744 12.1376 9.61406 12.1343 9.67089 12.1343C9.7342 12.1343 9.79875 12.1376 9.86141 12.1406V12.1046H9.85085C9.79741 12.1038 9.72292 12.0977 9.72106 12.0368C9.7212 12.0027 9.74127 11.9588 9.7573 11.9007L9.8112 11.7168H10.1929L10.2584 11.9209C10.2768 11.9762 10.2917 12.022 10.2917 12.0471C10.2892 12.0997 10.2204 12.1036 10.1832 12.1046H10.1723V12.1406ZM9.83778 11.6352L9.99447 11.1338H10.0033H10.0082L10.1637 11.6352H9.83778ZM9.85737 11.6202H10.1439L10.0015 11.1597L9.85737 11.6202Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10.7086 11.0357C10.5859 11.0357 10.5809 11.0668 10.5563 11.1921H10.5071C10.5135 11.144 10.5219 11.0959 10.527 11.0461C10.5334 10.9977 10.5365 10.9498 10.5365 10.9001H10.5761C10.5889 10.9517 10.6299 10.9498 10.6741 10.9498H11.5188C11.5628 10.9498 11.6037 10.9481 11.6069 10.8965L11.646 10.9035C11.64 10.9498 11.6335 10.9962 11.6283 11.0427C11.6247 11.0891 11.6247 11.1354 11.6247 11.1818L11.5758 11.2009C11.5729 11.1374 11.5647 11.0357 11.4548 11.0357H11.1864V11.95C11.1864 12.0826 11.2438 12.0978 11.3222 12.0978H11.3535V12.1494C11.2896 12.1494 11.1752 12.1428 11.0866 12.1428C10.9886 12.1428 10.8737 12.1494 10.8099 12.1494V12.0978H10.8411C10.9313 12.0978 10.9769 12.0893 10.9769 11.9536V11.0357H10.7086Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M11.3535 12.1576C11.2892 12.1576 11.1744 12.1508 11.0864 12.1508C10.9887 12.1508 10.8741 12.1576 10.8099 12.1576H10.8027V12.0912H10.841C10.9313 12.089 10.9675 12.0878 10.9696 11.9545L10.9695 11.044H10.7086V11.0289H10.984V11.9545C10.984 12.0924 10.9309 12.1061 10.841 12.1064H10.8169V12.1429C10.8816 12.1423 10.9916 12.136 11.0864 12.136C11.172 12.136 11.2815 12.1423 11.3461 12.1429V12.1064H11.3221C11.2432 12.1061 11.1795 12.0861 11.1794 11.9509V11.0289H11.4547C11.5647 11.0294 11.579 11.1273 11.5822 11.1913L11.6177 11.1776C11.6177 11.1327 11.618 11.0877 11.6213 11.0428C11.6257 10.9985 11.632 10.9545 11.6379 10.9106L11.6132 10.9061C11.6057 10.9561 11.5594 10.9589 11.5187 10.9582H10.6657C10.6271 10.9586 10.5853 10.9563 10.5705 10.9082H10.5437C10.5433 10.9557 10.5401 11.0019 10.5337 11.0477C10.5292 11.0951 10.5213 11.1406 10.5151 11.1858H10.5503C10.5718 11.0659 10.586 11.027 10.7086 11.0289V11.044C10.5872 11.0462 10.5899 11.0678 10.5632 11.1947L10.562 11.2006H10.4988L10.4998 11.1921C10.5067 11.1437 10.5147 11.0954 10.5195 11.046C10.5262 10.9979 10.5292 10.9502 10.5292 10.9009V10.8933H10.5812L10.5826 10.8987C10.594 10.9421 10.6238 10.9424 10.6657 10.9432H11.5187C11.564 10.9424 11.5971 10.9418 11.6 10.8969L11.6002 10.8887L11.6078 10.8902L11.6543 10.8979L11.6532 10.9055C11.6464 10.9516 11.6402 10.9979 11.6353 11.044C11.632 11.09 11.632 11.1363 11.632 11.1826V11.1878L11.6272 11.1898L11.5692 11.2121L11.569 11.2022C11.5647 11.1375 11.5582 11.044 11.4547 11.044H11.1934V11.9509C11.1951 12.0805 11.2441 12.0896 11.3221 12.0912H11.3603V12.1576H11.3535Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M11.7065 12.0972H11.7295C11.7884 12.0972 11.8504 12.0887 11.8504 11.9993V11.0989C11.8504 11.0094 11.7884 11.0008 11.7295 11.0008H11.7065V10.9492C11.7704 10.9492 11.8684 10.956 11.9485 10.956C12.0306 10.956 12.1288 10.9492 12.2059 10.9492V11.0008H12.1829C12.1237 11.0008 12.0615 11.0094 12.0615 11.0989V11.9993C12.0615 12.0887 12.1237 12.0972 12.1829 12.0972H12.2059V12.1488C12.1273 12.1488 12.029 12.1422 11.9472 12.1422C11.8669 12.1422 11.7704 12.1488 11.7065 12.1488V12.0972Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M12.206 12.1578C12.1268 12.1578 12.029 12.1506 11.9473 12.1506C11.8672 12.1506 11.7705 12.1578 11.7066 12.1578H11.6996V12.0914H11.7296C11.7885 12.0904 11.843 12.0849 11.8433 12.0009V11.1006C11.843 11.0166 11.7885 11.011 11.7296 11.0099H11.6996V10.9434H11.7066C11.7705 10.9434 11.869 10.9501 11.9486 10.9501C12.0302 10.9501 12.1284 10.9434 12.206 10.9434H12.2128V11.0099H12.183C12.1231 11.011 12.0693 11.0166 12.0687 11.1006V12.0009C12.0693 12.0849 12.1231 12.0904 12.183 12.0914H12.2128V12.1578H12.206ZM12.1985 12.143V12.1065H12.183C12.1243 12.1065 12.0549 12.0958 12.0549 12.0009V11.1006C12.0549 11.0056 12.1243 10.995 12.183 10.9948H12.1985V10.9582C12.1231 10.9588 12.0283 10.965 11.9486 10.965C11.8709 10.965 11.7772 10.9588 11.7137 10.9582V10.9948H11.7296C11.7877 10.995 11.8574 11.0056 11.8577 11.1006V12.0009C11.8574 12.0958 11.7877 12.1065 11.7296 12.1065H11.7137V12.143C11.7768 12.1422 11.8693 12.1362 11.9473 12.1362C12.0267 12.1362 12.1213 12.1425 12.1985 12.143Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M12.8586 10.9238C13.2076 10.9238 13.4857 11.1509 13.4857 11.517C13.4857 11.9123 13.2155 12.175 12.8671 12.175C12.5199 12.175 12.2549 11.9275 12.2549 11.558C12.2549 11.2007 12.5183 10.9238 12.8586 10.9238ZM12.8834 12.0994C13.201 12.0994 13.2564 11.8053 13.2564 11.5547C13.2564 11.3035 13.1274 10.9995 12.8555 10.9995C12.5692 10.9995 12.484 11.2676 12.484 11.4977C12.484 11.8053 12.6183 12.0994 12.8834 12.0994Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M12.2476 11.5576C12.2482 11.1962 12.5147 10.9166 12.8585 10.916V10.931C12.5221 10.931 12.2618 11.2041 12.2614 11.5576C12.2621 11.923 12.5233 12.1668 12.8671 12.1669C13.212 12.1668 13.4783 11.9078 13.4787 11.5164C13.4784 11.1549 13.2047 10.9314 12.8585 10.931V10.916C13.2099 10.9164 13.492 11.1457 13.4926 11.5164C13.4923 11.9158 13.2189 12.1813 12.8671 12.1819C12.517 12.1813 12.2482 11.9313 12.2476 11.5576ZM12.4768 11.4974C12.4773 11.2661 12.5632 10.9915 12.8555 10.9915C13.1334 10.9921 13.263 11.3018 13.2635 11.5543C13.263 11.8049 13.2068 12.1061 12.8834 12.1061V12.0915C13.1946 12.0912 13.2487 11.8049 13.2491 11.5543C13.2491 11.3054 13.1215 11.0071 12.8555 11.0066C12.5747 11.0069 12.4917 11.2685 12.491 11.4974C12.4911 11.8035 12.6242 12.091 12.8834 12.0915V12.1061C12.6117 12.1058 12.4773 11.8067 12.4768 11.4974Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M14.5885 11.8101L14.5919 11.8067V11.1624C14.5919 11.0214 14.4983 11.0008 14.4492 11.0008H14.4136V10.9492C14.4903 10.9492 14.5658 10.956 14.6425 10.956C14.7098 10.956 14.7769 10.9492 14.844 10.9492V11.0008H14.8194C14.7508 11.0008 14.6736 11.0145 14.6736 11.219V12.001C14.6736 12.0612 14.6753 12.1213 14.6836 12.1746H14.6213L13.7783 11.188V11.8962C13.7783 12.0459 13.8062 12.0972 13.932 12.0972H13.9601V12.1488C13.8896 12.1488 13.8194 12.1421 13.749 12.1421C13.6752 12.1421 13.5999 12.1488 13.5262 12.1488V12.0972H13.5492C13.6624 12.0972 13.6965 12.0164 13.6965 11.8793V11.1552C13.6965 11.0591 13.6215 11.0008 13.5475 11.0008H13.5262V10.9492C13.5885 10.9492 13.6522 10.956 13.7146 10.956C13.7636 10.956 13.8108 10.9492 13.8601 10.9492L14.5885 11.8101Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M14.6837 12.1835L14.616 12.1811L13.7854 11.2092V11.8978C13.7873 12.0475 13.8089 12.0896 13.9318 12.0911H13.9671V12.1578H13.9601C13.8893 12.1578 13.819 12.1509 13.749 12.1509C13.6757 12.1509 13.6003 12.1578 13.5261 12.1578H13.5194V12.0911H13.5492C13.6571 12.0908 13.6882 12.0178 13.6895 11.8809V11.1569C13.6894 11.0653 13.6179 11.0099 13.5475 11.0099H13.5194V10.9434H13.5261C13.5889 10.9434 13.6527 10.9501 13.7145 10.9501C13.7631 10.9501 13.8101 10.9434 13.8656 10.946L14.5848 11.7962V11.1641C14.5842 11.0276 14.497 11.011 14.4493 11.0099H14.4062V10.9434H14.4137C14.4905 10.9434 14.5661 10.9501 14.6423 10.9501C14.7093 10.9501 14.7761 10.9434 14.8441 10.9434H14.851V11.0099H14.8194C14.7519 11.0117 14.6823 11.0182 14.6809 11.2207V12.0026C14.6809 12.0628 14.6822 12.1228 14.6902 12.175L14.6916 12.1835H14.6837ZM14.6214 12.1685H14.675C14.6681 12.1168 14.6665 12.0598 14.6665 12.0026V11.2207C14.6665 11.0141 14.7491 10.9953 14.8194 10.9948H14.8371V10.9582C14.7721 10.9588 14.7078 10.965 14.6423 10.965C14.5678 10.965 14.4946 10.9588 14.4205 10.9582V10.9948H14.4493C14.4998 10.9953 14.5987 11.0187 14.5987 11.1641L14.5969 11.8137L14.5938 11.8171L14.5885 11.8227L13.8602 10.9582C13.8117 10.9582 13.7641 10.965 13.7145 10.965C13.6542 10.965 13.5927 10.9588 13.5332 10.9582V10.9948H13.5475C13.6245 10.9953 13.7035 11.0562 13.7035 11.1569V11.8809C13.7035 12.0184 13.667 12.1062 13.5492 12.1067L13.5332 12.1065V12.143C13.6042 12.1425 13.6771 12.1362 13.749 12.1362C13.8173 12.1362 13.8851 12.1425 13.953 12.143V12.1067H13.9318C13.8034 12.1065 13.7712 12.0475 13.7712 11.8978V11.1704L14.6214 12.1685ZM14.5848 11.8083V11.8079L14.5835 11.8066L14.5848 11.8083Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M15.107 11.9032C15.091 11.9615 15.0712 12.0066 15.0712 12.0371C15.0712 12.0888 15.1402 12.0973 15.1938 12.0973H15.2121V12.1489C15.1465 12.1452 15.0794 12.1423 15.0139 12.1423C14.9549 12.1423 14.8961 12.1452 14.8374 12.1489V12.0973H14.8467C14.9109 12.0973 14.9651 12.0577 14.989 11.9855L15.2514 11.197C15.2726 11.1332 15.3022 11.0473 15.3116 10.9836C15.3642 10.9648 15.4295 10.9307 15.461 10.9098C15.4656 10.908 15.4689 10.9062 15.474 10.9062C15.4787 10.9062 15.4818 10.9063 15.4852 10.9116C15.4902 10.9253 15.4951 10.9408 15.5 10.9545L15.8012 11.8534C15.8207 11.9134 15.8404 11.977 15.8618 12.0288C15.8815 12.077 15.9158 12.0973 15.9697 12.0973H15.9799V12.1489C15.9061 12.1452 15.8323 12.1423 15.7537 12.1423C15.6737 12.1423 15.5917 12.1452 15.5081 12.1489V12.0973H15.5263C15.5637 12.0973 15.6279 12.0905 15.6279 12.0475C15.6279 12.0253 15.6132 11.9789 15.5949 11.9237L15.5311 11.7244H15.1596L15.107 11.9032ZM15.3464 11.1419H15.3431L15.1905 11.6283H15.497L15.3464 11.1419Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M15.979 12.1558C15.9052 12.1527 15.8318 12.1488 15.7537 12.1488C15.6738 12.1488 15.5918 12.1527 15.5084 12.1558L15.5012 12.1562V12.0894H15.5261C15.5641 12.0894 15.6205 12.0801 15.6205 12.047C15.621 12.0274 15.6062 11.9805 15.5878 11.9257L15.5257 11.7312H15.1644L15.1138 11.9049C15.0973 11.9638 15.078 12.0087 15.0782 12.0366C15.0782 12.0787 15.1396 12.0894 15.1937 12.0894H15.2187V12.1562L15.2113 12.1558C15.146 12.1527 15.0789 12.1488 15.0138 12.1488C14.9551 12.1488 14.8964 12.1527 14.8373 12.1558L14.8302 12.1562V12.0894H14.8466C14.9076 12.089 14.9587 12.0523 14.9826 11.9826L15.2444 11.1938C15.2654 11.1302 15.295 11.0447 15.3093 10.9762C15.3608 10.9575 15.4265 10.923 15.4583 10.9023C15.4625 10.9006 15.4671 10.8985 15.4738 10.8985C15.4781 10.8981 15.4866 10.8992 15.4917 10.9086C15.4966 10.9221 15.5015 10.9377 15.5068 10.9516L15.8078 11.8504C15.8275 11.9106 15.847 11.9741 15.8682 12.0253C15.8875 12.0708 15.9171 12.0889 15.9695 12.0894H15.9864V12.1562L15.979 12.1558ZM15.515 12.1406C15.596 12.1375 15.6756 12.1341 15.7537 12.1341C15.8298 12.1341 15.901 12.1375 15.9724 12.1405L15.9722 12.1045H15.9695C15.914 12.1046 15.8754 12.0817 15.855 12.0311C15.8334 11.9791 15.814 11.9153 15.7943 11.8553L15.4932 10.9563C15.4883 10.9425 15.4831 10.9272 15.4793 10.9153C15.4779 10.9133 15.4781 10.9133 15.4771 10.9133H15.4738C15.4703 10.9133 15.4685 10.9144 15.4646 10.9156C15.4326 10.9366 15.3671 10.9711 15.3188 10.9842C15.3086 11.0493 15.2789 11.135 15.2578 11.1988L14.9957 11.9875C14.9708 12.0622 14.9136 12.1046 14.8466 12.1045H14.8442V12.1405C14.9006 12.1375 14.9568 12.1341 15.0138 12.1341C15.0771 12.1341 15.1419 12.1375 15.2048 12.1405V12.1045H15.1937C15.1405 12.1037 15.0659 12.0978 15.0638 12.0366C15.0642 12.0026 15.0843 11.9588 15.1004 11.9006L15.1542 11.7167H15.5357L15.6015 11.9208C15.6195 11.9761 15.6344 12.0219 15.6344 12.047C15.6321 12.0996 15.5632 12.1035 15.5261 12.1045H15.515V12.1406ZM15.1806 11.6351L15.3378 11.1337H15.3463H15.3512L15.506 11.6351H15.1806ZM15.2004 11.6201H15.4867L15.3443 11.1599L15.2004 11.6201Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M16.3921 11.9803C16.3921 12.0494 16.4375 12.0697 16.4901 12.0769C16.5571 12.082 16.6308 12.082 16.7063 12.0732C16.775 12.0646 16.8338 12.0236 16.8632 11.9803C16.8892 11.9426 16.904 11.8944 16.914 11.8567H16.9614C16.9433 11.9546 16.9205 12.051 16.9008 12.1488C16.7571 12.1488 16.6126 12.1422 16.4688 12.1422C16.3246 12.1422 16.1807 12.1488 16.0367 12.1488V12.0972H16.0594C16.1185 12.0972 16.1825 12.0887 16.1825 11.9822V11.0989C16.1825 11.0094 16.1185 11.0008 16.0594 11.0008H16.0367V10.9492C16.1234 10.9492 16.2086 10.956 16.2952 10.956C16.3788 10.956 16.4605 10.9492 16.5442 10.9492V11.0008H16.5031C16.4409 11.0008 16.3921 11.0026 16.3921 11.0937V11.9803Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
            <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M16.9009 12.1578C16.7565 12.1578 16.6124 12.1509 16.4688 12.1509C16.3248 12.1509 16.1808 12.1578 16.0364 12.1578H16.0295V12.0914H16.0594C16.1186 12.0899 16.1748 12.0855 16.1755 11.9838V11.1003C16.1748 11.0166 16.1188 11.011 16.0594 11.0099H16.0295V10.9434H16.0364C16.1236 10.9434 16.2088 10.9501 16.2951 10.9501C16.3784 10.9501 16.46 10.9434 16.5442 10.9434H16.5508V11.0099H16.5031C16.4396 11.0116 16.4002 11.0086 16.3987 11.0953V11.9819C16.3992 12.0462 16.4393 12.0633 16.4904 12.071C16.5192 12.0731 16.5497 12.0742 16.5812 12.0742C16.6212 12.0742 16.6628 12.0723 16.7051 12.0676C16.7718 12.0593 16.8291 12.0188 16.8574 11.9778C16.8827 11.941 16.897 11.894 16.9069 11.8566L16.9083 11.8509H16.97L16.9685 11.8599C16.95 11.9582 16.9275 12.054 16.9076 12.152L16.9063 12.1578H16.9009ZM16.8949 12.143C16.9138 12.0496 16.9352 11.9583 16.9529 11.8657H16.9192C16.9091 11.9031 16.8945 11.9492 16.8689 11.9866C16.8382 12.0311 16.7776 12.0731 16.7066 12.0824C16.6639 12.0869 16.6213 12.0892 16.5812 12.0892C16.5495 12.0892 16.5189 12.0878 16.4891 12.0855C16.4359 12.0794 16.3844 12.0554 16.3844 11.9819V11.0953C16.3844 10.9998 16.442 10.9948 16.5031 10.9948H16.5368V10.9582C16.4562 10.9588 16.3766 10.9652 16.2951 10.9652C16.2105 10.9652 16.1276 10.9588 16.0438 10.9582V10.9948H16.0594C16.1178 10.9948 16.1892 11.0056 16.1892 11.1003V11.9838C16.1892 12.095 16.1181 12.1065 16.0594 12.1065H16.0438V12.143C16.1852 12.1426 16.3267 12.1362 16.4688 12.1362C16.6111 12.1362 16.7532 12.1426 16.8949 12.143Z" fill={isDark ? '#E6E6E6' : '#1A1919'} stroke="none" />
        </svg>
    );
};

const JcbIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M1.9043 0.125H18.0957C19.0806 0.125246 19.8747 0.907107 19.875 1.86621V12.1338C19.8747 13.0929 19.0806 13.8748 18.0957 13.875H1.9043C0.919406 13.8748 0.125251 13.0929 0.125 12.1338V1.86621C0.125252 0.907107 0.919406 0.125246 1.9043 0.125Z" fill={isDark ? '#333333' : '#f2f2f2'} stroke={isDark ? '#4C4C4C' : '#666666'} stroke-width="0.25" />
        <path d="M12.9456 8.07652H13.8664C13.8927 8.07652 13.9541 8.06734 13.9804 8.06734C14.1559 8.03063 14.3049 7.8654 14.3049 7.63592C14.3049 7.41561 14.1559 7.25039 13.9804 7.20449C13.9541 7.19531 13.9015 7.19531 13.8664 7.19531H12.9456V8.07652Z" fill="url(#paint0_linear_1508_3821)" stroke="none" />
        <path d="M13.7612 1.99023C12.8842 1.99023 12.165 2.73376 12.165 3.66086V5.39574H14.419C14.4716 5.39574 14.533 5.39574 14.5768 5.40492C15.0855 5.43246 15.4626 5.70784 15.4626 6.18516C15.4626 6.56151 15.2083 6.88279 14.7347 6.94704V6.9654C15.2522 7.00212 15.6468 7.30503 15.6468 7.77317C15.6468 8.27803 15.2083 8.60849 14.6295 8.60849H12.1562V12.0048H14.4979C15.3749 12.0048 16.0941 11.2613 16.0941 10.3342V1.99023H13.7612Z" fill="url(#paint1_linear_1508_3821)" stroke="none" />
        <path d="M14.1909 6.29451C14.1909 6.07421 14.0418 5.92734 13.8664 5.8998C13.8489 5.8998 13.805 5.89062 13.7787 5.89062H12.9456V6.6984H13.7787C13.805 6.6984 13.8577 6.6984 13.8664 6.68922C14.0418 6.66168 14.1909 6.51482 14.1909 6.29451Z" fill="url(#paint2_linear_1508_3821)" stroke="none" />
        <path d="M4.93821 1.99023C4.06118 1.99023 3.34202 2.73376 3.34202 3.66086V7.78235C3.78931 8.01184 4.25413 8.1587 4.71895 8.1587C5.27148 8.1587 5.56967 7.80989 5.56967 7.33257V5.38656H6.93783V7.32339C6.93783 8.07609 6.49055 8.6911 4.97329 8.6911C4.05241 8.6911 3.33325 8.47998 3.33325 8.47998V11.9956H5.67491C6.55194 11.9956 7.2711 11.2521 7.2711 10.325V1.99023H4.93821Z" fill="url(#paint3_linear_1508_3821)" stroke="none" />
        <path d="M9.34973 1.99023C8.4727 1.99023 7.75354 2.73376 7.75354 3.66086V5.84553C8.15697 5.48754 8.85859 5.25805 9.98996 5.31313C10.5951 5.34067 11.2441 5.51507 11.2441 5.51507V6.22188C10.9196 6.04747 10.5337 5.89142 10.0338 5.85471C9.17432 5.79045 8.65688 6.23106 8.65688 7.00212C8.65688 7.78235 9.17432 8.22296 10.0338 8.14953C10.5337 8.11281 10.9196 7.94758 11.2441 7.78235V8.48916C11.2441 8.48916 10.6039 8.66356 9.98996 8.6911C8.85859 8.74618 8.15697 8.5167 7.75354 8.1587V12.014H10.0952C10.9722 12.014 11.6914 11.2705 11.6914 10.3434V1.99023H9.34973Z" fill="url(#paint4_linear_1508_3821)" stroke="none" />
        <defs>
            <linearGradient id="paint0_linear_1508_3821" x1="12.1635" y1="7.63701" x2="16.1047" y2="7.63701" gradientUnits="userSpaceOnUse">
                <stop stop-color="#007940" />
                <stop offset="0.2285" stop-color="#00873F" />
                <stop offset="0.7433" stop-color="#40A737" />
                <stop offset="1" stop-color="#5CB531" />
            </linearGradient>
            <linearGradient id="paint1_linear_1508_3821" x1="12.1634" y1="6.99352" x2="16.1049" y2="6.99352" gradientUnits="userSpaceOnUse">
                <stop stop-color="#007940" />
                <stop offset="0.2285" stop-color="#00873F" />
                <stop offset="0.7433" stop-color="#40A737" />
                <stop offset="1" stop-color="#5CB531" />
            </linearGradient>
            <linearGradient id="paint2_linear_1508_3821" x1="12.1634" y1="6.29336" x2="16.1047" y2="6.29336" gradientUnits="userSpaceOnUse">
                <stop stop-color="#007940" />
                <stop offset="0.2285" stop-color="#00873F" />
                <stop offset="0.7433" stop-color="#40A737" />
                <stop offset="1" stop-color="#5CB531" />
            </linearGradient>
            <linearGradient id="paint3_linear_1508_3821" x1="3.34017" y1="6.99352" x2="7.3423" y2="6.99352" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1F286F" />
                <stop offset="0.4751" stop-color="#004E94" />
                <stop offset="0.8261" stop-color="#0066B1" />
                <stop offset="1" stop-color="#006FBC" />
            </linearGradient>
            <linearGradient id="paint4_linear_1508_3821" x1="7.73086" y1="6.99352" x2="11.6179" y2="6.99352" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6C2C2F" />
                <stop offset="0.1735" stop-color="#882730" />
                <stop offset="0.5731" stop-color="#BE1833" />
                <stop offset="0.8585" stop-color="#DC0436" />
                <stop offset="1" stop-color="#E60039" />
            </linearGradient>
        </defs>
    </svg>)
}

const MaestroIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M1.9043 0.125H18.0957C19.0806 0.125246 19.8747 0.907107 19.875 1.86621V12.1338C19.8747 13.0929 19.0806 13.8748 18.0957 13.875H1.9043C0.919406 13.8748 0.125251 13.0929 0.125 12.1338V1.86621C0.125252 0.907107 0.919406 0.125246 1.9043 0.125Z" fill={isDark ? '#333333' : '#f2f2f2'} stroke={isDark ? '#4C4C4C' : '#666666'} stroke-width="0.25" />
        <path d="M11.9531 10.6698H8.04736V3.33203H11.9531V10.6698Z" fill="#7375CF" stroke="none" />
        <path d="M8.29508 7.00065C8.29508 5.51214 8.96173 4.18622 9.99991 3.33176C9.24074 2.70693 8.28258 2.33398 7.2413 2.33398C4.77615 2.33398 2.77783 4.4233 2.77783 7.00065C2.77783 9.57801 4.77615 11.6673 7.2413 11.6673C8.28258 11.6673 9.24074 11.2944 9.99991 10.6695C8.96173 9.81509 8.29508 8.48916 8.29508 7.00065Z" fill="#EB001B" stroke="none" />
        <path d="M17.2223 7.00065C17.2223 9.57801 15.224 11.6673 12.7588 11.6673C11.7175 11.6673 10.7594 11.2944 9.99988 10.6695C11.0383 9.81509 11.705 8.48916 11.705 7.00065C11.705 5.51214 11.0383 4.18622 9.99988 3.33176C10.7594 2.70693 11.7175 2.33398 12.7588 2.33398C15.224 2.33398 17.2223 4.4233 17.2223 7.00065Z" fill="#00A2E5" stroke="none" />
    </svg>)
}

const MastercardIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M1.9043 0.125H18.0957C19.0806 0.125246 19.8747 0.907107 19.875 1.86621V12.1338C19.8747 13.0929 19.0806 13.8748 18.0957 13.875H1.9043C0.919406 13.8748 0.125251 13.0929 0.125 12.1338V1.86621C0.125252 0.907107 0.919406 0.125246 1.9043 0.125Z" fill={isDark ? '#333333' : '#f2f2f2'} stroke={isDark ? '#4C4C4C' : '#666666'} stroke-width="0.25" />
        <path d="M11.9531 10.6698H8.04736V3.33203H11.9531V10.6698Z" fill="#FF5F00" stroke="none" />
        <path d="M8.29508 7.00065C8.29508 5.51214 8.96173 4.18622 9.99991 3.33176C9.24074 2.70693 8.28258 2.33398 7.2413 2.33398C4.77615 2.33398 2.77783 4.4233 2.77783 7.00065C2.77783 9.57801 4.77615 11.6673 7.2413 11.6673C8.28258 11.6673 9.24074 11.2944 9.99991 10.6695C8.96173 9.81509 8.29508 8.48916 8.29508 7.00065Z" fill="#EB001B" stroke="none" />
        <path d="M17.2223 7.00065C17.2223 9.57801 15.224 11.6673 12.7588 11.6673C11.7175 11.6673 10.7594 11.2944 9.99988 10.6695C11.0383 9.81509 11.705 8.48916 11.705 7.00065C11.705 5.51214 11.0383 4.18622 9.99988 3.33176C10.7594 2.70693 11.7175 2.33398 12.7588 2.33398C15.224 2.33398 17.2223 4.4233 17.2223 7.00065Z" fill="#F79E1B" stroke="none" />
    </svg>)
}

const UnionPayIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M1.9043 0.125H18.0957C19.0806 0.125246 19.8747 0.907107 19.875 1.86621V12.1338C19.8747 13.0929 19.0806 13.8748 18.0957 13.875H1.9043C0.919406 13.8748 0.125251 13.0929 0.125 12.1338V1.86621C0.125252 0.907107 0.919406 0.125246 1.9043 0.125Z" fill={isDark ? '#333333' : '#f2f2f2'} stroke={isDark ? '#4C4C4C' : '#666666'} stroke-width="0.25" />
        <g clip-path="url(#clip0_1508_3829)">
            <path stroke="none" d="M5.66899 2.55078H9.21225C9.70686 2.55078 10.0145 2.95393 9.8991 3.45018L8.24946 10.5327C8.13304 11.0272 7.63783 11.4307 7.14288 11.4307H3.59997C3.10606 11.4307 2.79774 11.0272 2.91312 10.5327L4.56345 3.45018C4.67883 2.95393 5.17378 2.55078 5.66899 2.55078Z" fill="#E21836" />
            <path stroke="none" d="M8.91743 2.55078H12.9921C13.4866 2.55078 13.2636 2.95393 13.1473 3.45018L11.4979 10.5327C11.3822 11.0272 11.4183 11.4307 10.9227 11.4307H6.84806C6.35251 11.4307 6.04583 11.0272 6.16225 10.5327L7.81154 3.45018C7.92865 2.95393 8.42256 2.55078 8.91743 2.55078Z" fill="#00447C" />
            <path stroke="none" d="M12.8305 2.55078H16.3737C16.869 2.55078 17.1767 2.95393 17.0603 3.45018L15.4109 10.5327C15.2945 11.0272 14.799 11.4307 14.3038 11.4307H10.7621C10.2666 11.4307 9.95921 11.0272 10.0753 10.5327L11.7249 3.45018C11.8403 2.95393 12.3349 2.55078 12.8305 2.55078Z" fill="#007B84" />
            <path stroke="none" d="M6.59436 4.8211C6.22999 4.82481 6.12238 4.8211 6.08801 4.81298C6.0748 4.87577 5.82892 6.00999 5.82823 6.01094C5.77529 6.2404 5.73677 6.40398 5.60593 6.5096C5.53165 6.57101 5.44494 6.60063 5.34442 6.60063C5.18283 6.60063 5.08869 6.5204 5.07289 6.36822L5.06987 6.31597C5.06987 6.31597 5.11909 6.0086 5.11909 6.00688C5.11909 6.00688 5.37715 4.97327 5.42335 4.83664C5.42577 4.82887 5.42646 4.82481 5.42707 4.8211C4.92477 4.8255 4.83573 4.8211 4.8296 4.81298C4.82623 4.82412 4.8138 4.8882 4.8138 4.8882L4.5503 6.05317L4.52767 6.15197L4.48389 6.47514C4.48389 6.57101 4.50271 6.64925 4.5402 6.71541C4.66024 6.92518 5.00267 6.95662 5.19639 6.95662C5.44598 6.95662 5.68011 6.90359 5.83833 6.80678C6.11297 6.6445 6.18483 6.39085 6.24891 6.16544L6.27862 6.0498C6.27862 6.0498 6.54444 4.9763 6.58961 4.83664C6.59134 4.82887 6.59203 4.82481 6.59436 4.8211ZM7.49883 5.68711C7.43475 5.68711 7.31764 5.70265 7.21244 5.75421C7.17427 5.77381 7.13817 5.79644 7.10008 5.81898L7.13446 5.69488L7.11563 5.67398C6.89255 5.71915 6.84263 5.72519 6.63657 5.75421L6.6193 5.7657C6.59537 5.96407 6.57413 6.11322 6.48543 6.50316C6.45166 6.64687 6.4166 6.79196 6.38145 6.93532L6.39095 6.95355C6.60211 6.94241 6.66619 6.94241 6.84972 6.94543L6.86457 6.92928C6.88789 6.80984 6.89091 6.78185 6.94256 6.53995C6.96682 6.42526 7.01743 6.17325 7.04239 6.08352C7.08825 6.06227 7.13351 6.04137 7.17669 6.04137C7.27955 6.04137 7.26703 6.1311 7.26305 6.16686C7.25865 6.22688 7.22117 6.42293 7.18274 6.59125L7.15708 6.6999C7.13921 6.78013 7.1196 6.85811 7.10173 6.93766L7.1095 6.95355C7.31764 6.94241 7.38111 6.94241 7.55885 6.94543L7.57975 6.92928C7.61188 6.74273 7.62129 6.69281 7.67829 6.4212L7.70696 6.2964C7.76267 6.05217 7.79065 5.92832 7.74851 5.82745C7.70394 5.7144 7.59702 5.68711 7.49883 5.68711ZM8.50922 5.94282C8.39858 5.96407 8.32803 5.97823 8.2579 5.98738C8.18837 5.99852 8.12058 6.00863 8.01366 6.02348L8.0052 6.03117L7.99742 6.0373C7.98628 6.11693 7.97851 6.18576 7.96374 6.26669C7.95122 6.35037 7.93196 6.44546 7.90061 6.58209C7.87634 6.68667 7.86382 6.72312 7.85 6.75991C7.83653 6.7967 7.82167 6.83246 7.79438 6.93531L7.80077 6.94481L7.80613 6.95354C7.90605 6.94879 7.97143 6.94542 8.03862 6.94481C8.10572 6.9424 8.17525 6.94481 8.28286 6.94542L8.29227 6.93773L8.30237 6.92927C8.31792 6.83651 8.32025 6.81156 8.32975 6.7663C8.33917 6.71776 8.3554 6.65057 8.39522 6.47111C8.41404 6.38682 8.43503 6.30279 8.45455 6.21677C8.47484 6.13109 8.49609 6.04672 8.5163 5.96242L8.51328 5.95223L8.50922 5.94282ZM8.51157 5.59804C8.41105 5.53871 8.2346 5.55753 8.11585 5.63949C7.99745 5.71981 7.98398 5.83381 8.08416 5.89392C8.18296 5.95161 8.36009 5.93443 8.47781 5.85178C8.59595 5.76973 8.61072 5.65677 8.51157 5.59804ZM9.11953 6.97213C9.32292 6.97213 9.5314 6.91608 9.68833 6.74974C9.80906 6.61484 9.86442 6.41413 9.8836 6.33148C9.94604 6.05754 9.89741 5.92963 9.83635 5.85173C9.74360 5.73298 9.57968 5.6949 9.40963 5.6949C9.30738 5.6949 9.06383 5.705 8.87357 5.8804C8.73694 6.00693 8.67381 6.17862 8.63572 6.34323C8.59729 6.51095 8.55307 6.81288 8.83073 6.92524C8.91641 6.96203 9.03991 6.97213 9.11953 6.97213ZM9.10364 6.35575C9.15054 6.14831 9.2059 5.9742 9.34719 5.9742C9.45791 5.9742 9.46594 6.10374 9.41671 6.31188C9.40790 6.35808 9.36748 6.52986 9.31282 6.60301C9.27464 6.65699 9.22947 6.68972 9.17956 6.68972C9.16470 6.68972 9.07635 6.68972 9.07497 6.55853C9.07428 6.49376 9.08749 6.42761 9.10364 6.35575ZM10.392 6.94545L10.4079 6.9293C10.4305 6.80986 10.4342 6.78179 10.4841 6.53998C10.509 6.42528 10.5607 6.17327 10.585 6.08354C10.6309 6.06221 10.6754 6.04131 10.7199 6.04131C10.8221 6.04131 10.8097 6.13104 10.8056 6.1668C10.8019 6.22691 10.7644 6.42287 10.7253 6.59119L10.701 6.69983C10.6825 6.78015 10.6623 6.85805 10.6444 6.93768L10.6521 6.95357C10.861 6.94243 10.922 6.94243 11.1008 6.94545L11.1224 6.9293C11.1538 6.74267 11.1622 6.69275 11.2209 6.42122L11.2489 6.29634C11.3049 6.05211 11.3332 5.92835 11.2918 5.82747C11.2459 5.71442 11.1383 5.68713 11.0415 5.68713C10.9773 5.68713 10.8596 5.70259 10.755 5.75424C10.7176 5.77384 10.6801 5.79638 10.6433 5.81901L10.6754 5.6949L10.6582 5.67392C10.4352 5.71917 10.3842 5.72522 10.1784 5.75424L10.1626 5.76572C10.1377 5.9641 10.1174 6.11316 10.0287 6.50318C9.99492 6.64689 9.95985 6.79199 9.92479 6.93535L9.9342 6.95357C10.1457 6.94243 10.2088 6.94243 10.392 6.94545ZM11.9263 6.95353C11.9394 6.88945 12.0174 6.50962 12.0181 6.50962C12.0181 6.50962 12.0845 6.23092 12.0886 6.22082C12.0886 6.22082 12.1095 6.1918 12.1304 6.18031H12.1611C12.4512 6.18031 12.7788 6.18031 13.0356 5.99143C13.2103 5.86189 13.3297 5.67059 13.383 5.4381C13.3968 5.3811 13.407 5.3133 13.407 5.24551C13.407 5.15647 13.3892 5.06838 13.3375 4.99954C13.2066 4.81637 12.9458 4.813 12.6449 4.81162C12.6439 4.81162 12.4965 4.813 12.4965 4.813C12.1112 4.81775 11.9567 4.81637 11.8932 4.80859C11.8879 4.83666 11.8778 4.88658 11.8778 4.88658C11.8778 4.88658 11.7398 5.52619 11.7398 5.52723C11.7398 5.52723 11.4095 6.88711 11.394 6.9512C11.7304 6.94714 11.8683 6.94714 11.9263 6.95353ZM12.182 5.81732C12.182 5.81732 12.3288 5.17901 12.3281 5.18143L12.3328 5.14869L12.3349 5.12374L12.3935 5.12978C12.3935 5.12978 12.6962 5.15578 12.7032 5.15647C12.8227 5.20267 12.8719 5.32177 12.8375 5.47722C12.8062 5.61929 12.714 5.73873 12.5956 5.79642C12.4981 5.84531 12.3787 5.84937 12.2556 5.84937H12.176L12.182 5.81732ZM13.0956 6.36758C13.0569 6.53288 13.0123 6.8348 13.2886 6.94241C13.3767 6.97990 13.4556 6.99104 13.5358 6.98698C13.6206 6.98240 13.6991 6.93991 13.7718 6.87876C13.7652 6.9039 13.7587 6.92903 13.7521 6.95425L13.7646 6.9704C13.9633 6.96202 14.025 6.96202 14.2403 6.96366L14.2598 6.9488C14.2913 6.76399 14.3209 6.58452 14.4026 6.23095C14.4424 6.06159 14.4821 5.89387 14.523 5.7252L14.5166 5.70663C14.2943 5.74783 14.2349 5.75664 14.021 5.78695L14.0048 5.80016C14.0026 5.81735 14.0004 5.83385 13.9983 5.85034C13.9651 5.79662 13.9169 5.75076 13.8425 5.72218C13.7474 5.68478 13.5241 5.73297 13.3321 5.90777C13.1972 6.03257 13.1324 6.20357 13.0956 6.36758ZM13.5625 6.37768C13.6101 6.17395 13.6648 6.00157 13.8064 6.00157C13.896 6.00157 13.9431 6.08422 13.9335 6.22516C13.9259 6.26031 13.9177 6.29736 13.908 6.33925C13.8938 6.39979 13.8784 6.45981 13.8635 6.51992C13.8483 6.56103 13.8306 6.59981 13.8112 6.62563C13.7747 6.67728 13.688 6.70932 13.6381 6.70932C13.6239 6.70932 13.5365 6.70932 13.5335 6.58046C13.5328 6.51629 13.546 6.45023 13.5625 6.37768ZM16.0006 5.70498L15.9834 5.68538C15.7635 5.72994 15.7236 5.73702 15.5216 5.76431L15.5067 5.77917C15.506 5.78159 15.5054 5.7853 15.5044 5.78867L15.5037 5.7853C15.3532 6.1324 15.3576 6.05752 15.2352 6.33078C15.2345 6.31834 15.2345 6.31057 15.2338 6.29735L15.2031 5.70498L15.1839 5.68538C14.9535 5.72994 14.948 5.73702 14.7352 5.76431L14.7186 5.77917C14.7163 5.78625 14.7163 5.79402 14.7149 5.80249L14.7163 5.80551C14.7429 5.94145 14.7365 5.91113 14.7632 6.12566C14.7756 6.23094 14.7922 6.33682 14.8046 6.4408C14.8256 6.61483 14.8374 6.7005 14.863 6.96607C14.7193 7.20322 14.6853 7.29296 14.5469 7.50109L14.5479 7.50317L14.4505 7.65724C14.4393 7.67348 14.4292 7.68462 14.4151 7.68937C14.3995 7.69705 14.3793 7.69844 14.3512 7.69844H14.2973L14.217 7.9653L14.4923 7.97005C14.6539 7.96936 14.7554 7.89379 14.8101 7.79223L14.9832 7.49565H14.9804L14.9986 7.47475C15.115 7.22412 16.0006 5.70498 16.0006 5.70498ZM13.0956 9.20985H12.9789L13.411 7.78044H13.5544L13.5999 7.63319L13.6043 7.79693C13.599 7.89815 13.6786 7.98788 13.8878 7.97303H14.1297L14.2129 7.69779H14.1219C14.0696 7.69779 14.0453 7.68457 14.0483 7.65625L14.0439 7.48965H13.5959V7.49051C13.4511 7.49354 13.0186 7.50442 12.931 7.52774C12.825 7.55503 12.7134 7.63535 12.7134 7.63535L12.7573 7.48792H12.3382L12.2509 7.78044L11.8129 9.2317H11.728L11.6446 9.50495H12.4792L12.4513 9.59607H12.8625L12.8898 9.50495H13.0052L13.0956 9.20985ZM12.7532 8.07088C12.6861 8.08945 12.5612 8.14576 12.5612 8.14576L12.6723 7.78044H13.0052L12.9249 8.04661C12.9249 8.04661 12.822 8.05266 12.7532 8.07088ZM12.7596 8.59278C12.7596 8.59278 12.655 8.6059 12.5862 8.62145C12.5184 8.64201 12.3912 8.70678 12.3912 8.70678L12.5059 8.3266H12.8406L12.7596 8.59278ZM12.573 9.21322H12.2391L12.3359 8.89237H12.6688L12.573 9.21322ZM13.3773 8.3266H13.8587L13.7895 8.55063H13.3017L13.2285 8.79556H13.6553L13.3321 9.25061C13.3095 9.28403 13.2892 9.29587 13.2667 9.30528C13.2441 9.31677 13.2143 9.33024 13.18 9.33024H13.0616L12.9802 9.59849H13.2899C13.4509 9.59849 13.546 9.52525 13.6162 9.42913L13.8378 9.12582L13.8854 9.43379C13.8955 9.49148 13.937 9.52525 13.965 9.53838C13.996 9.55392 14.0281 9.58061 14.0733 9.58458C14.1219 9.58665 14.1569 9.58829 14.1802 9.58829H14.3324L14.4238 9.28809H14.3638C14.3293 9.28809 14.27 9.28231 14.2599 9.27151C14.2498 9.25838 14.2498 9.23817 14.2443 9.20743L14.196 8.89876H13.9984L14.0851 8.79556H14.5719L14.6468 8.55063H14.196L14.2663 8.3266H14.7156L14.7989 8.05033H13.4593L13.3773 8.3266ZM9.31145 9.2756L9.42381 8.90181H9.8856L9.96998 8.62381H9.50776L9.57832 8.39373H10.03L10.1137 8.12454H8.98353L8.90157 8.39373H9.15833L9.08984 8.62381H8.83239L8.74706 8.90656H9.00374L8.85398 9.40108C8.83377 9.46655 8.86348 9.49151 8.88231 9.52191C8.90157 9.55153 8.92109 9.57113 8.96496 9.58228C9.01021 9.59238 9.04122 9.59842 9.08336 9.59842H9.60397L9.69672 9.29045L9.46596 9.32215C9.42139 9.32215 9.29798 9.31679 9.31145 9.2756ZM9.36442 7.48624L9.2474 7.69774C9.22235 7.74395 9.19981 7.77262 9.17951 7.78584C9.16164 7.79698 9.12623 7.80164 9.07493 7.80164H9.01387L8.93225 8.07222H9.13504C9.23254 8.07222 9.30742 8.03646 9.34317 8.01859C9.38161 7.99803 9.39171 8.00978 9.42142 7.9811L9.4899 7.92177H10.1231L10.2072 7.64005H9.74364L9.82457 7.48624H9.36442ZM10.2993 9.28103C10.2885 9.26548 10.2962 9.23811 10.3127 9.18111L10.4858 8.60825H11.1015C11.1912 8.60696 11.256 8.60592 11.2981 8.6029C11.3434 8.59815 11.3926 8.582 11.4463 8.55298C11.5016 8.52258 11.5299 8.49054 11.5539 8.45375C11.5806 8.41704 11.6234 8.33673 11.6602 8.21288L11.8777 7.48794L11.2388 7.49165C11.2388 7.49165 11.0421 7.52067 10.9554 7.55271C10.868 7.58847 10.7432 7.6883 10.7432 7.6883L10.8009 7.48958H10.4062L9.85362 9.32214C9.83401 9.3933 9.82089 9.44495 9.81786 9.47595C9.81683 9.50938 9.86001 9.54245 9.88799 9.56741C9.92107 9.59237 9.96995 9.58831 10.0168 9.59237C10.0662 9.59609 10.1363 9.59842 10.2331 9.59842H10.5364L10.6295 9.28405L10.358 9.3097C10.329 9.3097 10.308 9.29416 10.2993 9.28103ZM10.5975 8.22134H11.2442L11.2031 8.3502C11.1973 8.35322 11.1835 8.34381 11.1176 8.35158H10.5577L10.5975 8.22134ZM10.727 7.78918H11.3792L11.3323 7.94437C11.3323 7.94437 11.0249 7.94135 10.9757 7.95042C10.7591 7.9879 10.6325 8.10363 10.6325 8.10363L10.727 7.78918ZM11.2175 8.7817C11.2122 8.80096 11.2037 8.81270 11.1919 8.82151C11.1788 8.82998 11.1575 8.833 11.1258 8.833H11.0337L11.0391 8.67608H10.6558L10.6403 9.44325C10.6397 9.49861 10.645 9.53065 10.6855 9.5563C10.726 9.58834 10.8508 9.5924 11.0188 9.5924H11.259L11.3457 9.30524L11.1366 9.31672L11.0671 9.32078C11.0576 9.31672 11.0485 9.31301 11.0384 9.30291C11.0296 9.29418 11.0147 9.29954 11.0172 9.24418L11.0188 9.04753L11.2381 9.03846C11.3565 9.03846 11.4071 8.99994 11.4503 8.96324C11.4915 8.92809 11.505 8.88767 11.5205 8.833L11.5573 8.65889H11.256L11.2175 8.7817Z" fill="#FEFEFE" />
        </g>
        <defs>
            <clipPath id="clip0_1508_3829">
                <rect width="14.2222" height="8.88889" fill="white" transform="translate(2.88892 2.55078)" />
            </clipPath>
        </defs>
    </svg>)
}



const DiscoverIcon = ({ width = 20, height = 16 }) => {
    const isDark = useIsDark();
    return isDark
        ? <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width={20}
            height={14}
            fill="none"
        >
            <path stroke="none"
                fill="url(#a)"
                d="M20 12.133C20 13.164 19.147 14 18.095 14H1.905C.853 14 0 13.164 0 12.133V1.867C0 .836.853 0 1.905 0h16.19C19.147 0 20 .836 20 1.867v10.266Z"
            />
            <path stroke="none"
                fill="url(#b)"
                d="M20 12.134c0 1.03-.853 1.866-1.905 1.866H8.061c2.981-.693 9.872-2.699 11.94-6.81v4.944Z"
            />
            <mask
                id="c"
                width={18}
                height={7}
                x={1}
                y={4}
                maskUnits="userSpaceOnUse"
                style={{
                    maskType: "luminance",
                }}
            >
                <path stroke="none" fill="#fff" d="M1.09 10.13H18.89V4.959H1.09v5.173Z" />
            </mask>
            <g fill="#F2F2F2" mask="url(#c)">
                <path stroke="none" d="M2.558 7.312c-.173.167-.397.24-.751.24h-.148V5.558h.148c.354 0 .57.068.75.244.19.18.305.462.305.75 0 .29-.115.58-.304.76Zm-.641-2.265H1.11v3.016h.801c.426 0 .734-.108 1.004-.349.321-.284.51-.713.51-1.157 0-.89-.62-1.51-1.51-1.51ZM3.68 8.063h.548V5.046H3.68v3.016ZM5.57 6.204c-.33-.13-.426-.217-.426-.38 0-.19.172-.334.409-.334.164 0 .3.072.442.244l.287-.403a1.185 1.185 0 0 0-.826-.334c-.498 0-.878.37-.878.864 0 .415.177.628.692.827.215.081.324.135.38.172.11.076.164.185.164.312a.414.414 0 0 1-.426.425c-.262 0-.472-.14-.599-.402l-.354.366c.253.397.556.574.974.574.57 0 .97-.407.97-.99 0-.48-.185-.696-.81-.941ZM6.552 6.557c0 .887.65 1.574 1.485 1.574.236 0 .438-.05.688-.176v-.692c-.22.235-.414.33-.663.33-.552 0-.944-.43-.944-1.04 0-.58.404-1.036.919-1.036.262 0 .46.1.688.34v-.693a1.327 1.327 0 0 0-.675-.185c-.832 0-1.498.701-1.498 1.578ZM13.076 7.071l-.75-2.025h-.6l1.194 3.093h.295l1.216-3.093h-.595l-.76 2.025ZM14.679 8.063h1.556v-.511h-1.008v-.814h.97v-.51h-.97v-.67h1.008v-.511h-1.556v3.016ZM17.307 6.435h-.16v-.913h.168c.342 0 .528.153.528.447 0 .303-.186.466-.536.466Zm1.1-.498c0-.564-.362-.89-.995-.89h-.814v3.016h.548V6.85h.072l.76 1.212h.674l-.885-1.27c.413-.091.64-.394.64-.856ZM18.654 5.197h-.01v-.07h.01c.03 0 .045.012.045.034 0 .024-.016.036-.045.036Zm.104-.037c0-.052-.034-.081-.094-.081h-.08v.265h.06V5.24l.069.103h.072l-.081-.11c.034-.01.054-.037.054-.074Z" />
                <path stroke="none" d="M18.675 5.4c-.094 0-.172-.084-.172-.19 0-.105.077-.19.172-.19.094 0 .171.087.171.19 0 .105-.077.19-.17.19Zm.001-.42c-.12 0-.215.102-.215.23 0 .129.096.231.215.231.117 0 .213-.104.213-.23 0-.127-.096-.232-.213-.232Z" />
            </g>
            <mask
                id="d"
                width={4}
                height={5}
                x={8}
                y={4}
                maskUnits="userSpaceOnUse"
                style={{
                    maskType: "luminance",
                }}
            >
                <path stroke="none"
                    fill="#fff"
                    d="M8.904 6.564c0-.886.67-1.604 1.496-1.604.827 0 1.497.718 1.497 1.603v.001c0 .886-.67 1.604-1.497 1.604-.826 0-1.496-.718-1.496-1.604Z"
                />
            </mask>
            <g mask="url(#d)">
                <path stroke="none" fill="url(#e)" d="M8.867 4.928h3.065v3.274H8.867z" />
            </g>
            <defs>
                <linearGradient
                    id="a"
                    x1={20}
                    x2={0}
                    y1={7}
                    y2={7}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#444A50" />
                    <stop offset={1} stopColor="#282A2F" />
                </linearGradient>
                <linearGradient
                    id="b"
                    x1={0.003}
                    x2={20}
                    y1={7}
                    y2={7}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#8C261C" />
                    <stop offset={0.144} stopColor="#F13213" />
                    <stop offset={1} stopColor="#F59314" />
                </linearGradient>
                <pattern
                    id="e"
                    width={1}
                    height={1}
                    patternContentUnits="objectBoundingBox"
                >
                    <use xlinkHref="#f" transform="scale(.00794)" />
                </pattern>
                <image
                    xlinkHref="data:image/png;base64,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"
                    id="f"
                    width={126}
                    height={126}
                    preserveAspectRatio="none"
                />
            </defs>
        </svg>
        :
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width={20}
            height={14}
            fill="none"
        >
            <path stroke="none"
                fill="url(#a)"
                d="M20 12.133C20 13.164 19.147 14 18.095 14H1.905C.853 14 0 13.164 0 12.133V1.867C0 .836.853 0 1.905 0h16.19C19.147 0 20 .836 20 1.867v10.266Z"
            />
            <path stroke="none"
                fill="url(#b)"
                d="M20 12.133c0 1.03-.853 1.866-1.905 1.866H8.061c2.982-.693 9.873-2.7 11.94-6.812v4.946Z"
            />
            <mask
                id="c"
                width={18}
                height={7}
                x={1}
                y={4}
                maskUnits="userSpaceOnUse"
                style={{
                    maskType: "luminance",
                }}
            >
                <path stroke="none" fill="#fff" d="M1.09 10.13H18.89V4.959H1.09v5.173Z" />
            </mask>
            <g fill="#201D1C" mask="url(#c)">
                <path stroke="none" d="M2.558 7.312c-.173.167-.397.24-.751.24h-.148V5.558h.148c.354 0 .57.068.75.244.19.18.305.462.305.75 0 .29-.115.58-.304.76Zm-.641-2.265H1.11v3.016h.801c.426 0 .734-.108 1.004-.349.321-.284.51-.713.51-1.157 0-.89-.62-1.51-1.51-1.51ZM3.68 8.063h.548V5.046H3.68v3.016ZM5.57 6.204c-.33-.13-.426-.217-.426-.38 0-.19.172-.334.409-.334.164 0 .3.072.442.244l.287-.403a1.185 1.185 0 0 0-.826-.334c-.498 0-.878.37-.878.864 0 .415.177.628.692.827.215.081.324.135.38.172.11.076.164.185.164.312a.414.414 0 0 1-.426.425c-.262 0-.472-.14-.599-.402l-.354.366c.253.397.556.574.974.574.57 0 .97-.407.97-.99 0-.48-.185-.696-.81-.941ZM6.552 6.557c0 .887.65 1.574 1.485 1.574.236 0 .438-.05.688-.176v-.692c-.22.235-.414.33-.663.33-.552 0-.944-.43-.944-1.04 0-.58.404-1.036.919-1.036.262 0 .46.1.688.34v-.693a1.327 1.327 0 0 0-.675-.185c-.831 0-1.498.701-1.498 1.578ZM13.076 7.071l-.75-2.025h-.6l1.194 3.093h.295l1.216-3.093h-.595l-.76 2.025ZM14.679 8.063h1.556v-.511h-1.008v-.814h.97v-.51h-.97v-.67h1.008v-.511h-1.556v3.016ZM17.307 6.435h-.16v-.913h.168c.342 0 .528.153.528.447 0 .303-.186.466-.536.466Zm1.1-.498c0-.564-.362-.89-.995-.89h-.814v3.016h.548V6.85h.072l.76 1.212h.674l-.885-1.27c.413-.091.64-.394.64-.856ZM18.654 5.197h-.01v-.07h.01c.03 0 .045.012.045.034 0 .024-.016.036-.045.036Zm.104-.037c0-.052-.034-.081-.094-.081h-.08v.265h.06V5.24l.07.103h.071l-.081-.11c.035-.01.054-.037.054-.074Z" />
                <path stroke="none" d="M18.675 5.4c-.094 0-.171-.084-.171-.19 0-.105.076-.19.171-.19.094 0 .171.087.171.19 0 .105-.077.19-.17.19Zm.001-.42c-.12 0-.215.102-.215.23 0 .129.096.231.215.231.117 0 .213-.104.213-.23 0-.127-.096-.232-.213-.232Z" />
            </g>
            <mask
                id="d"
                width={4}
                height={5}
                x={8}
                y={4}
                maskUnits="userSpaceOnUse"
                style={{
                    maskType: "luminance",
                }}
            >
                <path stroke="none"
                    fill="#fff"
                    d="M8.904 6.564c0-.886.67-1.604 1.496-1.604.827 0 1.497.718 1.497 1.603v.001c0 .886-.67 1.604-1.497 1.604-.826 0-1.496-.718-1.496-1.604Z"
                />
            </mask>
            <g mask="url(#d)">
                <path stroke="none" fill="url(#e)" d="M8.868 4.928h3.065v3.274H8.868z" />
            </g>
            <defs>
                <linearGradient
                    id="a"
                    x1={20}
                    x2={0}
                    y1={7}
                    y2={7}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#CACED2" />
                    <stop offset={1} stopColor="#ECEDEF" />
                </linearGradient>
                <linearGradient
                    id="b"
                    x1={0.003}
                    x2={20}
                    y1={6.998}
                    y2={6.998}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#8C261C" />
                    <stop offset={0.144} stopColor="#F13213" />
                    <stop offset={1} stopColor="#F59314" />
                </linearGradient>
                <pattern
                    id="e"
                    width={1}
                    height={1}
                    patternContentUnits="objectBoundingBox"
                >
                    <use xlinkHref="#f" transform="scale(.00794)" />
                </pattern>
                <image
                    xlinkHref="data:image/png;base64,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"
                    id="f"
                    width={126}
                    height={126}
                    preserveAspectRatio="none"
                />
            </defs>
        </svg>
}

// ==================== CARD ICONS MAPPING ====================

const CARD_ICONS = {
    amex: AmexIcon,
    visa: VisaIcon,
    'diners club': DinersClubIcon,
    jcb: JcbIcon,
    discover: DiscoverIcon,
    maestro: MaestroIcon,
    unionpay: UnionPayIcon,
    mastercard: MastercardIcon,
};

// ==================== CARD PROVIDER ====================

const CardProvider = ({ cardProvider, width = 20, height = 16 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        const raf = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(raf);
    }, [cardProvider]);

    if (!cardProvider) return null;

    const IconComponent = CARD_ICONS[cardProvider];
    if (!IconComponent) return null;

    return (
        <span className={`card ${isVisible ? 'blur-in' : ''}`}>
            <IconComponent width={width} height={height} />
        </span>
    );
};

// ==================== CARD PATTERNS ====================

const CARD_PATTERNS = [
    { card: 'amex', regex: /^3[47]/, min: 15, max: 15, cvv: 4 },
    { card: 'diners club', regex: /^3(?:0[0-5]|[689][0-9])/, min: 14, max: 14, cvv: 3 },
    { card: 'jcb', regex: /^35(?:2[89]|[3-8][0-9])/, min: 16, max: 19, cvv: 3 },
    { card: 'discover', regex: /^(?:6011|65[0-9]{2}|64[4-9][0-9]|622(?:1[2-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5]))/, min: 16, max: 19, cvv: 3 },
    { card: 'maestro', regex: /^(?:6304|6390|67[0-9]{2})/, min: 12, max: 19, cvv: 3 },
    { card: 'unionpay', regex: /^62/, min: 16, max: 19, cvv: 3 },
    { card: 'mastercard', regex: /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/, min: 16, max: 16, cvv: 3 },
    { card: 'visa', regex: /^4/, min: 13, max: 19, cvv: 3 },
];

function detectCard(value, supportedPaymentMethods) {
    if (!value) return null;

    const allowed = supportedPaymentMethods
        ? CARD_PATTERNS.filter((entry) =>
            supportedPaymentMethods.map((m) => m.toLowerCase()).includes(entry.card)
        )
        : CARD_PATTERNS;

    return allowed.find((entry) => entry.regex.test(value)) || null;
}

function formatNumber(digits, chunkSize = 4) {
    let prefix = '';
    let numbers = digits;

    // Check if it starts with + and extract it
    if (digits.startsWith('+')) {
        prefix = '+';
        numbers = digits.slice(1);
    }

    const formatted = numbers.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || '';
    return prefix + formatted;
}

// how many digits sit before `pos` in the currently displayed (formatted) string
function digitsBeforePosition(formatted, pos) {
    return formatted.slice(0, pos).replace(/[^0-9]/g, '').length;
}

// where the caret should land in the *next* formatted string, given that
// `digitCount` digits precede it
function caretPositionForDigitCount(digitCount) {
    if (digitCount <= 0) return 0;
    const spacesBefore = Math.floor((digitCount - 1) / 4);
    return digitCount + spacesBefore;
}


// ==================== PAYMENT INPUT ====================

export const PaymentInput = (props) => {
    const {
        label = "Payment",
        placeholder = "0000 0000 0000 0000",
        disabled,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
        supportedPaymentMethods,
        showIcon,
    } = props;

    const [value, setValue] = useState(''); // raw digits, source of truth
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [detectedCard, setDetectedCard] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [cardKey, setCardKey] = useState(0);

    const inputRef = useRef(null);
    const pendingCursorRef = useRef(null);

    const isDark = useIsDark();

    useEffect(() => {
        if (pendingCursorRef.current !== null && inputRef.current) {
            inputRef.current.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
            pendingCursorRef.current = null;
        }
    }, [value]);

    // single place that actually mutates state, used by both typing and
    // our manual backspace/delete handling below
    const applyNewDigits = (sanitized, digitsBeforeCursor) => {
        const nextDetectedCard = detectCard(sanitized, supportedPaymentMethods);
        const prevCode = detectedCard?.card ?? null;
        const nextCode = nextDetectedCard?.card ?? null;
        const cardChanged = prevCode !== nextCode;

        pendingCursorRef.current = caretPositionForDigitCount(digitsBeforeCursor);

        setValue(sanitized);
        setError(false);
        setErrorText('');
        setDetectedCard(nextDetectedCard);
        if (cardChanged) setCardKey((prev) => prev + 1);
        if (onChange) onChange(sanitized);
    };

    // handles typing digits / pasting — browser edit already reflects the
    // new text, we just re-derive raw digits + caret from it
    const handleChange = (e) => {
        const input = e.target;
        const cursorPos = input.selectionStart;
        const digitsBeforeCursor = input.value.slice(0, cursorPos).replace(/[^0-9]/g, '').length;
        const sanitized = input.value.replace(/[^0-9]/g, '');
        applyNewDigits(sanitized, digitsBeforeCursor);
    };

    // handles Backspace/Delete ourselves so the browser never touches the
    // DOM directly — this is what avoids the divergence-driven caret jump
    const handleKeyDown = (e) => {
        if (e.key !== 'Backspace' && e.key !== 'Delete') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return; // leave word/line deletes to default

        const input = e.target;
        const formatted = input.value; // == formatNumber(value), since controlled
        const { selectionStart, selectionEnd } = input;

        e.preventDefault();

        let newDigits;
        let newDigitCount;

        if (selectionStart !== selectionEnd) {
            const digitsBeforeStart = digitsBeforePosition(formatted, selectionStart);
            const digitsBeforeEnd = digitsBeforePosition(formatted, selectionEnd);
            newDigits = value.slice(0, digitsBeforeStart) + value.slice(digitsBeforeEnd);
            newDigitCount = digitsBeforeStart;
        } else if (e.key === 'Backspace') {
            const digitsBefore = digitsBeforePosition(formatted, selectionStart);
            if (digitsBefore === 0) return; // nothing before caret, no-op
            newDigits = value.slice(0, digitsBefore - 1) + value.slice(digitsBefore);
            newDigitCount = digitsBefore - 1;
        } else {
            // Delete: remove the next digit at/after caret, skipping over
            // a space if the caret happens to sit right in front of one
            const digitsBefore = digitsBeforePosition(formatted, selectionStart);
            if (digitsBefore >= value.length) return; // nothing after caret
            newDigits = value.slice(0, digitsBefore) + value.slice(digitsBefore + 1);
            newDigitCount = digitsBefore;
        }

        applyNewDigits(newDigits, newDigitCount);
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
        inputRef.current?.select();
    };

    const handleBlur = () => {
        const totalLen = value.length;
        const showLoader = !detectedCard && value;
        setIsFocused(false);
        setIsValidating(showLoader);

        setTimeout(() => {
            let nextError = false;
            let nextErrorText = '';

            if (!value) {
                // Empty — no error on blur if untouched
            } else if (detectedCard) {
                if (totalLen < detectedCard.min) {
                    nextError = true;
                    nextErrorText = 'Card number too short';
                } else if (totalLen > detectedCard.max) {
                    nextError = true;
                    nextErrorText = 'Card number too long';
                }
            } else {
                nextError = true;
                nextErrorText = 'Unrecognized card number';
            }

            setIsValidating(false);
            setError(nextError);
            setErrorText(nextErrorText);
        }, 0);

        if (onBlur) onBlur();
    };

    const renderIcon = () => {
        if (!showIcon) return null;

        const fadeClass = showIcon && isFocused && fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span className={`input-icon ${fadeClass}`}>
                {detectedCard ? (
                    <CardProvider
                        key={cardKey}
                        cardProvider={detectedCard.card}
                        width={20}
                        height={16}
                    />
                ) : isValidating ? (
                    <Loader size="small" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="card-icon lucide lucide-credit-card-icon lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                )}
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label?.replace(/\s+/g, '-').toLowerCase() || 'payment-input'}`;

    return (
        <div className={`input ${showIcon ? 'has-icon' : ''} ${showIcon && shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className="input-label"><p>{label}</p></label>}
            <div className="input-wrapper">
                {renderIcon()}
                <input
                    ref={inputRef}
                    type="text"
                    className={`payment-input ${error ? 'error' : ''}`}
                    id={id}
                    value={formatNumber(value)}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    inputMode="numeric"
                    maxLength={23}
                />
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
};


/* color picker input */
function hsbToRgb(h, s, b) {
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b - b * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255),
    };
}

// Each entry validates one syntax and returns a CSS-safe color string.
// Order matters: hex is checked before the function-based formats.
const CSS_COLOR_NAMES = new Set([
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
    'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
    'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
    'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta',
    'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
    'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
    'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
    'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow',
    'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
    'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
    'lightgray', 'lightgrey', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen',
    'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime',
    'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid',
    'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy',
    'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
    'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue',
    'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
    'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey',
    'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet',
    'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen', 'transparent',
]);

const COLOR_PATTERNS = [
    {
        format: 'hex',
        regex: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        toCss: (value) => value,
    },
    {
        format: 'rgba',
        regex: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/,
        toCss: (value, [, r, g, b, a]) => {
            if ([r, g, b].some((n) => Number(n) > 255)) return null;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        },
    },
    {
        format: 'rgb',
        regex: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        toCss: (value, [, r, g, b]) => {
            if ([r, g, b].some((n) => Number(n) > 255)) return null;
            return `rgb(${r}, ${g}, ${b})`;
        },
    },
    {
        format: 'hsla',
        regex: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/,
        toCss: (value, [, h, s, l, a]) => {
            if (Number(h) > 360 || Number(s) > 100 || Number(l) > 100) return null;
            return `hsla(${h}, ${s}%, ${l}%, ${a})`;
        },
    },
    {
        format: 'hsl',
        regex: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/,
        toCss: (value, [, h, s, l]) => {
            if (Number(h) > 360 || Number(s) > 100 || Number(l) > 100) return null;
            return `hsl(${h}, ${s}%, ${l}%)`;
        },
    },
    {
        format: 'hsb',
        regex: /^hsb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/,
        toCss: (value, [, h, s, b]) => {
            if (Number(h) > 360 || Number(s) > 100 || Number(b) > 100) return null;
            const { r, g, b: bl } = hsbToRgb(Number(h), Number(s), Number(b));
            return `rgb(${r}, ${g}, ${bl})`;
        },
    },
    {
        format: 'named',
        regex: /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/,
        toCss: (value) => {
            const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
            if (!CSS_COLOR_NAMES.has(normalized)) return null;
            return normalized;
        },
    },
];

function detectColor(rawValue) {
    const value = rawValue.trim();
    if (!value) return null;

    for (const entry of COLOR_PATTERNS) {
        const match = value.match(entry.regex);
        if (!match) continue;
        const css = entry.toCss(value, match);
        if (css) return { format: entry.format, css };
    }
    return null;
}

// Cycled through the placeholder so people can see what's accepted
// without reading docs.
const COLOR_PLACEHOLDERS = [
    '#000',
    '#000000',
    'rgb(0, 0, 0)',
    'rgba(0, 0, 0, 0)',
    'hsl(0, 0%, 0%)',
    'hsla(0, 0%, 0%, 0)',
    'hsb(0, 0%, 0%)',
];

const FORMAT_PLACEHOLDERS = {
    auto: null,
    hex: '#000000',
    rgb: 'rgb(0, 0, 0)',
    rgba: 'rgba(0, 0, 0, 1)',
    hsl: 'hsl(0, 0%, 0%)',
    hsla: 'hsla(0, 0%, 0%, 1)',
    hsb: 'hsb(0, 0%, 0%)',
};

// --- Format dropdown options + conversion layer -------------------------
// The dropdown only offers formats we can round-trip through {r,g,b,a}.
// "named" colors (e.g. "red") are detectable, but aren't a selectable
// dropdown target — only Auto accepts them.
const FORMAT_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: 'hex', label: 'Hex' },
    { value: 'rgb', label: 'RGB' },
    { value: 'rgba', label: 'RGBA' },
    { value: 'hsl', label: 'HSL' },
    { value: 'hsla', label: 'HSLA' },
    { value: 'hsb', label: 'HSB' },
];
const SELECTABLE_FORMATS = FORMAT_OPTIONS.map((o) => o.value).filter((v) => v !== 'auto');

// Resolves *any* valid CSS color string (hex / rgb / rgba / hsl / hsla /
// named) to normalized {r, g, b, a} by letting the browser parse it via a
// throwaway element + getComputedStyle, rather than hand-rolling a parser
// per format.
function cssToRgba(cssColor) {
    const el = document.createElement('div');
    el.style.color = cssColor;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);

    const match = computed.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;

    const parts = match[1].split(',').map((n) => parseFloat(n.trim()));
    const [r, g, b, a = 1] = parts;
    return { r, g, b, a };
}

function rgbToHex({ r, g, b, a }) {
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a >= 1 ? base : `${base}${toHex(a * 255)}`;
}

function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsb({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), b: Math.round(v * 100) };
}

// Given resolved {r,g,b,a}, format for the requested dropdown format.
function rgbaToFormat({ r, g, b, a }, format) {
    switch (format) {
        case 'hex':
            return rgbToHex({ r, g, b, a });
        case 'rgb':
            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        case 'rgba':
            return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.round(a * 100) / 100})`;
        case 'hsl': {
            const { h, s, l } = rgbToHsl({ r, g, b });
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        case 'hsla': {
            const { h, s, l } = rgbToHsl({ r, g, b });
            return `hsla(${h}, ${s}%, ${l}%, ${Math.round(a * 100) / 100})`;
        }
        case 'hsb': {
            const { h, s, b: bb } = rgbToHsb({ r, g, b });
            return `hsb(${h}, ${s}%, ${bb}%)`;
        }
        default:
            return null;
    }
}

// Converts an already-typed, valid color into the requested target format.
// Returns null for Auto (nothing to rewrite) or if nothing valid is typed.
function convertColorToFormat(detected, targetFormat) {
    if (!detected || targetFormat === 'auto') return null;
    const rgba = cssToRgba(detected.css);
    if (!rgba) return null;
    return rgbaToFormat(rgba, targetFormat);
}

// Swatch shown over a checkerboard background so alpha/transparency is visible.
// Stays mounted the whole time — only `background-color` changes when the
// value changes, which CSS can transition smoothly. Opacity is only toggled
// at the empty <-> has-color edges (that's the only case that should "fade").
const ColorSwatch = ({ color }) => (
    <span className="color-display">
        <span
            className={`color-display-fill ${color ? 'visible' : ''}`}
            style={{ backgroundColor: color || 'transparent' }}
        />
    </span>
);

/* ───────────────────────── ColorInput ───────────────────────── */

export const ColorInput = (props) => {
    const {
        label = "Color",
        placeholder,
        disabled,
        onChange,
        onFocus,
        onBlur,
        fadeIconOnFocus,
    } = props;

    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [detectedColor, setDetectedColor] = useState(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [format, setFormat] = useState('auto'); // selected dropdown format

    const targetPlaceholder = placeholder
        ? placeholder
        : format !== 'auto' && FORMAT_PLACEHOLDERS[format]
            ? FORMAT_PLACEHOLDERS[format]
            : COLOR_PLACEHOLDERS[placeholderIndex];

    const [displayedPlaceholder, setDisplayedPlaceholder] = useState(targetPlaceholder);
    const [isPlaceholderFading, setIsPlaceholderFading] = useState(false);

    // Soft fade transition whenever target placeholder string changes
    useEffect(() => {
        if (targetPlaceholder === displayedPlaceholder) return;
        setIsPlaceholderFading(true);
        const timer = setTimeout(() => {
            setDisplayedPlaceholder(targetPlaceholder);
            setIsPlaceholderFading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, [targetPlaceholder, displayedPlaceholder]);

    // Only cycle when no fixed placeholder was passed in via props and format is 'auto'.
    useEffect(() => {
        if (placeholder || format !== 'auto') return;
        const interval = setInterval(() => {
            setPlaceholderIndex((i) => (i + 1) % COLOR_PLACEHOLDERS.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [placeholder, format]);

    const handleChange = (e) => {
        const next = e.target.value;
        const nextDetected = detectColor(next);

        setValue(next);
        setError(false);
        setErrorText('');
        setDetectedColor(nextDetected);

        // A specific format is selected, but the user typed a valid color
        // that doesn't match it — follow their lead and sync the dropdown:
        //  - if the typed value matches a different *selectable* format
        //    (e.g. typed rgb() while Hex was selected), switch to that format.
        //  - if it's only valid as a named color (e.g. "red"), there's no
        //    dropdown option for "named" — fall back to Auto instead of
        //    leaving the dropdown showing a format that doesn't match.
        if (format !== 'auto' && nextDetected && nextDetected.format !== format) {
            if (SELECTABLE_FORMATS.includes(nextDetected.format)) {
                setFormat(prev => nextDetected.format);
            } else {
                setFormat(prev => 'auto');
            }
        }

        if (onChange) {
            onChange(next, nextDetected?.css ?? null);
        }
    };

    const handleFormatSelect = (nextFormat) => {
        setFormat(nextFormat);

        // Auto never rewrites what's already typed — it just stops
        // constraining future input.
        if (nextFormat === 'auto') return;

        const converted = convertColorToFormat(detectedColor, nextFormat);
        if (!converted) return; // nothing valid typed yet, nothing to translate

        const redetected = detectColor(converted);
        setValue(converted);
        setDetectedColor(redetected);
        setError(false);
        setErrorText('');

        if (onChange) {
            onChange(converted, redetected?.css ?? null);
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus();
        e.target.select();
    };

    const handleBlur = () => {
        setIsFocused(false);

        let nextError = false;
        let nextErrorText = '';

        if (!value) {
            // Empty — no error on blur if untouched
        } else if (!detectedColor) {
            nextError = true;
            nextErrorText = 'Unrecognized color format';
        }

        setError(nextError);
        setErrorText(nextErrorText);

        if (onBlur) onBlur();
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const selectedOption = FORMAT_OPTIONS.find((o) => o.value === format);

    return (
        <div className={`input has-icon ${shouldFadeOut ? 'icon-faded' : ''}`}>
            {label && <label className="input-label"><p>{label}</p></label>}
            <div className="input-wrapper">
                <span className={`input-icon ${shouldFadeOut ? 'fade-out' : ''}`}>
                    <ColorSwatch color={detectedColor?.css ?? null} />
                </span>

                <input
                    type="text"
                    autoComplete="off"
                    className={`color-input ${error ? 'error' : ''}`}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder=""
                    disabled={disabled}
                />
                {!value && (
                    <span className={`color-input-placeholder ${shouldFadeOut ? 'icon-faded' : ''} ${isPlaceholderFading ? 'fading' : ''}`}>
                        {displayedPlaceholder}
                    </span>
                )}
                <DropdownWrapper value={format !== 'auto' ? FORMAT_OPTIONS.find((o) => o.value === format)?.label : 'Auto'}
                    onValueChange={(rawText) => {
                        const picked = FORMAT_OPTIONS.find((o) => o.label === rawText);
                        if (picked) handleFormatSelect(picked.value);
                    }}>
                    <DropdownTrigger>
                        <Select
                            placeholder="Auto"
                            value={format !== 'auto' ? selectedOption?.label : undefined}
                            disabled={disabled}
                        />
                    </DropdownTrigger>

                    <Dropdown maxHeight={120}>
                        <DropdownGroup>
                            {FORMAT_OPTIONS.map((option) => (
                                <GroupItem
                                    key={option.value}
                                    selected={format === option.value}
                                    onClick={() => handleFormatSelect(option.value)}
                                >
                                    {option.label}
                                </GroupItem>
                            ))}
                        </DropdownGroup>
                    </Dropdown>
                </DropdownWrapper>
            </div>
            <label className={`input-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
};