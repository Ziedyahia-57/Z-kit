import React, { useState, useRef, useCallback, useEffect } from 'react';
import './Date.scss';
import { ScrollSegment } from '../common/ScrollSegment';

/**
 * Date input component with animated rolling segments and accelerated arrow key handling.
 */
export const Date = ({ label = "label", disabled }) => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('Invalid input');
    const [focusedField, setFocusedField] = useState(null);

    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    // Holds latest raw values for validation
    const stateRef = useRef({ day: '', month: '', year: '' });

    const validateAndSetDate = useCallback((d, m, y) => {
        // Don't validate if any field is empty
        if (!d || !m || !y) {
            setError(false);
            return;
        }

        const dayNum = Number(d);
        const monthNum = Number(m);
        const yearNum = Number(y);
        // Use setFullYear instead of the Date constructor: the constructor
        // remaps 2-digit years (0-99) to 1900-1999, which broke validation
        // for short/padded years like "0002" (a single typed digit).
        const parsed = new window.Date(0);
        parsed.setFullYear(yearNum, monthNum - 1, dayNum);
        if (
            parsed.getFullYear() !== yearNum ||
            parsed.getMonth() + 1 !== monthNum ||
            parsed.getDate() !== dayNum
        ) {
            setError(true);
            setErrorText('Invalid date');
        } else {
            setError(false);
        }
    }, []);

    const handleChange = (e) => {
        setError(false);
        const { name, value } = e.target;
        if (!/^\d*$/.test(value)) return; // reject non‑numeric
        if (name === 'day') {
            if (value === '') { setDay(''); stateRef.current.day = ''; return; }
            if (value.length > 2) return;
            if (value === '0') {
                setDay(value);
                stateRef.current.day = value;
                return;
            }
            const num = Number(value);
            if (num >= 1 && num <= 31) {
                setDay(value);
                stateRef.current.day = value;
                if (value.length === 2) {
                    setActiveSeg(1);
                }
            }
        } else if (name === 'month') {
            if (value === '') { setMonth(''); stateRef.current.month = ''; return; }
            if (value.length > 2) return;
            if (value === '0') {
                setMonth(value);
                stateRef.current.month = value;
                return;
            }
            const num = Number(value);
            if (num >= 1 && num <= 12) {
                setMonth(value);
                stateRef.current.month = value;
                if (value.length === 2) {
                    setActiveSeg(2);
                }
            }
        } else if (name === 'year') {
            if (value === '') { setYear(''); stateRef.current.year = ''; return; }
            if (value.length > 4) return;
            // Don't allow 0 to be typed as the first digit of the year
            if (value.length === 1 && value === '0') return;
            const num = Number(value);
            if (num >= 0 && num <= 9999) {
                setYear(value);
                stateRef.current.year = value;
            }
        }
    };

    // ----- Arrow‑key handling (spin + accelerate) -----
    const [spinDuration, setSpinDuration] = useState(150);
    const [spinDirection, setSpinDirection] = useState(null);
    const holdTimerRef = useRef(null);
    const holdIntervalRef = useRef(null);
    const currentIntervalRef = useRef(150);
    const activeKeyRef = useRef(null);
    const isShiftRef = useRef(false);
    const isCtrlRef = useRef(false);
    const [activeSeg, setActiveSeg] = useState(0); // 0=day,1=month,2=year

    const segmentInfo = [
        { name: 'day', min: 1, max: 31, ref: dayRef },
        { name: 'month', min: 1, max: 12, ref: monthRef },
        { name: 'year', min: 0, max: 9999, ref: yearRef },
    ];

    useEffect(() => {
        const seg = segmentInfo[activeSeg];
        if (seg && seg.ref.current && document.activeElement !== seg.ref.current) {
            if (focusedField !== null) {
                seg.ref.current.select();
            }
        }
    }, [activeSeg, focusedField]);

    const commitSegment = (idx, val) => {
        const v = String(val);
        if (idx === 0) { setDay(v); stateRef.current.day = v; }
        if (idx === 1) { setMonth(v); stateRef.current.month = v; }
        if (idx === 2) { setYear(v); stateRef.current.year = v; }
        // Re-select after commit so next typed digit replaces the value
        requestAnimationFrame(() => {
            segmentInfo[idx]?.ref.current?.select();
        });
    };

    const performStep = (key) => {
        const seg = segmentInfo[activeSeg];
        let step = 1;
        if (isShiftRef.current && isCtrlRef.current) {
            step = 100;
        } else if (isShiftRef.current) {
            step = 10;
        }
        const rawVal = stateRef.current[seg.name];
        const current = rawVal !== '' && rawVal !== null && rawVal !== undefined
            ? Number(rawVal)
            : 0;
        let next;
        if (key === 'ArrowUp') {
            next = current + step > seg.max ? seg.min : current + step;
        } else {
            next = current - step < seg.min ? seg.max : current - step;
        }
        commitSegment(activeSeg, next);
    };

    const runHoldInterval = () => {
        if (!activeKeyRef.current) return;
        performStep(activeKeyRef.current);
        const next = Math.max(25, currentIntervalRef.current * 0.85);
        currentIntervalRef.current = next;
        setSpinDuration(next);
        holdIntervalRef.current = setTimeout(runHoldInterval, next);
    };

    const stopHolding = () => {
        clearTimeout(holdTimerRef.current);
        clearTimeout(holdIntervalRef.current);
        holdTimerRef.current = null;
        holdIntervalRef.current = null;
        activeKeyRef.current = null;
        setSpinDuration(150);
        setTimeout(() => setSpinDirection(null), 300);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (activeSeg > 0) setActiveSeg(activeSeg - 1);
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (activeSeg < 2) setActiveSeg(activeSeg + 1);
            return;
        }
        if ((e.key === 'Backspace' || e.key === 'Delete') && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            setDay(''); stateRef.current.day = '';
            setMonth(''); stateRef.current.month = '';
            setYear(''); stateRef.current.year = '';
            setError(false);
            setActiveSeg(0);
            return;
        }
        if (e.key === 'Backspace') {
            e.preventDefault();
            const seg = segmentInfo[activeSeg];
            const fieldName = seg.name;
            const val = stateRef.current[fieldName];

            if (!val || val === '') {
                if (activeSeg > 0) {
                    setActiveSeg(activeSeg - 1);
                }
                return;
            }

            // Digit-by-digit deletion (matches year's native behavior)
            let newVal = val.slice(0, -1);

            // A lone/leading zero isn't a meaningful partial value — clear it
            if (newVal.startsWith('0')) {
                newVal = '';
            }

            if (fieldName === 'day') { setDay(newVal); stateRef.current.day = newVal; }
            if (fieldName === 'month') { setMonth(newVal); stateRef.current.month = newVal; }
            if (fieldName === 'year') { setYear(newVal); stateRef.current.year = newVal; }

            setError(false);
            return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (e.repeat) return;
            if (activeKeyRef.current === e.key) return;
            activeKeyRef.current = e.key;
            isShiftRef.current = e.shiftKey;
            isCtrlRef.current = e.ctrlKey;
            setSpinDirection(e.key === 'ArrowUp' ? 'up' : 'down');
            performStep(e.key);
            currentIntervalRef.current = 150;
            setSpinDuration(150);
            holdTimerRef.current = setTimeout(runHoldInterval, 350);
            return;
        }
    };

    const handleKeyUp = (e) => {
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.key === activeKeyRef.current) {
            stopHolding();
        }
    };

    useEffect(() => {
        return () => {
            clearTimeout(holdTimerRef.current);
            clearTimeout(holdIntervalRef.current);
        };
    }, []);

    const handleBlur = (e) => {
        const nextFocused = e.relatedTarget;
        const isStillInside = nextFocused && (
            nextFocused === dayRef.current ||
            nextFocused === monthRef.current ||
            nextFocused === yearRef.current
        );
        if (!isStillInside) {
            setFocusedField(null);
        }

        const { name, value } = e.target;
        if (name === 'day' && value) {
            const num = Number(value);
            if (num >= 1 && num <= 31) {
                const padded = String(num).padStart(2, '0');
                setDay(padded);
                stateRef.current.day = padded;
            }
        }
        if (name === 'month' && value) {
            const num = Number(value);
            if (num >= 1 && num <= 12) {
                const padded = String(num).padStart(2, '0');
                setMonth(padded);
                stateRef.current.month = padded;
            }
        }
        if (name === 'year' && value) {
            const num = Number(value);
            if (num >= 0 && num <= 9999) {
                const padded = String(num).padStart(4, '0');
                setYear(padded);
                stateRef.current.year = padded;
            }
        }

        // Only validate if we're leaving the component entirely
        if (!isStillInside) {
            // Check if any field has a value but not all are filled
            const hasAnyValue = stateRef.current.day || stateRef.current.month || stateRef.current.year;
            const allFilled = stateRef.current.day && stateRef.current.month && stateRef.current.year;

            if (hasAnyValue && !allFilled) {
                setError(true);
                setErrorText('Please fill in all date fields');
            } else if (allFilled) {
                // Validate the complete date
                validateAndSetDate(stateRef.current.day, stateRef.current.month, stateRef.current.year);
            } else {
                // All fields are empty
                setError(true);
                setErrorText('Please fill in all date fields');
            }
        }
    };

    const handleClick = (e) => {
        e.target.select();
    };

    const onFocus = (field) => {
        setFocusedField(field);
        setError(false); // Clear error when focusing
        const idx = segmentInfo.findIndex(s => s.name === field);
        if (idx !== -1) {
            setActiveSeg(idx);
            const ref = segmentInfo[idx].ref;
            if (ref.current) {
                ref.current.select();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();

        let parts;
        // If it contains a separator, split by it
        if (/[\-\/\.\s]/.test(pasted)) {
            parts = pasted.split(/[\-\/\.\s]+/).filter(p => /^\d+$/.test(p));
        } else {
            // Raw digits: first 2 = day/month, next 2 = month/day, rest = year
            const digits = pasted.replace(/\D/g, '');
            if (digits.length < 4) return;
            parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)];
        }

        if (!parts || parts.length === 0) return;

        // Map parts to segment order (day=0, month=1, year=2)
        const order = segmentInfo.map(s => s.name);
        const newVals = { day: '', month: '', year: '' };
        parts.forEach((part, i) => {
            if (i < order.length) newVals[order[i]] = part;
        });

        // Validate and commit each field
        if (newVals.day) {
            const n = Number(newVals.day);
            if (n >= 1 && n <= 31) {
                const v = String(n).padStart(2, '0');
                setDay(v); stateRef.current.day = v;
            }
        }
        if (newVals.month) {
            const n = Number(newVals.month);
            if (n >= 1 && n <= 12) {
                const v = String(n).padStart(2, '0');
                setMonth(v); stateRef.current.month = v;
            }
        }
        if (newVals.year) {
            const n = Number(newVals.year);
            if (n >= 0 && n <= 9999) {
                const v = String(n).padStart(newVals.year.length >= 4 ? 4 : 2, '0');
                setYear(v); stateRef.current.year = v;
            }
        }

        // Focus year if all filled, else focus first empty
        const filled = order.filter(name => stateRef.current[name] !== '');
        const firstEmpty = order.find(name => stateRef.current[name] === '');
        const focusTarget = firstEmpty ?? order[order.length - 1];
        const focusIdx = order.indexOf(focusTarget);
        setActiveSeg(focusIdx);
        setFocusedField(focusTarget);
        requestAnimationFrame(() => {
            segmentInfo[focusIdx]?.ref.current?.select();
        });

        setTimeout(() => {
            validateAndSetDate(stateRef.current.day, stateRef.current.month, stateRef.current.year);
        });
    };

    return (
        <div className='date'>
            <label className='date-label'><p>{label}</p></label>
            <div className='date-wrapper'>
                {/* Day */}
                <div className='date-input-wrapper'>
                    <input
                        ref={dayRef}
                        name='day'
                        disabled={disabled}
                        type='text'
                        inputMode='numeric'
                        placeholder='DD'
                        autoComplete='off'
                        className={`date-input ${error ? 'error' : ''} custom-render`}
                        value={day}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                        onFocus={() => onFocus('day')}
                        onClick={handleClick}
                        onPaste={handlePaste}
                    />
                    <div className={`date-visual-overlay${day === '' ? ' is-placeholder' : ''}`}>
                        <ScrollSegment
                            value={day === '' ? null : Number(day)}
                            min={1}
                            max={31}
                            isActive={activeSeg === 0 && focusedField === 'day'}
                            isFocused={focusedField !== null}
                            spinDuration={spinDuration}
                            spinDirection={spinDirection}
                            placeholder="DD"
                            padLength={2}
                        />
                    </div>
                </div>
                {/* Month */}
                <div className='date-input-wrapper'>
                    <input
                        ref={monthRef}
                        name='month'
                        disabled={disabled}
                        type='text'
                        inputMode='numeric'
                        placeholder='MM'
                        autoComplete='off'
                        className={`date-input ${error ? 'error' : ''} custom-render`}
                        value={month}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                        onFocus={() => onFocus('month')}
                        onClick={handleClick}
                        onPaste={handlePaste}
                    />
                    <div className={`date-visual-overlay${month === '' ? ' is-placeholder' : ''}`}>
                        <ScrollSegment
                            value={month === '' ? null : Number(month)}
                            min={1}
                            max={12}
                            isActive={activeSeg === 1 && focusedField === 'month'}
                            isFocused={focusedField !== null}
                            spinDuration={spinDuration}
                            spinDirection={spinDirection}
                            placeholder="MM"
                            padLength={2}
                        />
                    </div>
                </div>
                {/* Year */}
                <div className='date-input-wrapper'>
                    <input
                        ref={yearRef}
                        name='year'
                        disabled={disabled}
                        type='text'
                        inputMode='numeric'
                        placeholder='YYYY'
                        autoComplete='off'
                        className={`date-input ${error ? 'error' : ''} custom-render`}
                        value={year}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                        onFocus={() => onFocus('year')}
                        onClick={handleClick}
                        onPaste={handlePaste}
                    />
                    <div className={`date-visual-overlay${year === '' ? ' is-placeholder' : ''}`}>
                        <ScrollSegment
                            value={year === '' ? null : Number(year)}
                            min={0}
                            max={9999}
                            isActive={activeSeg === 2 && focusedField === 'year'}
                            isFocused={focusedField !== null}
                            spinDuration={spinDuration}
                            spinDirection={spinDirection}
                            placeholder="YYYY"
                            padLength={4}
                        />
                    </div>
                </div>
            </div>
            <label className={`date-error ${error ? 'visible' : ''}`}><small>{errorText}</small></label>
        </div>
    );
};