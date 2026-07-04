import React, { useState, useEffect, useRef } from 'react';
import './ScrollSegment.scss';

/**
 * Reusable scroll segment component with animated spin.
 * Shared by Date and Time inputs.
 *
 * Props:
 *  - value: current numeric value (null shows placeholder)
 *  - min, max: range bounds
 *  - isActive: whether this segment is focused/active
 *  - isFocused: overall focus state of the parent input
 *  - spinDuration: animation duration in ms (faster when holding)
 *  - spinDirection: 'up' | 'down' | null — explicit direction from arrow-key spin.
 *      When absent (typing, paste, programmatic set), direction is inferred
 *      from plain magnitude comparison — no wraparound guessing, since real
 *      wraparounds always arrive here with spinDirection already set by the
 *      caller's spin logic.
 *  - placeholder: text shown when value is null (default "‒‒")
 *  - padLength: zero-pad width (2 for time segments, 2/4 for day-month/year)
 *  - zeroPad: whether to left-pad the displayed value with zeros up to
 *      padLength (default true, matches original behavior). Set to false
 *      to show raw numbers with no leading zeros.
 */
export const ScrollSegment = ({
  value,
  min,
  max,
  isActive,
  isFocused,
  spinDuration,
  spinDirection,
  placeholder = "\u2012\u2012",
  padLength = 2,
  zeroPad = true
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [direction, setDirection] = useState(null);
  const [animating, setAnimating] = useState(false);
  const animationKeyRef = useRef(0);

  const padVal = (v) => {
    if (v === null || v === undefined || v === '') return placeholder;
    return zeroPad ? String(v).padStart(padLength, "0") : String(v);
  };

  const formattedDisplay = padVal(displayValue);
  const formattedPrev = padVal(prevValue);

  useEffect(() => {
    if (value !== displayValue) {
      let dir = spinDirection;

      if (!dir) {
        // No explicit spin direction (typing, paste, programmatic commit) —
        // just compare magnitudes. Real arrow-key wraparounds already carry
        // an explicit spinDirection from the caller, so we never need to
        // guess a wrap here based on min/max equality alone (that guess
        // used to misfire on e.g. typing "1" then "2" for a 1-12 field).
        if (value !== null && displayValue !== null) {
          dir = value > displayValue ? "up" : "down";
        } else if (value === null) {
          dir = "down";
        } else {
          dir = "up";
        }
      }

      setPrevValue(displayValue);
      setDisplayValue(value);
      setDirection(dir);
      setAnimating(true);
      animationKeyRef.current += 1;
    }
  }, [value, displayValue, spinDirection]);

  const handleAnimationEnd = () => {
    setAnimating(false);
    setDirection(null);
  };

  // apply blur based on speed
  let blurClass = "";
  if (animating && spinDuration < 100) {
    if (spinDuration < 40) blurClass = "blur-lg";
    else if (spinDuration < 75) blurClass = "blur-md";
    else blurClass = "blur-sm";
  }

  return (
    <span className={`scroll-segment${isActive ? " active" : ""}${isFocused ? " focused" : ""}`}>
      <span className="segment-scroll-window">
        {animating && direction ? (
          <span
            key={animationKeyRef.current}
            className={`segment-scroll-inner animate-${direction} ${blurClass}`}
            style={{ "--spin-duration": `${spinDuration}ms` }}
            onAnimationEnd={handleAnimationEnd}
          >
            {direction === "up" ? (
              <>
                <span className="segment-number">{formattedPrev}</span>
                <span className="segment-number">{formattedDisplay}</span>
              </>
            ) : (
              <>
                <span className="segment-number">{formattedDisplay}</span>
                <span className="segment-number">{formattedPrev}</span>
              </>
            )}
          </span>
        ) : (
          <span className="segment-number">{formattedDisplay}</span>
        )}
      </span>
    </span>
  );
};