import { useState, useRef, useCallback, useEffect } from "react";
import './Number.scss';
import { ScrollSegment } from '../common/ScrollSegment';

export const Number = ({
    min = 0,
    max = 99,
    label,
    orientation = "horizontal",
    disabled = false,
    onChange,
}) => {
    // digit budget the field needs to reserve — driven by the longer of min/max
    const digitCount = Math.max(
        String(Math.abs(max)).length,
        String(Math.abs(min)).length,
        1
    );

    // natural (non zero-padded) rendering — unset shows a plain "0"
    const format = useCallback((v) => (v === null || v === undefined ? "0" : String(v)), []);

    const [value, setValue] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [pendingDigits, setPendingDigits] = useState("");
    const [error, setError] = useState(false);
    const [errorText] = useState("invalid number");

    const inputRef = useRef(null);
    const suppressSelect = useRef(false);

    const [spinDuration, setSpinDuration] = useState(150);
    const [spinDirection, setSpinDirection] = useState(null);

    const holdTimerRef = useRef(null);
    const holdIntervalRef = useRef(null);
    const currentIntervalTimeRef = useRef(150);
    const activeKeyRef = useRef(null);
    const isShiftRef = useRef(false);
    const lastArrowTimeRef = useRef(0);

    const valueRef = useRef(value);
    useEffect(() => { valueRef.current = value; }, [value]);

    const pendingDigitsRef = useRef(pendingDigits);
    useEffect(() => { pendingDigitsRef.current = pendingDigits; }, [pendingDigits]);

    const allEmpty = value === null;
    const displayValue = format(value);
    // what the scroll segment renders — never null, so it always shows a digit ("0") rather than a dash placeholder
    const segmentValue = value === null ? 0 : value;

    const selectAll = useCallback(() => {
        suppressSelect.current = true;
        requestAnimationFrame(() => {
            if (inputRef.current) {
                const len = inputRef.current.value.length;
                inputRef.current.setSelectionRange(0, len);
            }
            requestAnimationFrame(() => {
                suppressSelect.current = false;
            });
        });
    }, []);

    const commitValue = useCallback((val) => {
        const clamped = val === null ? null : Math.min(Math.max(val, min), max);
        setValue(clamped);
        return clamped;
    }, [min, max]);

    const performStep = useCallback((key) => {
        lastArrowTimeRef.current = Date.now();
        const current = valueRef.current;
        const step = isShiftRef.current ? 10 : 1;
        let next;

        if (current === null || current === undefined) {
            next = key === "ArrowUp" ? min : max;
        } else if (key === "ArrowUp") {
            next = current + step > max ? min : current + step;
        } else {
            next = current - step < min ? max : current - step;
        }

        commitValue(next);
        setPendingDigits("");
        selectAll();
    }, [commitValue, selectAll, min, max]);

    const runHoldInterval = useCallback(() => {
        if (!activeKeyRef.current) return;
        performStep(activeKeyRef.current);
        const nextInterval = Math.max(25, currentIntervalTimeRef.current * 0.85);
        currentIntervalTimeRef.current = nextInterval;
        setSpinDuration(nextInterval);
        holdIntervalRef.current = setTimeout(runHoldInterval, nextInterval);
    }, [performStep]);

    const stopHolding = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (holdIntervalRef.current) {
            clearTimeout(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        activeKeyRef.current = null;
        setSpinDuration(150);
        setTimeout(() => {
            if (!activeKeyRef.current) {
                setSpinDirection(null);
            }
        }, 300);
    }, []);

    const beginHold = useCallback((key, shift = false) => {
        if (disabled) return;
        if (activeKeyRef.current === key) return;

        activeKeyRef.current = key;
        isShiftRef.current = shift;
        setSpinDirection(key === "ArrowUp" ? "up" : "down");
        lastArrowTimeRef.current = Date.now();

        performStep(key);

        currentIntervalTimeRef.current = 150;
        setSpinDuration(150);

        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        if (holdIntervalRef.current) clearTimeout(holdIntervalRef.current);

        holdTimerRef.current = setTimeout(() => {
            runHoldInterval();
        }, 350);
    }, [disabled, performStep, runHoldInterval]);

    const handleKeyUp = useCallback((e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            if (e.key === activeKeyRef.current) {
                stopHolding();
            }
        }
    }, [stopHolding]);

    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
            if (holdIntervalRef.current) clearTimeout(holdIntervalRef.current);
        };
    }, []);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setError(false);
        setPendingDigits("");
        selectAll();
    }, [selectAll]);

    const handleBlur = useCallback(() => {
        stopHolding();
        setIsFocused(false);
        setPendingDigits("");
        suppressSelect.current = false;
        const current = valueRef.current;
        setError(current === null || current === 0);
        if (onChange) {
            onChange(current === null ? null : current);
        }
    }, [onChange, stopHolding]);

    const handleClick = useCallback(() => {
        if (!isFocused) return;
        setPendingDigits("");
        selectAll();
    }, [isFocused, selectAll]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            if (e.repeat) return;
            if (activeKeyRef.current === e.key) return;
            beginHold(e.key, e.shiftKey);
            return;
        }

        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            setValue(null);
            setPendingDigits("");
            selectAll();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            suppressSelect.current = true;
            inputRef.current?.blur();
            return;
        }

        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            let buffer = pendingDigitsRef.current + e.key;
            if (buffer.length > digitCount) {
                buffer = buffer.slice(buffer.length - digitCount);
            }
            const parsed = parseInt(buffer, 10);
            const nextWouldOverflow = buffer.length < digitCount && parsed * 10 > max;

            if (buffer.length >= digitCount || nextWouldOverflow) {
                commitValue(parsed);
                setPendingDigits("");
                suppressSelect.current = true;
                inputRef.current?.blur();
            } else {
                setValue(parsed);
                setPendingDigits(buffer);
                selectAll();
            }
            return;
        }

        if (e.key.length === 1) {
            e.preventDefault();
        }
    }, [beginHold, commitValue, digitCount, max, selectAll]);

    const handleInput = useCallback((e) => {
        const type = e.nativeEvent.inputType;
        if (type === "deleteContentBackward" || type === "deleteContentForward") {
            setValue(null);
            setPendingDigits("");
            selectAll();
        }
    }, [selectAll]);

    const handleSelect = useCallback(() => {
        if (suppressSelect.current || !isFocused) return;
        if (activeKeyRef.current) return;
        if (Date.now() - lastArrowTimeRef.current < 150) return;
        selectAll();
    }, [isFocused, selectAll]);

    const handleIncrementDown = useCallback((e) => {
        e.preventDefault();
        if (disabled) return;
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
        }
        beginHold("ArrowUp", e.shiftKey);
    }, [beginHold, disabled]);

    const handleDecrementDown = useCallback((e) => {
        e.preventDefault();
        if (disabled) return;
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
        }
        beginHold("ArrowDown", e.shiftKey);
    }, [beginHold, disabled]);

    const handleButtonRelease = useCallback(() => {
        stopHolding();
    }, [stopHolding]);

    const id = `number-${label.replace(/\s+/g, "-").toLowerCase()}`;

    const renderButtons = () => {

        const incrementBtn = (
            <button
                type="button"
                className="number-plus"
                aria-label="increment"
                name="increment"
                disabled={disabled}
                onMouseDown={handleIncrementDown}
                onMouseUp={handleButtonRelease}
                onMouseLeave={handleButtonRelease}
                onTouchStart={handleIncrementDown}
                onTouchEnd={handleButtonRelease}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </button>
        );

        const decrementBtn = (
            <button
                type="button"
                className="number-minus"
                aria-label="decrement"
                name="decrement"
                disabled={disabled}
                onMouseDown={handleDecrementDown}
                onMouseUp={handleButtonRelease}
                onMouseLeave={handleButtonRelease}
                onTouchStart={handleDecrementDown}
                onTouchEnd={handleButtonRelease}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
            </button>
        );

        // Horizontal: minus pinned to the left edge, plus pinned to the right edge
        if (orientation === "horizontal") {
            return <>{decrementBtn}{incrementBtn}</>;
        }

        // Vertical: stacked spinner grouped in one column on the right
        return <div className="button-group">{incrementBtn}{decrementBtn}</div>;
    };

    return (
        <div
            className={`number has-btns has-btns-${orientation}`}
            style={{ "--digit-count": digitCount }}
        >
            <label className="number-label" htmlFor={id}><p>{label}</p></label>
            <div
                className="number-wrapper"
                onMouseDown={(e) => {
                    if (e.target !== inputRef.current) {
                        e.preventDefault();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    disabled={disabled}
                    type="text"
                    inputMode="numeric"
                    name="number"
                    placeholder="0"
                    autoComplete="off"
                    className={`number-input${error ? " error" : ""}${!isFocused && allEmpty ? " placeholder" : ""} custom-render`}
                    value={isFocused || !allEmpty ? displayValue : ""}
                    id={id}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    onInput={handleInput}
                    onSelect={handleSelect}
                    spellCheck={false}
                />
                <div className={`number-visual-overlay${!isFocused && allEmpty ? " is-placeholder" : ""}`}>
                    <ScrollSegment
                        placeholder="0"
                        padLength={0}
                        value={segmentValue}
                        min={min}
                        max={max}
                        isActive={isFocused}
                        isFocused={isFocused}
                        spinDuration={spinDuration}
                        spinDirection={spinDirection}
                    />
                </div>
                {renderButtons()}
            </div>
            <span className={`number-error${error ? " visible" : ""}`}>
                <small>{errorText}</small>
            </span>
        </div>
    );
};