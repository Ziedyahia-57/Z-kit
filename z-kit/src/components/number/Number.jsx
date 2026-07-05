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

    const touchActiveRef = useRef(false);
    const incrementBtnRef = useRef(null);
    const decrementBtnRef = useRef(null);

    // Track when buttons are being pressed (for mobile visual feedback)
    const [buttonPressed, setButtonPressed] = useState(false);

    // Ref to the root element for outside-click detection
    const rootRef = useRef(null);

    const allEmpty = value === null;
    const displayValue = format(value);
    const segmentValue = value === null ? 0 : value;

    // Combined active state: input focused OR button pressed
    const isSegmentActive = isFocused || buttonPressed;

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
        // REMOVED: setButtonPressed(false) — selection now persists on release
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
        setButtonPressed(true);

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
        setButtonPressed(false); // clear on blur
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

    const handleTouchStart = useCallback((e, direction) => {
        e.preventDefault();
        if (disabled) return;
        beginHold(direction === "up" ? "ArrowUp" : "ArrowDown", e.shiftKey);
    }, [beginHold, disabled]);

    const handlePointerDown = useCallback((direction, e) => {
        if (e.pointerType === "touch") {
            e.preventDefault();
        }
        if (disabled) return;

        if (e.pointerType === "mouse" && inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
        }

        beginHold(direction === "up" ? "ArrowUp" : "ArrowDown", e.shiftKey);
    }, [beginHold, disabled]);

    const handlePointerUp = useCallback((e) => {
        stopHolding();
    }, [stopHolding]);

    // Native touch listeners for buttons
    useEffect(() => {
        const setupButton = (btnRef, direction) => {
            const btn = btnRef.current;
            if (!btn) return;

            const onTouchStart = (e) => {
                e.preventDefault();
                touchActiveRef.current = true;
                if (disabled) return;
                beginHold(direction === "up" ? "ArrowUp" : "ArrowDown", false);
            };

            const onTouchEnd = () => {
                touchActiveRef.current = false;
                stopHolding();
            };

            btn.addEventListener("touchstart", onTouchStart, { passive: false });
            btn.addEventListener("touchend", onTouchEnd);
            btn.addEventListener("touchcancel", onTouchEnd);

            return () => {
                btn.removeEventListener("touchstart", onTouchStart);
                btn.removeEventListener("touchend", onTouchEnd);
                btn.removeEventListener("touchcancel", onTouchEnd);
            };
        };

        const cleanupInc = setupButton(incrementBtnRef, "up");
        const cleanupDec = setupButton(decrementBtnRef, "down");

        return () => {
            cleanupInc?.();
            cleanupDec?.();
        };
    }, [beginHold, stopHolding, disabled]);

    // Outside-click/touch listener to clear buttonPressed on mobile
    useEffect(() => {
        const handleOutsideInteraction = (e) => {
            if (!buttonPressed) return;
            if (!rootRef.current) return;
            if (rootRef.current.contains(e.target)) return;
            setButtonPressed(false);
        };

        document.addEventListener("mousedown", handleOutsideInteraction);
        document.addEventListener("touchstart", handleOutsideInteraction);

        return () => {
            document.removeEventListener("mousedown", handleOutsideInteraction);
            document.removeEventListener("touchstart", handleOutsideInteraction);
        };
    }, [buttonPressed]);

    const handleButtonRelease = useCallback(() => {
        stopHolding();
    }, [stopHolding]);

    const id = `number-${label.replace(/\s+/g, "-").toLowerCase()}`;

    const renderButtons = () => {

        const incrementBtn = (
            <button
                ref={incrementBtnRef}
                type="button"
                className="number-plus"
                aria-label="increment"
                name="increment"
                disabled={disabled}
                onPointerDown={(e) => handlePointerDown("up", e)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </button>
        );

        const decrementBtn = (
            <button
                ref={decrementBtnRef}
                type="button"
                className="number-minus"
                aria-label="decrement"
                name="decrement"
                disabled={disabled}
                onPointerDown={(e) => handlePointerDown("down", e)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
            </button>
        );

        if (orientation === "horizontal") {
            return <>{decrementBtn}{incrementBtn}</>;
        }

        return <div className="button-group">{incrementBtn}{decrementBtn}</div>;
    };

    return (
        <div
            ref={rootRef}  // NEW
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
                        isActive={isSegmentActive}
                        isFocused={isSegmentActive}
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