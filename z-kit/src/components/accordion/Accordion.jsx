// Accordion.jsx with external control support
import React from "react";
import PropTypes from "prop-types";
import "./Accordion.scss";
import { motion, useAnimation } from "motion/react";
import { soundManager } from "../../utils/soundUtils";
import clickSoundFile from "../../assets/sounds/click.mp3";

// Load sound once (could be done in a central location)
soundManager.loadSound("click", clickSoundFile, 1);

const ChevronDownIcon = React.forwardRef(
  ({ duration = 0.2, ...props }, ref) => {
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
  },
);

ChevronDownIcon.displayName = "ChevronDownIcon";

export class Accordion extends React.Component {
  constructor(props) {
    super(props);
    // Use checked prop if provided, otherwise use internal state
    const isControlled = props.checked !== undefined;
    this.state = {
      active: isControlled ? props.checked : false,
      isControlled,
    };
    this.chevronRef = React.createRef();
  }

  // Sync internal state when controlled prop changes
  componentDidUpdate(prevProps) {
    if (this.state.isControlled && prevProps.checked !== this.props.checked) {
      this.setState({ active: this.props.checked });
      // Update chevron animation based on new state
      if (this.props.checked) {
        this.chevronRef.current?.startAnimation();
      } else {
        this.chevronRef.current?.stopAnimation();
      }
    }
  }

  toggleAccordion = () => {
    const { active, isControlled } = this.state;
    const {
      enableSound = true,
      soundVolume = 1,
      disabled = false,
      onToggle,
    } = this.props;

    if (disabled) return;

    // Play sound using soundManager
    if (enableSound) {
      soundManager.play("click", soundVolume);
    }

    const newActiveState = !active;

    // Handle animation
    if (newActiveState) {
      this.chevronRef.current?.startAnimation();
    } else {
      this.chevronRef.current?.stopAnimation();
    }

    if (!isControlled) {
      // Uncontrolled mode - update internal state
      this.setState({ active: newActiveState }, () => {
        if (onToggle) {
          onToggle(newActiveState);
        }
      });
    } else {
      // Controlled mode - just call onToggle
      if (onToggle) {
        onToggle(newActiveState);
      }
    }
  };

  render() {
    const { question, answer, disabled = false, customClass = "" } = this.props;

    const { active } = this.state;

    return (
      <div
        className={`accordion ${disabled ? "accordion--disabled" : ""} ${customClass}`}
        onClick={this.toggleAccordion}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={active}
        aria-disabled={disabled}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            this.toggleAccordion();
          }
        }}
      >
        <div className="title">
          <h6>{question}</h6>
          <ChevronDownIcon
            ref={this.chevronRef}
            duration={0.2}
            width={20}
            height={20}
            strokeWidth={3}
          />
        </div>
        <div className={`content ${active ? "open" : "closed"}`}>
          <div>
            <p>{answer}</p>
          </div>
        </div>
      </div>
    );
  }
}

Accordion.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  soundVolume: PropTypes.number,
  enableSound: PropTypes.bool,
  onToggle: PropTypes.func,
  customClass: PropTypes.string,
  checked: PropTypes.bool, // New prop for controlled mode
};

Accordion.defaultProps = {
  question: "Click to expand",
  answer: "Content goes here",
  disabled: false,
  enableSound: true,
  soundVolume: 1,
};
