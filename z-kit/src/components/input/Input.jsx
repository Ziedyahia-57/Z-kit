import React from 'react';
import PropTypes from "prop-types";
import './Input.scss';
import { Loader } from '../spinner/Spinner';



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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
            </span>
        );
    }

    render() {
        const shouldFadeOut = this.state.isFocused && this.props.fadeIconOnFocus;
        const id = `input-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`input ${this.state.showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label className='input-label'><p>{this.props.label}</p></label>
                <div className="input-wrapper">
                    {this.renderIcon()}
                    <input
                        type="text"
                        autoComplete='off'
                        className={`text-input ${this.props.error ? 'error' : ''}`}
                        id={id}
                        value={this.state.value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                </div>
                <label className={`input-error ${this.props.error ? 'visible' : ''}`}>
                    <small>{this.props.errorText}</small>
                </label>
            </div>
        )
    }
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



export class PasswordInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            showIcon: props.showIcon || false,
            isFocused: false,
            error: false,
            errorText: ''
        }
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
            error: false,
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
        const password = this.state.value;
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

        this.setState({
            isFocused: false,
            error: !isValid,
            errorText: isValid ? "" : errorMessage
        });

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock-keyhole-icon lucide-lock-keyhole"><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>
            </span>
        );
    }

    render() {
        const shouldFadeOut = this.state.isFocused && this.props.fadeIconOnFocus;
        const id = `input-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`input ${this.state.showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label className='input-label'><p>{this.props.label}</p></label>
                <div className="input-wrapper">
                    {this.renderIcon()}
                    <input
                        type="password"
                        autoComplete='off'
                        className={`text-input ${this.state.error ? 'error' : ''}`}
                        id={id}
                        value={this.state.value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                </div>
                <label className={`input-error ${this.state.error ? 'visible' : ''}`}>
                    <small>{this.state.errorText}</small>
                </label>
            </div>
        )
    }
}


export class EmailInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            showIcon: props.showIcon || false,
            isFocused: false,
            error: false,
            errorText: '',
        }
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
            error: false,
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
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = regex.test(this.state.value);

        this.setState({
            isFocused: false,
            error: !isValid,
            errorText: isValid ? "" : "Invalid Email"  // Clear error when valid
        });

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-at-sign-icon lucide-at-sign"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
            </span>
        );
    }

    render() {
        const shouldFadeOut = this.state.isFocused && this.props.fadeIconOnFocus;
        const id = `input-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`input ${this.state.showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label className='input-label'><p>{this.props.label}</p></label>
                <div className="input-wrapper">
                    {this.renderIcon()}
                    <input
                        type="email"
                        autoComplete='off'
                        className={`text-input ${this.state.error ? 'error' : ''}`}
                        id={id}
                        value={this.state.value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                    />
                </div>
                <label className={`input-error ${this.state.error ? 'visible' : ''}`}>
                    <small>{this.state.errorText}</small>
                </label>
            </div>
        )
    }
}



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
    { code: '+247', country: 'AC', min: 10, max: 10 },
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

export class PhoneInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            showIcon: props.showIcon || false,
            isFocused: false,
            error: false,
            errorText: '',
            detectedCountry: null,
            isValidating: false,  // only shown when there is NO detected country
            flagKey: 0,             // bumped on country change to replay blur-in + shine
        };
    }

    handleChange = (e) => {
        const sanitized = sanitizePhone(e.target.value);
        const detectedCountry = detectCountry(sanitized);

        const prevCode = this.state.detectedCountry?.country ?? null;
        const nextCode = detectedCountry?.country ?? null;
        const countryChanged = prevCode !== nextCode;

        this.setState((prev) => ({
            value: sanitized,
            error: false,
            errorText: '',
            detectedCountry,
            flagKey: countryChanged ? prev.flagKey + 1 : prev.flagKey,
        }));

        if (this.props.onChange) {
            this.props.onChange(sanitized);
        }
    }

    handleFocus = () => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) this.props.onFocus();
    }

    handleBlur = () => {
        const { value, detectedCountry } = this.state;
        const digits = value.replace(/\D/g, '');
        const totalLen = value.startsWith('+') ? digits.length + 1 : digits.length;

        // Only show the loader when there is no flag to preserve —
        // i.e. the phone icon slot, not the flag slot.
        const showLoader = !detectedCountry && !!value;
        this.setState({ isFocused: false, isValidating: showLoader });

        setTimeout(() => {
            let error = false;
            let errorText = '';

            if (!value) {
                // Empty — no error on blur if untouched
            } else if (detectedCountry) {
                if (totalLen < detectedCountry.min) {
                    error = true;
                    errorText = `Phone number too short`;
                } else if (totalLen > detectedCountry.max) {
                    error = true;
                    errorText = `Phone number too long`;
                }
            } else if (value.startsWith('+')) {
                error = true;
                errorText = 'Unrecognized country code';
            } else {
                if (digits.length < 7) {
                    error = true;
                    errorText = 'Phone number too short (min 7 digits)';
                } else if (digits.length > 15) {
                    error = true;
                    errorText = 'Phone number too long (max 15 digits)';
                }
            }

            this.setState({ isValidating: false, error, errorText });
        }, 0);

        if (this.props.onBlur) this.props.onBlur();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.showIcon !== this.props.showIcon) {
            this.setState({ showIcon: this.props.showIcon });
        }
    }

    renderIcon = () => {
        if (!this.state.showIcon) return null;

        const { detectedCountry, isFocused, isValidating, flagKey } = this.state;
        const fadeClass = isFocused && this.props.fadeIconOnFocus ? 'fade-out' : '';

        return (
            <span className={`input-icon ${fadeClass}`}>
                {detectedCountry ? (
                    <CountryFlag
                        key={flagKey}
                        countryCode={detectedCountry.country}
                        width={20}
                        height={15}
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
    }

    render() {
        const { isFocused, showIcon, error, errorText, value } = this.state;
        const shouldFadeOut = isFocused && this.props.fadeIconOnFocus;
        const id = `input-${this.props.label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className={`input ${showIcon ? 'has-icon' : ''} ${shouldFadeOut ? 'icon-faded' : ''}`}>
                <label className="input-label"><p>{this.props.label}</p></label>
                <div className="input-wrapper">
                    {this.renderIcon()}
                    <input
                        type="tel"
                        autoComplete="off"
                        className={`text-input ${error ? 'error' : ''}`}
                        id={id}
                        value={value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        placeholder={this.props.placeholder}
                        disabled={this.props.disabled}
                        inputMode="tel"
                        maxLength={16}
                    />
                </div>
                <label className={`input-error ${error ? 'visible' : ''}`}>
                    <small>{errorText}</small>
                </label>
            </div>
        );
    }
}