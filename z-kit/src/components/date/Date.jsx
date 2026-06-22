import React, { useState, useRef, useCallback } from 'react';
import './Date.scss';

export const Date = ({ label = "label", disabled }) => {
    const [date, setDate] = useState(null);
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState("Invalid input");

    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    // Holds latest raw values so deferred validation always sees current state
    const stateRef = useRef({ day: '', month: '', year: '' });

    const validateAndSetDate = useCallback((d, m, y) => {
        if (!d || !m || !y || y.length < 4) {
            setDate(null);
            setError(false);
            return;
        }
        const dayNum = Number(d);
        const monthNum = Number(m);
        const yearNum = Number(y);
        const parsed = new window.Date(yearNum, monthNum - 1, dayNum);
        if (
            parsed.getFullYear() !== yearNum ||
            parsed.getMonth() + 1 !== monthNum ||
            parsed.getDate() !== dayNum
        ) {
            setError(true);
            setErrorText("invalid date");
            setDate(null);
        } else {
            setError(false);
            setDate(
                `${String(yearNum).padStart(4, '0')}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            );
        }
    }, []);

    const handleChange = (e) => {
        setError(false);
        const { name, value } = e.target;
        if (!/^\d*$/.test(value)) return; // reject anything non-numeric

        if (name === 'day') {
            if (value === '') { setDay(''); stateRef.current.day = ''; return; }
            if (value.length > 2) return;
            const num = Number(value);
            if (num >= 0 && num <= 31) {
                setDay(value);
                stateRef.current.day = value;
                if (value.length === 2) monthRef.current.focus();
            }
        }
        if (name === 'month') {
            if (value === '') { setMonth(''); stateRef.current.month = ''; return; }
            if (value.length > 2) return;
            const num = Number(value);
            if (num >= 0 && num <= 12) {
                setMonth(value);
                stateRef.current.month = value;
                if (value.length === 2) yearRef.current.focus();
            }
        }
        if (name === 'year') {
            if (value === '') { setYear(''); stateRef.current.year = ''; return; }
            if (value.length > 4) return;
            const num = Number(value);
            if (num >= 0 && num <= 9999) {
                setYear(value);
                stateRef.current.year = value;
            }
        }
    };

    const handleKeyDown = (e) => {
        const { name, value } = e.target;
        const cursorPos = e.target.selectionStart;

        // Escape to exit input
        if (event.key === 'Escape') {
            event.target.blur();
        }

        // Arrow-left / Arrow-right navigation by cursor position
        if (e.key === 'ArrowLeft' && cursorPos === 0) {
            if (name === 'month') { e.preventDefault(); dayRef.current?.focus(); }
            if (name === 'year') { e.preventDefault(); monthRef.current?.focus(); }
        }
        if (e.key === 'ArrowRight' && cursorPos === value.length) {
            if (name === 'day') { e.preventDefault(); monthRef.current?.focus(); }
            if (name === 'month') { e.preventDefault(); yearRef.current?.focus(); }
        }

        // Backspace — move to previous field when empty
        if (e.key === 'Backspace' && (value.length <= 1)) {
            if (name === 'month' && day.length !== 0) setTimeout(() => dayRef.current?.focus());
            if (name === 'month' && value.length === 0) {
                e.preventDefault();

                // Delete the last character from day input
                if (day.length > 0) {
                    const newDay = day.slice(0, -1);
                    setDay(newDay);
                    stateRef.current.day = newDay;

                    // Focus day after state update
                    setTimeout(() => dayRef.current?.focus(), 0);
                } else {
                    setTimeout(() => dayRef.current?.focus(), 0);
                }
            }
            if (name === 'year' && value.length === 0) {
                e.preventDefault();

                // Delete the last character from month input
                if (month.length > 0) {
                    const newMonth = month.slice(0, -1);
                    setMonth(newMonth);
                    stateRef.current.month = newMonth;

                    // Focus month after state update
                    setTimeout(() => monthRef.current?.focus(), 0);
                } else {
                    setTimeout(() => monthRef.current?.focus(), 0);
                }
            }
            if (name === 'year' && month.length !== 0) setTimeout(() => monthRef.current?.focus());
        }

        // Up/Down spin for day
        if (name === 'day') {
            const step = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setError(false);
                setDay(prev => String(Math.min(Math.max((Number(prev) || 0) + step, 1), 31)));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setError(false);
                setDay(prev => String(Math.min(Math.max((Number(prev) || 0) - step, 1), 31)));
            }
        }

        // Up/Down spin for month
        if (name === 'month') {
            const step = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setError(false);
                setMonth(prev => String(Math.min(Math.max((Number(prev) || 0) + step, 1), 12)));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setError(false);
                setMonth(prev => String(Math.min(Math.max((Number(prev) || 0) - step, 1), 12)));
            }
        }

        // Up/Down spin for year
        if (name === 'year') {
            const step = e.ctrlKey && e.shiftKey ? 100 : e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setError(false);
                setYear(prev => String(Math.min(Math.max((Number(prev) || 0) + step, 0), 9999)));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setError(false);
                setYear(prev => String(Math.min(Math.max((Number(prev) || 0) - step, 0), 9999)));
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        // Pad and update the blurred field immediately
        let paddedDay = stateRef.current.day;
        let paddedMonth = stateRef.current.month;
        let paddedYear = stateRef.current.year;

        if (name === 'day' && value) {
            const num = Number(value);
            if (num >= 1 && num <= 31) {
                paddedDay = String(num).padStart(2, '0');
                setDay(paddedDay);
                stateRef.current.day = paddedDay;
            }
        }
        if (name === 'month' && value) {
            const num = Number(value);
            if (num >= 1 && num <= 12) {
                paddedMonth = String(num).padStart(2, '0');
                setMonth(paddedMonth);
                stateRef.current.month = paddedMonth;
            }
        }
        if (name === 'year' && value) {
            const num = Number(value);
            if (num >= 0 && num <= 9999) {
                paddedYear = String(num).padStart(4, '0');
                setYear(paddedYear);
                stateRef.current.year = paddedYear;
            }
        }

        // Defer validation so the next field's value is already in stateRef
        setTimeout(() => {
            validateAndSetDate(
                stateRef.current.day,
                stateRef.current.month,
                stateRef.current.year
            );
        });
    };

    return (
        <div className='date'>
            <label className='date-label'><p>{label}</p></label>
            <div className='date-wrapper'>
                <input
                    ref={dayRef}
                    disabled={disabled}
                    type="text"
                    inputMode="numeric"
                    name="day"
                    placeholder='DD'
                    autoComplete="off"
                    className={`date-input ${error ? 'error' : ''}`}
                    value={day}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                />

                <input
                    ref={monthRef}
                    disabled={disabled}
                    type="text"
                    inputMode="numeric"
                    name="month"
                    placeholder='MM'
                    autoComplete="off"
                    className={`date-input ${error ? 'error' : ''}`}
                    value={month}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                />

                <input
                    ref={yearRef}
                    disabled={disabled}
                    type="text"
                    inputMode="numeric"
                    name="year"
                    placeholder='YYYY'
                    autoComplete="off"
                    className={`date-input ${error ? 'error' : ''}`}
                    value={year}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                />
            </div>
            <label className={`date-error ${error ? 'visible' : ''}`}>
                <small>{errorText}</small>
            </label>
        </div>
    );
};