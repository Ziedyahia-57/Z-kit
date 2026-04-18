import { useRef, useCallback, useEffect } from 'react';

export const useSound = (soundPath, options = {}) => {
    const { volume = 0.5, enabled = true } = options;
    const audioRef = useRef(null);

    useEffect(() => {
        if (enabled && soundPath) {
            audioRef.current = new Audio(soundPath);
            audioRef.current.volume = volume;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [soundPath, volume, enabled]);

    const play = useCallback(() => {
        if (!enabled || !audioRef.current) return;

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
            console.error('Sound playback failed:', err);
        });
    }, [enabled]);

    return { play };
};