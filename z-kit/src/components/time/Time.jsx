import { useState, useRef, useCallback, useEffect } from "react";
import './Time.scss';

const SEGMENTS = [
    { key: "hours", min: 0, max: 23, start: 0, end: 2 },
    { key: "minutes", min: 0, max: 59, start: 3, end: 5 },
    { key: "seconds", min: 0, max: 59, start: 6, end: 8 },
];

const SEGMENTS_12H = [
    { key: "hours", min: 1, max: 12, start: 0, end: 2 },
    { key: "minutes", min: 0, max: 59, start: 3, end: 5 },
    { key: "seconds", min: 0, max: 59, start: 6, end: 8 },
];

const PLACEHOLDER = "\u2012\u2012";
const pad = (v) => (v === null || v === undefined ? PLACEHOLDER : String(v).padStart(2, "0"));

function formatDisplay(h, m, s) {
    return `${pad(h)}\u2236${pad(m)}\u2236${pad(s)}`;
}

function segmentIndex(pos) {
    if (typeof pos !== "number" || isNaN(pos)) return 0;
    if (pos <= 2) return 0;
    if (pos <= 5) return 1;
    return 2;
}

function detect12h() {
    const tryDetect = (locale) => {
        try {
            // resolvedOptions() directly tells us if 12h format is used
            const formatter = new Intl.DateTimeFormat(locale, { hour: "numeric" });
            const options = formatter.resolvedOptions();
            if (options.hour12 !== undefined) {
                return options.hour12;
            }

            // Fallback: format 13:00 and analyze the string
            const formatted = new Intl.DateTimeFormat(undefined, {
                hour: "numeric"
            }).format(new Date(2000, 0, 1, 13));

            return /\b1\b/.test(formatted);

            // 24h format will show "13"
            if (/^13/.test(formatted.trim())) return false;

            // 12h format markers (covers AM/PM, Chinese, Japanese, Korean, etc.)
            if (/[AP]\.?[Mm]\.?|午[前后後]|오후|오전/i.test(formatted)) return true;

            // If hour is "1" (not "13"), likely 12h
            const match = formatted.match(/^(\d+)/);
            if (match && match[1] === "1") return true;
        } catch {
            // Intl not available
        }
        return null;
    };

    // undefined locale = browser's true device default (respects 24h/12h setting)
    // navigator.language = fallback for older browsers
    return tryDetect(undefined) ?? tryDetect(navigator.language) ?? false;
}

export const Time = ({ label, disabled = false, fadeIconOnFocus = true, onChange, showIcon = false }) => {
    const [uses12h, setUses12h] = useState(detect12h);

    // Re-detect when user returns to the tab (catches settings changes)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                setUses12h(detect12h());
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    const ACTIVE_SEGMENTS = uses12h ? SEGMENTS_12H : SEGMENTS;

    const [values, setValues] = useState([null, null, null]);
    const [ampm, setAmpm] = useState("AM");
    const [isFocused, setIsFocused] = useState(false);
    const [activeSeg, setActiveSeg] = useState(0);
    const [pendingDigit, setPendingDigit] = useState(null);
    const [error, setError] = useState(false);
    const [errorText] = useState("invalid time");

    const inputRef = useRef(null);
    const suppressSelect = useRef(false);

    const displayValue = isFocused
        ? formatDisplay(...values)
        : values.every((v) => v === null)
            ? ""
            : formatDisplay(...values);

    const selectSegment = useCallback((segIdx) => {
        const seg = ACTIVE_SEGMENTS[segIdx];
        suppressSelect.current = true;

        requestAnimationFrame(() => {
            if (inputRef.current) {
                const { selectionStart, selectionEnd } = inputRef.current;
                if (selectionStart !== seg.start || selectionEnd !== seg.end) {
                    inputRef.current.setSelectionRange(seg.start, seg.end);
                }
            }
            requestAnimationFrame(() => {
                suppressSelect.current = false;
            });
        });
    }, [ACTIVE_SEGMENTS]);

    const commitSegment = useCallback((segIdx, val) => {
        setValues((prev) => {
            const next = [...prev];
            next[segIdx] = val;
            return next;
        });
    }, []);

    const advanceSegment = useCallback(
        (segIdx) => {
            setPendingDigit(null);
            if (segIdx < 2) {
                const next = segIdx + 1;
                setActiveSeg(next);
                selectSegment(next);
            } else {
                suppressSelect.current = true;
                inputRef.current?.blur();
            }
        },
        [selectSegment]
    );

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setError(false);
        setActiveSeg(0);
        setPendingDigit(null);
        selectSegment(0);
    }, [selectSegment]);

    const valuesRef = useRef(values);
    useEffect(() => { valuesRef.current = values; }, [values]);

    const ampmRef = useRef(ampm);
    useEffect(() => { ampmRef.current = ampm; }, [ampm]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        setPendingDigit(null);
        suppressSelect.current = false;
        const currentValues = valuesRef.current;
        setError(currentValues.some((v) => v === null));
        if (onChange) {
            const allSet = currentValues.every((v) => v !== null);
            onChange(
                allSet
                    ? {
                        hours: currentValues[0],
                        minutes: currentValues[1],
                        seconds: currentValues[2],
                        ...(uses12h && { ampm: ampmRef.current }),
                    }
                    : null
            );
        }
    }, [onChange, uses12h]);

    const handleClick = useCallback(() => {
        if (!isFocused) return;
        const pos = inputRef.current?.selectionStart ?? 0;
        const seg = segmentIndex(pos);
        setActiveSeg(seg);
        setPendingDigit(null);
        selectSegment(seg);
    }, [isFocused, selectSegment]);

    const handleKeyDown = useCallback(
        (e) => {
            const seg = ACTIVE_SEGMENTS[activeSeg];

            if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
                e.preventDefault();
                const prev = Math.max(0, activeSeg - 1);
                setActiveSeg(prev);
                setPendingDigit(null);
                selectSegment(prev);
                return;
            }
            if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
                e.preventDefault();
                const next = Math.min(2, activeSeg + 1);
                setActiveSeg(next);
                setPendingDigit(null);
                selectSegment(next);
                return;
            }

            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                const current = values[activeSeg] ?? seg.min;
                let next;
                if (e.key === "ArrowUp") {
                    next = current + step > seg.max ? seg.min : current + step;
                } else {
                    next = current - step < seg.min ? seg.max : current - step;
                }
                commitSegment(activeSeg, next);
                setPendingDigit(null);
                selectSegment(activeSeg);
                return;
            }

            if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    setValues([null, null, null]);
                    setPendingDigit(null);
                    setActiveSeg(0);
                    selectSegment(0);
                } else {
                    commitSegment(activeSeg, null);
                    setPendingDigit(null);
                    if (activeSeg > 0) {
                        const prev = activeSeg - 1;
                        setActiveSeg(prev);
                        selectSegment(prev);
                    } else {
                        selectSegment(activeSeg);
                    }
                }
                return;
            }

            if (/^\d$/.test(e.key)) {
                e.preventDefault();
                const digit = parseInt(e.key, 10);

                if (pendingDigit !== null) {
                    const finalValue = pendingDigit * 10 + digit;
                    const clamped = Math.min(Math.max(finalValue, seg.min), seg.max);
                    commitSegment(activeSeg, clamped);
                    setPendingDigit(null);
                    advanceSegment(activeSeg);
                } else {
                    commitSegment(activeSeg, digit);
                    setPendingDigit(digit);
                    selectSegment(activeSeg);
                }
                return;
            }

            if (e.key.length === 1) {
                e.preventDefault();
            }
        },
        [activeSeg, values, pendingDigit, commitSegment, advanceSegment, selectSegment, ACTIVE_SEGMENTS]
    );

    const handleInput = useCallback(
        (e) => {
            const type = e.nativeEvent.inputType;
            if (type === "deleteContentBackward" || type === "deleteContentForward") {
                commitSegment(activeSeg, null);
                setPendingDigit(null);
                if (activeSeg > 0) {
                    const prev = activeSeg - 1;
                    setActiveSeg(prev);
                    selectSegment(prev);
                } else {
                    selectSegment(activeSeg);
                }
            }
        },
        [activeSeg, commitSegment, selectSegment]
    );

    const handleSelect = useCallback(() => {
        if (suppressSelect.current || !isFocused) return;
        const pos = inputRef.current?.selectionStart ?? 0;
        const seg = segmentIndex(pos);
        if (seg !== activeSeg) {
            setActiveSeg(seg);
            setPendingDigit(null);
        }
        selectSegment(seg);
    }, [isFocused, activeSeg, selectSegment]);

    const renderIcon = () => {
        if (!showIcon) return null;
        return (
            <span className={`time-icon ${isFocused && fadeIconOnFocus ? "fade-out" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </span>
        );
    };

    const shouldFadeOut = isFocused && fadeIconOnFocus;
    const id = `time-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const allEmpty = values.every((v) => v === null);

    return (
        <div className={`time ${showIcon ? "has-icon" : ""} ${shouldFadeOut ? "icon-faded" : ""} ${uses12h ? "has-ampm" : ""}`}>
            <label className="time-label" htmlFor={id}><p>{label}</p></label>
            <div
                className="time-wrapper"
                onMouseDown={(e) => {
                    if (e.target !== inputRef.current) {
                        e.preventDefault();
                    }
                }}
            >
                {renderIcon()}
                <input
                    ref={inputRef}
                    disabled={disabled}
                    type="text"
                    inputMode="numeric"
                    name="time"
                    placeholder={`${PLACEHOLDER}\u2236${PLACEHOLDER}\u2236${PLACEHOLDER}`}
                    autoComplete="off"
                    className={`time-input${error ? " error" : ""}${!isFocused && allEmpty ? " placeholder" : ""}`}
                    value={isFocused || !allEmpty ? displayValue : ""}
                    id={id}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    onSelect={handleSelect}
                    spellCheck={false}
                />
                {uses12h && (
                    <button
                        type="button"
                        className="time-ampm"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setAmpm((p) => (p === "AM" ? "PM" : "AM"));
                        }}
                        aria-label={`Switch to ${ampm === "AM" ? "PM" : "AM"}`}
                    >
                        {ampm}
                    </button>
                )}
            </div>
            <span className={`time-error${error ? " visible" : ""}`}>
                <small>{errorText}</small>
            </span>
        </div>
    );
};