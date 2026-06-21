import React, { useState, useRef, useCallback, useEffect } from 'react';
import './OTP.scss';

// Guards against non-string props (e.g. an unresolved i18n object) ever
// being rendered as a React child or stuffed into a DOM attribute, which
// either throws ("Objects are not valid as a React child") or renders as
// the literal text "[object Object]".
const safeText = (value, fallback = '') =>
    typeof value === 'string' ? value : fallback;

export const OTP = ({
    label = "label",
    disabled = false,
    slots = 6,
    onComplete, // Callback when OTP is fully entered
    onError,    // Callback when there's a validation error
    onValueChange, // Callback for every value change
    validate,   // Custom validation function
    autoFocus = true,
    placeholder = '',
    errorMessage = "Please fill in all OTP fields",
    allowAlphanumeric = false // When true, allows letters + digits; default is numbers only
}) => {
    // Coerce once up front so every downstream use is guaranteed a string.
    const safeErrorMessage = safeText(errorMessage, "Please fill in all OTP fields");
    const safeLabel = safeText(label);
    const safePlaceholder = safeText(placeholder);

    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState(safeErrorMessage);
    const [values, setValues] = useState(Array(slots).fill(''));
    const inputRefs = useRef([]);
    const [isComponentFocused, setIsComponentFocused] = useState(false);

    // Always-current mirror of `values`. We update this synchronously in
    // `updateValues` (not via a useEffect) because several handlers call
    // setValues() and then immediately move focus in the same tick — if the
    // ref only caught up after a render, those focus handlers would see
    // stale data and could bounce focus back to the wrong slot.
    const valuesRef = useRef(values);
    const updateValues = useCallback((newValues) => {
        valuesRef.current = newValues;
        setValues(newValues);
    }, []);

    // Character validation regex depending on mode
    const charPattern = allowAlphanumeric ? /^[a-zA-Z0-9]$/ : /^\d$/;
    const stripPattern = allowAlphanumeric ? /[^a-zA-Z0-9]/g : /\D/g;

    // Initialize refs array
    const setInputRef = useCallback((index) => (ref) => {
        if (ref) {
            inputRefs.current[index] = ref;
        }
    }, []);

    // Auto focus first input
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    // Notify parent of value changes
    useEffect(() => {
        if (onValueChange) {
            onValueChange(values.join(''));
        }
    }, [values, onValueChange]);

    // Check if all fields are filled
    const isComplete = useCallback(() => {
        return values.every(v => v !== '');
    }, [values]);

    // Custom validation
    const validateOTP = useCallback(() => {
        const currentValue = valuesRef.current.join('');
        if (validate) {
            const result = validate(currentValue);
            if (result !== true) {
                setError(true);
                setErrorText(safeText(result, safeErrorMessage));
                return false;
            }
        }
        return true;
    }, [validate, safeErrorMessage]);

    // Blur whichever input is currently focused (used once OTP is complete)
    const blurActiveInput = useCallback(() => {
        const activeElement = document.activeElement;
        if (inputRefs.current.some(ref => ref === activeElement)) {
            activeElement.blur();
        }
    }, []);

    const handleChange = useCallback((index, newValue) => {
        // Only allow single character
        if (newValue.length > 1) return;

        // Only allow digits or alphanumerics depending on mode
        if (newValue && !charPattern.test(newValue)) return;

        if (newValue === '' && values[index] !== '') {
            const newValues = [...values];
            for (let i = index; i < slots - 1; i++) {
                newValues[i] = newValues[i + 1];
            }
            newValues[slots - 1] = '';
            updateValues(newValues);
            setError(false);
            // Keep focus on the same slot (it now holds what used to be the next value)
            inputRefs.current[index]?.focus();
            return;
        }

        const updatedValues = [...values];
        updatedValues[index] = newValue;
        updateValues(updatedValues);
        setError(false);

        const allFilled = updatedValues.every(v => v !== '');

        // Check if all fields are filled
        if (allFilled) {
            // Validate the complete OTP
            const isValid = validateOTP();
            if (isValid && onComplete) {
                onComplete(updatedValues.join(''));
            }
            // Blur out of all inputs once complete
            blurActiveInput();
            return;
        }

        // Move focus to next input if current input is filled
        if (newValue.length === 1 && index < slots - 1) {
            inputRefs.current[index + 1]?.focus();
            // Select the text in the next input if it's filled
            if (updatedValues[index + 1] !== '') {
                inputRefs.current[index + 1]?.select();
            }
        }
    }, [values, slots, validateOTP, onComplete, charPattern, blurActiveInput, updateValues]);

    const handleKeyDown = useCallback((e, index) => {
        const currentValue = values[index];
        const firstEmptyIndex = values.findIndex(v => v === '');

        // Ctrl+Backspace (or Cmd+Backspace) - clear all values
        if ((e.key === 'Backspace' || e.inputType === "deleteContentBackward") && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            updateValues(Array(slots).fill(''));
            setError(false);
            inputRefs.current[0]?.focus();
            return;
        }

        // Escape key - blur and validate
        if (e.key === 'Escape') {
            e.preventDefault();
            inputRefs.current[index]?.blur();
            const anyFilled = values.some(v => v !== '');
            if (!isComplete() && anyFilled) {
                setError(true);
                setErrorText(safeErrorMessage);
                if (onError) {
                    onError("Incomplete OTP");
                }
            }
            return;
        }

        // Tab key - validate on tab out
        if (e.key === 'Tab') {
            // Let the blur handler deal with validation
            return;
        }

        // Arrow Right - navigate to next input
        // Only allowed to move into the next filled slot, or the first empty slot
        if (e.key === 'ArrowRight' && index < slots - 1) {
            e.preventDefault();
            const nextIndex = index + 1;
            const canMoveToNext =
                values[nextIndex] !== '' || // next slot already has a value
                nextIndex === firstEmptyIndex || // next slot IS the first empty slot
                firstEmptyIndex === -1; // everything filled

            if (canMoveToNext) {
                inputRefs.current[nextIndex]?.focus();
                if (values[nextIndex] !== '') {
                    inputRefs.current[nextIndex]?.select();
                }
            }
            return;
        }

        // Arrow Left - navigate to previous input
        if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            const previousIndex = index - 1;
            inputRefs.current[previousIndex]?.focus();
            if (values[previousIndex] !== '') {
                inputRefs.current[previousIndex]?.select();
            }
            return;
        }

        // Backspace - clear current or previous
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (currentValue.length === 0 && index > 0) {
                // If current field is empty, clear previous and focus it
                const newValues = [...values];
                newValues[index - 1] = '';
                updateValues(newValues);
                setError(false);
                inputRefs.current[index - 1]?.focus();
                setTimeout(() => {
                    inputRefs.current[index - 1]?.select();
                })
            } else if (currentValue.length > 0) {
                // If current field has value, clear it
                const newValues = [...values];
                for (let i = index; i < slots - 1; i++) {
                    newValues[i] = newValues[i + 1];
                }
                newValues[slots - 1] = '';
                updateValues(newValues);
                setTimeout(() => {
                    inputRefs.current[index - 1]?.select();
                })
                setError(false);
            }
            return;
        }

        // Delete - shift all values left
        if (e.key === 'Delete' && index < slots - 1) {
            e.preventDefault();
            if (values[index] !== '') {
                // Shift all values left from this position
                const newValues = [...values];
                for (let i = index; i < slots - 1; i++) {
                    newValues[i] = newValues[i + 1];
                }
                newValues[slots - 1] = '';
                updateValues(newValues);
                setError(false);
                inputRefs.current[index]?.focus();
                setTimeout(() => {
                    inputRefs.current[index]?.select();
                })
            }
            return;
        }

        // Handle direct character input (for overriding existing values)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Only allow digits or alphanumerics depending on mode
            if (!charPattern.test(e.key)) {
                e.preventDefault();
                return;
            }

            // If current field has a value, move to next after setting
            if (currentValue.length > 0 && index < slots - 1) {
                e.preventDefault();
                const newValues = [...values];
                newValues[index] = e.key;
                updateValues(newValues);
                setError(false);

                const allFilled = newValues.every(v => v !== '');
                if (allFilled) {
                    const isValid = validateOTP();
                    if (isValid && onComplete) {
                        onComplete(newValues.join(''));
                    }
                    blurActiveInput();
                    return;
                }

                // Move to next input
                inputRefs.current[index + 1]?.focus();
                if (newValues[index + 1] !== '') {
                    inputRefs.current[index + 1]?.select();
                }
            }
        }
    }, [values, slots, safeErrorMessage, isComplete, onError, charPattern, validateOTP, onComplete, blurActiveInput, updateValues]);

    const handleBlur = useCallback((index) => {
        // Use a timeout to check if focus moved to another input in the same component
        setTimeout(() => {
            const activeElement = document.activeElement;
            const isInComponent = inputRefs.current.some(ref => ref === activeElement);

            // Only validate if focus has completely left the component
            if (!isInComponent) {
                setIsComponentFocused(false);

                // Read from the ref, not the closed-over `values`, since a
                // setValues() call (e.g. the one that completes the OTP and
                // triggers this blur) may not have re-rendered yet.
                const currentValues = valuesRef.current;
                const allFilled = currentValues.every(v => v !== '');
                const anyFilled = currentValues.some(v => v !== '');

                if (!allFilled && anyFilled) {
                    setError(true);
                    setErrorText(safeErrorMessage);
                    if (onError) {
                        onError("Incomplete OTP");
                    }
                } else if (allFilled) {
                    setError(false);
                    const isValid = validateOTP();
                    if (isValid && onComplete) {
                        onComplete(currentValues.join(''));
                    }
                } else {
                    // No fields filled, clear error
                    setError(false);
                }
            }
        }, 100);
    }, [validateOTP, onComplete, onError, safeErrorMessage]);

    const handleFocus = useCallback((index) => {
        const currentValues = valuesRef.current;
        const firstEmptyIndex = currentValues.findIndex(v => v === '');

        // If this slot is empty but isn't the first empty slot, redirect
        // focus to the slot the user is actually allowed to land on.
        if (currentValues[index] === '' && firstEmptyIndex !== -1 && index !== firstEmptyIndex) {
            inputRefs.current[firstEmptyIndex]?.focus();
            return;
        }

        setIsComponentFocused(true);
        setError(false);
        // Always select an input's existing value when it gains focus
        if (currentValues[index] !== '') {
            // Defer slightly so the select happens after the native focus/click behavior
            requestAnimationFrame(() => {
                inputRefs.current[index]?.select();
            });
        }
    }, []);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain')
            .replace(stripPattern, '') // Remove disallowed characters
            .slice(0, slots);

        if (pasteData.length === 0) return;

        const newValues = [...values];
        for (let i = 0; i < pasteData.length; i++) {
            if (i < slots) {
                newValues[i] = pasteData[i];
            }
        }
        updateValues(newValues);
        setError(false);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newValues.findIndex(v => v === '');
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            // Check if complete and valid
            if (isComplete()) {
                const isValid = validateOTP();
                if (isValid && onComplete) {
                    onComplete(newValues.join(''));
                }
            }
            // Blur out of all inputs once complete
            blurActiveInput();
            inputRefs.current[slots - 1]?.blur();
        }
    }, [values, slots, isComplete, validateOTP, onComplete, stripPattern, blurActiveInput, updateValues]);

    // Reset the component
    const reset = useCallback(() => {
        updateValues(Array(slots).fill(''));
        setError(false);
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [slots, updateValues]);

    // Expose reset method via ref
    React.useImperativeHandle(React.useRef(), () => ({
        reset,
        getValue: () => values.join(''),
        setValue: (newValues) => {
            if (newValues.length === slots) {
                updateValues(newValues.split(''));
            }
        }
    }), [reset, values, slots, updateValues]);

    // Get the OTP value
    const getOTPValue = useCallback(() => {
        return values.join('');
    }, [values]);

    return (
        <div className="otp" onPaste={handlePaste}>
            {safeLabel && (
                <label className='otp-label'>
                    <p>{safeLabel}</p>
                </label>
            )}
            <div className="otp-wrapper">
                {Array.from({ length: slots }, (_, index) => (
                    <input
                        key={index}
                        ref={setInputRef(index)}
                        type="text"
                        disabled={disabled}
                        className={`otp-input ${error ? 'error' : ''}`}
                        value={values[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onBlur={() => handleBlur(index)}
                        onFocus={() => handleFocus(index)}
                        onClick={() => {
                            const currentValues = valuesRef.current;
                            const firstEmptyIndex = currentValues.findIndex(v => v === '');
                            if (currentValues[index] === '' && firstEmptyIndex !== -1 && index !== firstEmptyIndex) {
                                inputRefs.current[firstEmptyIndex]?.focus();
                                return;
                            }
                            if (currentValues[index] !== '') {
                                inputRefs.current[index]?.select();
                            }
                        }}
                        maxLength={1}
                        autoComplete="one-time-code"
                        inputMode={allowAlphanumeric ? "text" : "numeric"}
                        pattern={allowAlphanumeric ? undefined : "[0-9]*"}
                        placeholder={safePlaceholder || undefined}
                        aria-label={`OTP digit ${index + 1}`}
                        aria-invalid={error}
                    />
                ))}
            </div>
            {error && (
                <label className="otp-error visible">
                    <small>{safeText(errorText, safeErrorMessage)}</small>
                </label>
            )}
        </div>
    );
};