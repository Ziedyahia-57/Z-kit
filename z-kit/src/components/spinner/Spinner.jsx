import React from "react";
import PropTypes from "prop-types";
import "./Spinner.scss";

export const Spinner = (props) => {
    return <div className={`spinner ${props.size}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="center">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    </div>
}

export const Loader = (props) => {
    return <div className={`loader ${props.size}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
        </svg>
    </div>
}

Spinner.propTypes = {
    size: PropTypes.oneOf(["small", "medium", "large", "xlarge"])
}
Loader.propTypes = {
    size: PropTypes.oneOf(["small", "medium", "large", "xlarge"])
}

Spinner.defaultProps = {
    size: "small"
}
Loader.defaultProps = {
    size: "small"
}