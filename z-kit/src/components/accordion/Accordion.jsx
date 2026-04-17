import React from "react";
import PropTypes from "prop-types";
import './Accordion.scss'
import { motion, useAnimation } from "motion/react"; // (!)REQUIRED: Animation Package

const ChevronDownIcon = React.forwardRef(({ duration = 0.2, ...props }, ref) => {
    const controls = useAnimation();

    React.useImperativeHandle(ref, () => ({
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
    }));

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <motion.path
                d="M6 9L12 15L18 9"
                variants={{
                    normal: { d: "M6 9L12 15L18 9" },
                    animate: { d: "M6 15L12 9L18 15" },
                }}
                initial="normal"
                animate={controls}
                transition={{ duration }}
            />
        </svg>
    );
});

ChevronDownIcon.displayName = "ChevronDownIcon";

export class Accordion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
        this.chevronRef = React.createRef();
    }

    toggleAccordion = () => {
        const { active } = this.state;

        if (active) {
            this.chevronRef.current?.stopAnimation();
        } else {
            this.chevronRef.current?.startAnimation();
        }

        this.setState({ active: !this.state.active });
    }

    render() {
        return (
            <div className="accordion" onClick={this.toggleAccordion}>
                <div className="title">
                    <h6>{this.props.question}</h6>
                    <ChevronDownIcon ref={this.chevronRef} duration={0.2} width={20} height={20} strokeWidth={3} />
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