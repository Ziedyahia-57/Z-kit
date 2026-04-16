import React from "react";
import PropTypes from "prop-types";
import './Accordion.scss'

export class Accordion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }

    toggleAccordion = () => {
        this.setState({ active: !this.state.active });
    }

    render() {
        return (
            <div className="accordion" onClick={this.toggleAccordion}>
                <div className="title">
                    <h6>{this.props.question}</h6>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`lucide lucide-chevron-up ${this.state.active ? 'open' : ''}`}
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </div>
                <div className={`content ${this.state.active ? 'open' : 'closed'}`}>
                    <div>
                        <p>{this.props.answer}</p>
                    </div>
                </div>
            </div>
        );
    }
}

Accordion.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
};

Accordion.defaultProps = {
    question: "Click to expand",
    answer: "Content goes here"
};