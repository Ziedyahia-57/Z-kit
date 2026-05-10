import React from "react";
import { createRoot } from 'react-dom/client';
import './Toast.scss';
import PropTypes from "prop-types";
import { soundManager } from "../../utils/soundUtils";
import { Button } from "../button/Button";

let toastId = 0;
const toasts = new Map();

const Toast = ({
    enableSound = true,
    id,
    type = 'success',
    duration = 3000,
    message,
    description,
    position = 'bottom-left',
    cancelText,
    onCancel,
    confirmText,
    onConfirm
}) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const closeToast = () => {
        setIsVisible(false);
        setTimeout(() => {
            const element = toasts.get(id);
            if (element) {
                element.root.unmount();
                document.body.removeChild(element.container);
                toasts.delete(id);
            }
        }, 300);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeToast();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeToast();
    };

    if (!isVisible) return null;

    const renderIcon = () => {
        const iconMap = {
            'success': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
            'error': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>,
            'warning': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
            'info': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
        };
        return iconMap[type] || iconMap['info'];
    };

    return (
        <div className={`toast ${type}`}>
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
                colorScheme={`${type}Color`}
                size="small"
                buttonType="icon"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x">
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
                            colorScheme={`${type}Color`}
                            onClick={handleCancel}
                            label={cancelText}
                            enableSound={enableSound}
                        />
                    )}
                    {confirmText && (
                        <Button
                            variant="primary"
                            colorScheme={`${type}Color`}
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
    position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    cancelText: PropTypes.string,
    onCancel: PropTypes.func,
    confirmText: PropTypes.string,
    onConfirm: PropTypes.func
};

export const toast = ({
    type = 'success',
    message,
    description,
    position = "bottom-right",
    duration = 3000,
    cancel,
    accept,
    onCancel,
    onAccept,
    enableSound = true
}) => {
    const id = toastId++;

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    root.render(
        <Toast
            id={id}
            type={type}
            message={message}
            description={description}
            position={position}
            duration={duration}
            cancelText={cancel}
            confirmText={accept}
            onCancel={onCancel}
            onConfirm={onAccept}
            enableSound={enableSound}
        />
    );

    toasts.set(id, { root, container });

    if (duration > 0) {
        setTimeout(() => {
            const toastItem = toasts.get(id);
            if (toastItem) {
                toastItem.root.unmount();
                document.body.removeChild(toastItem.container);
                toasts.delete(id);
            }
        }, duration);
    }

    return id;
};