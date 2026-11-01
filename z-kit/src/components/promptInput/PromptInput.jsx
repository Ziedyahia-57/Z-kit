import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import "./PromptInput.scss"
import { Button } from '../button/Button';
import { Attachment } from '../attachment/Attachment';
import { Select } from '../select/Select';
import { Dropdown, DropdownWrapper, DropdownTrigger, DropdownGroup, GroupTitle, GroupItem } from '../dropdown/Dropdown';

// Keep this in sync with the `.prompt-input` max-height in PromptInput.scss
const DEFAULT_MAX_TEXTAREA_HEIGHT = 128;

// Good enough unique id for a client-side list key. Falls back gracefully in
// environments without crypto.randomUUID (older Safari, some SSR setups).
const makeId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 *
 * @typedef {Object} PromptModel
 * @property {string} id
 * @property {string} name
 * @property {string} provider - e.g. "Claude", "ChatGPT" — used to group models in the dropdown
 *
 *
 */

/**
 * Chat-style prompt input: an auto-growing textarea and pasted-file attachments
 * rendered side by side.
 *
 * Uncontrolled by default — it manages its own text and attachment state
 * internally. Enter (or the send button) submits and clears both; Shift+Enter
 * inserts a newline.
 *
 * @param {Object} props
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {(value: string) => void} [props.onChange] - fires on every keystroke
 * @param {() => void} [props.onFocus]
 * @param {() => void} [props.onBlur]
 * @param {(value: string, attachments: Array<Object>) => void} [props.onSubmit] - fires on submit; input & attachments are cleared right after
 * @param {(file: File) => void} [props.onAttach] - fires once per pasted file; hand it off to your real upload logic
 * @param {PromptModel[]} [props.models] - omit/empty hides the model dropdown entirely
 * @param {number} [props.maxTextareaHeight] - px; must match the SCSS max-height to stay in sync (default 128)
 * @param {number} [props.maxAttachments] - caps how many attachments can be attached at once (default unlimited)
 * @param {React.ReactNode} [props.children]
 */
export const PromptInput = ({
    placeholder,
    disabled,
    onChange,
    onFocus,
    onBlur,
    onSubmit,
    onAttach,
    models = [],
    maxTextareaHeight = DEFAULT_MAX_TEXTAREA_HEIGHT,
    maxAttachments = Infinity,
    children
}) => {
    const [inputValue, setInputValue] = useState('');
    const [attachments, setAttachments] = useState([]);

    // Selection state for the response settings — defaults come from the first model
    const [selectedModel, setSelectedModel] = useState(models[0]);

    const textareaRef = useRef(null);
    const uploadTimers = useRef(new Map()); // attachmentId -> intervalId

    // Auto-grow the textarea with content, capped at maxTextareaHeight. Combined
    // with `resize: none` + fixed line-height in the SCSS, this is what gives us
    // the "any AI chat input" feel instead of a raw, manually-resizable <textarea>.
    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, maxTextareaHeight)}px`;
    }, [inputValue, maxTextareaHeight]);

    // Stop any in-flight fake-upload intervals on unmount so they never touch unmounted state
    useEffect(() => () => {
        uploadTimers.current.forEach((timerId) => clearInterval(timerId));
        uploadTimers.current.clear();
    }, []);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        onChange?.(e.target.value);
    };

    const clearUploadTimer = (id) => {
        const timerId = uploadTimers.current.get(id);
        if (timerId) {
            clearInterval(timerId);
            uploadTimers.current.delete(id);
        }
    };

    const updateAttachment = (id, patch) => {
        setAttachments((current) => current.map((att) => (
            att.id === id ? { ...att, ...patch } : att
        )));
    };

    // Fake, replaceable upload progress so each Attachment pill has something to show.
    // Swap the body of this function for a real upload call when the API exists —
    // it just needs to call updateAttachment(id, { status, progress, ... }) as it goes.
    const simulateUpload = (id) => {
        clearUploadTimer(id);
        let progress = 0;

        const timerId = setInterval(() => {
            progress += 20;

            if (progress >= 100) {
                clearUploadTimer(id);
                updateAttachment(id, {
                    status: 'complete',
                    indeterminate: false,
                    progress: 100,
                    errorMessage: undefined
                });
                return;
            }

            updateAttachment(id, {
                status: 'uploading',
                indeterminate: false,
                progress
            });
        }, 200);

        uploadTimers.current.set(id, timerId);
    };

    const removeAttachment = (id) => {
        clearUploadTimer(id);
        setAttachments((current) => current.filter((att) => att.id !== id));
    };

    // Pasted files are handled here — plain text paste is left to the browser.
    // Supports pasting multiple files at once (e.g. copying several images together).
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const fileItems = Array.from(items).filter((item) => item.kind === 'file');
        if (!fileItems.length) return;

        e.preventDefault();

        const remainingSlots = Math.max(maxAttachments - attachments.length, 0);
        fileItems.slice(0, remainingSlots).forEach((item) => {
            const file = item.getAsFile();
            if (!file) return;

            const id = makeId();

            setAttachments((current) => [...current, {
                id,
                name: file.name,
                size: file.size,
                status: 'uploading',
                indeterminate: true,
                progress: 0,
                errorMessage: undefined
            }]);

            onAttach?.(file);
            simulateUpload(id);
        });
    };


    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    const isUploading = attachments.some((att) => att.status === 'uploading');
    const canSubmit = !disabled && !isUploading && (inputValue.trim().length > 0 || attachments.length > 0);

    const handleSubmit = useCallback(() => {
        if (!canSubmit) return;
        onSubmit?.(inputValue.trim(), attachments);
        setInputValue('');
        setAttachments([]);
    }, [canSubmit, onSubmit, inputValue, attachments]);

    // Enter sends, Shift+Enter inserts a newline — standard chat-input behaviour.
    // The isComposing check keeps this from firing mid-IME-composition (e.g. typing Japanese/Chinese/Korean).
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const modelsByProvider = React.useMemo(() => {
        return models.reduce((groups, model) => {
            const provider = model.provider ?? 'Other';
            if (!groups[provider]) groups[provider] = [];
            groups[provider].push(model);
            return groups;
        }, {});
    }, [models]);

    const hasMultipleModels = models.length > 1;

    return (
        <div className="prompt">
            {attachments.length > 0 && (
                <div className="attachments">
                    {attachments.map((attachment) => (
                        <Attachment
                            key={attachment.id}
                            name={attachment.name}
                            errorMessage={attachment.errorMessage}
                            status={attachment.status}
                            indeterminate={attachment.indeterminate}
                            progress={attachment.progress}
                            size={attachment.size}
                            onRemove={() => removeAttachment(attachment.id)}
                        />
                    ))}
                </div>
            )}

            <textarea
                ref={textareaRef}
                placeholder={placeholder}
                className="prompt-input"
                rows={1}
                value={inputValue}
                disabled={disabled}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
            />
            <div className="prompt-settings">
                <div className="tools">
                    <Button
                        variant="secondary" size="small"
                        buttonType="icon"
                        aria-label="Add attachment"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-icon lucide-plus">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </Button>
                    <Button
                        variant="secondary" size="small"
                        buttonType="icon"
                        aria-label="Search the web"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe-icon lucide-globe">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                            <path d="M2 12h20" />
                        </svg>
                    </Button>
                    <Button
                        variant="secondary" size="small"
                        buttonType="icon"
                        aria-label="Extended thinking"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-atom-icon lucide-atom">
                            <circle cx="12" cy="12" r="1" />
                            <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
                            <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
                        </svg>

                    </Button>
                </div>
                <div className="response">
                    <DropdownWrapper>
                        <DropdownTrigger>
                            <Select placeholder="Model" value={selectedModel?.name} disabled={disabled} />
                        </DropdownTrigger>

                        <Dropdown>
                            {hasMultipleModels && (
                                <DropdownGroup>
                                    <GroupTitle>Model</GroupTitle>
                                    <GroupItem mode="icons">
                                        {selectedModel?.name}
                                        <Dropdown>
                                            {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                                                <DropdownGroup key={provider}>
                                                    <GroupTitle>{provider}</GroupTitle>
                                                    {providerModels.map((model) => (
                                                        <GroupItem
                                                            key={model.id}
                                                            selected={selectedModel?.id === model.id}
                                                            onClick={() => handleModelSelect(model)}
                                                        >
                                                            {model.name}
                                                        </GroupItem>
                                                    ))}
                                                </DropdownGroup>
                                            ))}
                                        </Dropdown>
                                    </GroupItem>
                                </DropdownGroup>
                            )}
                        </Dropdown>
                    </DropdownWrapper>

                    <Button
                        variant="secondary" size="small"
                        buttonType="icon"
                        aria-label="Dictate"
                    >

                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic-icon lucide-mic">
                            <path d="M12 19v3" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <rect x="9" y="2" width="6" height="13" rx="3" />
                        </svg>
                    </Button>

                    <Button
                        variant="primary" size="small"
                        buttonType="icon"
                        aria-label="Send message"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    >

                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-icon lucide-arrow-up">
                            <path d="m5 12 7-7 7 7" />
                            <path d="M12 19V5" />
                        </svg>

                    </Button>
                </div>
            </div>
            {children}
        </div >
    );
};