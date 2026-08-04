import React from "react";
import { createRoot } from 'react-dom/client';
import './Toast.scss';
import PropTypes from "prop-types";
import { Button } from "../button/Button";

let toastId = 0;
const toasts = new Map();
let sharedContainer = null;
let sharedRoot = null;

const MAX_VISIBLE = 3;

const getOrCreateContainer = () => {
    if (!sharedContainer) {
        sharedContainer = document.createElement('div');
        sharedContainer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(sharedContainer);
        sharedRoot = createRoot(sharedContainer);
    }
    return sharedRoot;
};

const renderToasts = () => {
    if (!sharedRoot) return;
    sharedRoot.render(<ToastStack toasts={[...toasts.values()]} />);
};

const ToastStack = ({ toasts }) => {
    const positions = ['top-left', 'top-right', 'top-middle', 'bottom-left', 'bottom-right', 'bottom-middle'];

    return positions.map(position => {
        const group = toasts.filter(t => t.position === position);
        if (!group.length) return null;

        const visible = group.slice(-MAX_VISIBLE);
        const total = visible.length;

        return (
            <div key={position} className={`toast-stack ${position}`}>
                {visible.map((t, index) => {
                    const offset = (total - 1) - index;
                    return <Toast key={t.id} {...t} offset={offset} total={total} />;
                })}
            </div>
        );
    });
};

const Toast = ({
    enableSound = true,
    id,
    type = 'success',
    duration = 4000,
    message,
    description,
    position = 'bottom-left',
    cancelText,
    onCancel,
    confirmText,
    onConfirm,
    close,
    offset,
    total,
    neutral = false,
}) => {
    const [isLeaving, setIsLeaving] = React.useState(false);

    const closeToast = () => {
        setIsLeaving(true);
        setTimeout(close, 300);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeToast();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeToast();
    };

    React.useEffect(() => {
        if (duration <= 0) return;
        const timer = setTimeout(closeToast, duration);
        return () => clearTimeout(timer);
    }, []);

    const renderIcon = () => {
        const iconMap = {
            'success': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
            'error': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>,
            'warning': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
            'info': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
        };
        return iconMap[type] || iconMap['info'];
    };

    const collapsedStyle = {
        '--offset': offset,
        transform: `scale(${1 - offset * 0.05})`,
        opacity: 1 - offset * 0.15,
        zIndex: 100 - offset,
    };

    // Determine the actual class name based on neutral prop
    const toastClass = `toast ${neutral ? 'neutral' : type} ${position} ${isLeaving ? 'leaving' : ''}`;

    return (
        <div
            className={toastClass}
            style={collapsedStyle}
        >
            <div className="content">
                {renderIcon()}
                <div>
                    <p className="toastMessage">{message}</p>
                    {description && <p className="toastDescription">{description}</p>}
                </div>
            </div>
            <Button
                className="close"
                variant="ghost"
                colorScheme={neutral ? "neutralColor" : `${type}Color`}
                size="small"
                buttonType="icon"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                }
                onClick={closeToast}
                enableSound={enableSound}
            />
            {(cancelText || confirmText) && (
                <div className="actions">
                    {cancelText && (
                        <Button
                            variant="ghost"
                            colorScheme={neutral ? "grayColor" : `${type}Color`}
                            onClick={handleCancel}
                            label={cancelText}
                            enableSound={enableSound}
                        />
                    )}
                    {confirmText && (
                        <Button
                            variant="primary"
                            colorScheme={neutral ? "grayColor" : `${type}Color`}
                            onClick={handleConfirm}
                            label={confirmText}
                            enableSound={enableSound}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

Toast.propTypes = {
    enableSound: PropTypes.bool,
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    message: PropTypes.string.isRequired,
    description: PropTypes.string,
    position: PropTypes.oneOf(['top-left', 'top-right', 'top-middle', 'bottom-left', 'bottom-right', 'bottom-middle']),
    cancelText: PropTypes.string,
    onCancel: PropTypes.func,
    confirmText: PropTypes.string,
    onConfirm: PropTypes.func,
    close: PropTypes.func.isRequired,
    offset: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    neutral: PropTypes.bool,
};

export const toast = ({
    type = 'success',
    message,
    description,
    position = 'bottom-right',
    duration = 4000,
    cancel,
    accept,
    onCancel,
    onAccept,
    enableSound = true,
    neutral = false
}) => {
    const id = toastId++;

    const close = () => {
        toasts.delete(id);
        renderToasts();
    };

    toasts.set(id, {
        id,
        type,
        message,
        description,
        position,
        duration,
        cancelText: cancel,
        confirmText: accept,
        onCancel,
        onConfirm: onAccept,
        enableSound,
        neutral,
        close,
    });

    getOrCreateContainer();
    renderToasts();

    return id;
};