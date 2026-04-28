import React from "react";
import './Toast.scss';
import PropTypes from "prop-types";
import { soundManager } from '../../utils/soundUtils';
import clickSoundFile from '../../assets/sounds/click.mp3';
import { Button } from "../button/Button"

export const Toast = ({
    message,
    type,
    duration = 3000,
    requiresAction = false,
    onClose,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    position = "bottom",
    index = 0,
    totalToasts = 1,
    enableSound = true,
}) => {
    const [visible, setVisible] = React.useState(true);

    const iconToRender = type;

    const renderIcon = () => {
        if (typeof iconToRender === 'string') {
            const iconMap = {
                'success': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
                'error': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban-icon lucide-ban"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>,
                'warning': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
                'info': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
            };
            return iconMap[iconToRender] || iconMap['error'];

        }
        return iconToRender;
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleRemove = (e) => {
        e.stopPropagation();
        // Play sound using soundManager
        if (enableSound) {
            soundManager.play('click', 1);
        }
        setVisible(false);
    };

    return <div className={`toast ${type} ${visible ? 'visible' : ''}`}>
        <div className="content">
            {type && renderIcon()}
            <p className="toastMessage">{message}</p>
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
            onClick={handleRemove} enableSound={enableSound}
        />
        {requiresAction && (
            <div className="actions">
                <Button variant="ghost" colorScheme={`${type}Color`} onClick={onCancel} label={cancelText} enableSound={enableSound}></Button>
                <Button variant="primary" colorScheme={`${type}Color`} onClick={onConfirm} label={confirmText} enableSound={enableSound}></Button>
            </div>
        )}
    </div >
}

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    duration: PropTypes.number,
    requiresAction: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    position: PropTypes.string,
    index: PropTypes.number,
    totalToasts: PropTypes.number,
    enableSound: PropTypes.bool,
}

Toast.defaultProps = {
    message: 'This is a toast message',
    type: 'success',
    duration: 30000,
    requiresAction: false,
    onClose: () => { },
    onConfirm: () => { },
    onCancel: () => { },
    index: 0,
    totalToasts: 1,
    enableSound: true,
}