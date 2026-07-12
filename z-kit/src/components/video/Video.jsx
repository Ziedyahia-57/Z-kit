import React, { useState, useRef, useEffect, useId, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Spinner } from '../spinner/spinner';
import './Video.scss';
import defaultCaptions from './test.srt?url';

// ============================================================
// CONSTANTS & DEFAULTS
// ============================================================

const CONTROLS_HIDE_DELAY = 1500;
const DEFAULT_SRC = "https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov";
const DEFAULT_THUMBNAIL = "https://vcz-beacon-cloud-vodlix-com.b-cdn.net/u/beacon/files/thumbs/2024/10/31/1730411299tGBIHeHPMR-original-rmzeNHaB.jpeg";
const PREVIEW_WIDTH = 160;
const PREVIEW_HEIGHT = 90;
const PREVIEW_THROTTLE_MS = 150;

// PERFORMANCE: Throttle progress bar DOM updates to 10fps instead of 60fps
// This dramatically reduces layout thrashing while still feeling smooth
const PROGRESS_UPDATE_INTERVAL = 100;

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AUTO_QUALITY_CONFIG = {
    checkInterval: 8000,
    cooldownPeriod: 20000,
    bufferEventWindow: 30000,
    maxBufferEventsBeforeDowngrade: 3,
    stablePeriodBeforeUpgrade: 30000,
};

// ============================================================
// PERFORMANCE: Video byte cache
// ============================================================

const MAX_CACHED_SOURCES = 4;
const videoBlobCache = new Map(); // src -> { blobUrl } | { promise }

const evictOldestCacheEntry = () => {
    const oldestKey = videoBlobCache.keys().next().value;
    if (oldestKey === undefined) return;
    const entry = videoBlobCache.get(oldestKey);
    if (entry?.blobUrl) URL.revokeObjectURL(entry.blobUrl);
    videoBlobCache.delete(oldestKey);
};

/** Returns a cached Blob URL for src if we've already fully downloaded it. */
const getCachedVideoUrl = (src) => {
    const entry = videoBlobCache.get(src);
    return entry?.blobUrl || null;
};

/**
 * Fetches + caches a video source as a Blob URL in the background.
 */
const cacheVideoSource = (src) => {
    if (!src || videoBlobCache.has(src)) return;

    const promise = fetch(src)
        .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${src}`);
            return res.blob();
        })
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            if (videoBlobCache.size >= MAX_CACHED_SOURCES) evictOldestCacheEntry();
            videoBlobCache.set(src, { blobUrl });
            return blobUrl;
        })
        .catch(() => {
            videoBlobCache.delete(src);
            return null;
        });

    videoBlobCache.set(src, { promise });
};

// ============================================================
// CAPTION PARSING FUNCTIONS
// ============================================================

const parseCaptionFile = (content, fileType = 'srt') => {
    const captions = [];
    const normalizedContent = content.replace(/\r\n/g, '\n');

    let blocks;
    if (fileType === 'vtt') {
        const lines = normalizedContent.split('\n');
        let startIndex = 0;
        let foundHeader = false;

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed === '' || trimmed.startsWith('WEBVTT')) {
                foundHeader = true;
                continue;
            }
            if (foundHeader && trimmed && !trimmed.startsWith('NOTE')) {
                startIndex = i;
                break;
            }
        }

        const contentWithoutHeader = lines.slice(startIndex).join('\n');
        blocks = contentWithoutHeader.trim().split(/\n\s*\n/);
    } else {
        blocks = normalizedContent.trim().split(/\n\s*\n/);
    }

    blocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length < 2) return;

        let timestampIndex = 0;
        if (fileType === 'srt' && /^\d+$/.test(lines[0].trim())) {
            timestampIndex = 1;
        }

        const timeMatch = lines[timestampIndex].match(
            /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
        );

        if (!timeMatch) return;

        const start = parseCaptionTime(timeMatch[1]);
        const end = parseCaptionTime(timeMatch[2]);
        const textLines = lines.slice(timestampIndex + 1);
        const text = textLines.join(' ');

        const cleanText = text
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .trim();

        if (cleanText) {
            captions.push({ start, end, text: cleanText });
        }
    });

    return captions;
};

const parseCaptionTime = (timestamp) => {
    const normalized = timestamp.replace(',', '.');
    const [hours, minutes, seconds] = normalized.split(':');
    return parseFloat(hours) * 3600 + parseFloat(minutes) * 60 + parseFloat(seconds);
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Format seconds into "M:SS" or "H:MM:SS" */
const formatTime = (seconds) => {
    if (!(seconds >= 0)) return "0:00";
    const totalSeconds = seconds | 0;
    const hours = (totalSeconds / 3600) | 0;
    const minutes = ((totalSeconds % 3600) / 60) | 0;
    const secs = totalSeconds % 60;
    const s = secs < 10 ? "0" + secs : secs;

    if (hours > 0) {
        const m = minutes < 10 ? "0" + minutes : minutes;
        return hours + ":" + m + ":" + s;
    }
    return minutes + ":" + s;
};

/** Get the percentage of the video that is buffered (leading edge) */
const getBufferedProgress = (video) => {
    if (!video) return 0;
    const { buffered, duration } = video;
    const len = buffered.length;
    if (len === 0 || !(duration > 0)) return 0;

    const end = buffered.end(len - 1);
    const progress = (end / duration) * 100;
    return progress > 100 ? 100 : progress;
};

const normalizeQualities = (src, qualities) => {
    if (qualities && qualities.length > 0) {
        return qualities.slice().sort((a, b) => a.height - b.height);
    }
    return [{ label: "Auto", src: src || DEFAULT_SRC, height: 0, isDefault: true }];
};

const getNetworkInfo = () => {
    if (typeof navigator !== 'undefined' && navigator.connection) {
        const conn = navigator.connection;
        return {
            effectiveType: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
            saveData: conn.saveData,
        };
    }
    return null;
};

let cachedViewportHeight = 0;
const getViewportHeight = () => {
    if (cachedViewportHeight) return cachedViewportHeight;
    cachedViewportHeight = window.innerHeight * (window.devicePixelRatio || 1);
    return cachedViewportHeight;
};
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => cachedViewportHeight = 0);
}

const evaluateAutoQuality = (bufferEventTimestamps, lastAutoSwitchTime, currentIndex, qualities) => {
    const now = Date.now();
    if (now - lastAutoSwitchTime < AUTO_QUALITY_CONFIG.cooldownPeriod) return null;

    let recentBufferCount = 0;
    const windowStart = now - AUTO_QUALITY_CONFIG.bufferEventWindow;
    for (let i = bufferEventTimestamps.length - 1; i >= 0; i--) {
        if (bufferEventTimestamps[i] > windowStart) recentBufferCount++;
        else break;
    }

    const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
    if (conn) {
        if (conn.saveData) return 0;
        let maxIdx = qualities.length - 1;
        const type = conn.effectiveType;
        if (type === 'slow-2g' || type === '2g') maxIdx = 0;
        else if (type === '3g') maxIdx = Math.min(maxIdx, 1);
        if (currentIndex > maxIdx) return maxIdx;
    }

    if (recentBufferCount >= AUTO_QUALITY_CONFIG.maxBufferEventsBeforeDowngrade) {
        return currentIndex > 0 ? currentIndex - 1 : null;
    }

    if (recentBufferCount === 0) {
        const lastBufferTime = bufferEventTimestamps.length > 0
            ? bufferEventTimestamps[bufferEventTimestamps.length - 1]
            : now;

        if (now - lastBufferTime > AUTO_QUALITY_CONFIG.stablePeriodBeforeUpgrade) {
            const vHeight = getViewportHeight();
            let target = currentIndex;
            for (let i = currentIndex + 1; i < qualities.length; i++) {
                if (qualities[i].height <= vHeight) {
                    target = i;
                } else {
                    break;
                }
            }
            return target > currentIndex ? target : null;
        }
    }
    return null;
};

// ============================================================
// PERFORMANCE: Memoized SVG Icon Components (All 13 Icons)
// ============================================================

const ICON_COLOR = "#F2F2F2";

const BaseIcon = ({ size = 24, viewBox = "0 0 24 24", children, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
);

export const PlayPauseIcon = React.memo(({ isPlaying, size = 64 }) => (
    <AnimatePresence mode="wait" initial={false}>
        {isPlaying ? (
            <motion.svg
                key="pause"
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.075, ease: "easeOut" }}
            >
                <path d="M48 8H40C38.5 8 37.3 9.2 37.3 10.7V53.3C37.3 54.8 38.5 56 40 56H48C49.5 56 50.7 54.8 50.7 53.3V10.7C50.7 9.2 49.5 8 48 8Z" fill="#F2F2F2" stroke="#F2F2F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 8H16C14.5 8 13.3 9.2 13.3 10.7V53.3C13.3 54.8 14.5 56 16 56H24C25.5 56 26.7 54.8 26.7 53.3V10.7C26.7 9.2 25.5 8 24 8Z" fill="#F2F2F2" stroke="#F2F2F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
        ) : (
            <motion.svg
                key="play"
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.075, ease: "easeOut" }}
            >
                <path d="M13.3 13.3C13.3 12.4 13.6 11.5 14.1 10.7C14.5 9.8 15.2 9.2 16 8.7C16.8 8.2 17.7 8 18.7 8C19.6 8 20.5 8.3 21.4 8.7L53.3 27.4C54.2 27.9 54.8 28.5 55.3 29.3C55.8 30.1 56 31.1 56 32C56 32.9 55.8 33.8 55.3 34.7C54.8 35.5 54.2 36.1 53.4 36.6L21.4 55.3C20.5 55.7 19.6 56 18.7 56C17.7 56 16.8 55.8 16 55.3C15.2 54.8 14.5 54.2 14.1 53.3C13.6 52.5 13.3 51.6 13.3 50.7V13.3Z" fill="#F2F2F2" stroke="#F2F2F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
        )}
    </AnimatePresence>
));

export const SkipBackIcon = React.memo(() => (
    <BaseIcon>
        <path d="M3 12C3 13.78 3.53 15.52 4.52 17C5.51 18.48 6.91 19.63 8.56 20.31C10.2 20.99 12.01 21.17 13.76 20.83C15.5 20.48 17.11 19.62 18.36 18.36C19.62 17.11 20.48 15.5 20.83 13.76C21.17 12.01 21 10.2 20.31 8.56C19.63 6.91 18.48 5.51 17 4.52C15.52 3.53 13.78 3 12 3C9.48 3.01 7.07 3.99 5.26 5.74" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10H10V14" stroke={ICON_COLOR} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11.33C15 10.6 14.33 10 13.5 10C12.67 10 12 10.6 12 11.33V12.67C12 13.4 12.67 14 13.5 14C14.33 14 15 13.4 15 12.67V11.33Z" stroke={ICON_COLOR} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 2V7H9" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const SkipForwardIcon = React.memo(() => (
    <BaseIcon>
        <path d="M21 12C21 13.78 20.47 15.52 19.48 17C18.49 18.48 17.09 19.63 15.44 20.31C13.8 20.99 11.99 21.17 10.24 20.83C8.5 20.48 6.89 19.62 5.64 18.36C4.38 17.11 3.52 15.5 3.17 13.76C2.83 12.01 3 10.2 3.69 8.56C4.37 6.91 5.52 5.51 7 4.52C8.48 3.53 10.22 3 12 3C14.52 3.01 16.93 3.99 18.74 5.74" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10H10V14" stroke={ICON_COLOR} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11.33C15 10.6 14.33 10 13.5 10C12.67 10 12 10.6 12 11.33V12.67C12 13.4 12.67 14 13.5 14C14.33 14 15 13.4 15 12.67V11.33Z" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 2V7H15" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const SkipBackIconLarge = React.memo(() => (
    <BaseIcon size={48} viewBox="0 0 48 48">
        <path d="M6 8V40" stroke={ICON_COLOR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35.94 8.57C36.55 8.21 37.24 8.01 37.95 8C38.66 7.99 39.35 8.17 39.97 8.52C40.59 8.87 41.1 9.37 41.46 9.99C41.81 10.6 42 11.29 42 12V36C42 36.71 41.81 37.4 41.46 38.01C41.1 38.63 40.59 39.13 39.97 39.48C39.35 39.83 38.66 40.01 37.95 40C37.24 39.99 36.55 39.79 35.94 39.43L15.95 27.43C15.35 27.08 14.86 26.58 14.52 25.98C14.18 25.37 14 24.7 14 24C14 23.31 14.18 22.63 14.52 22.03C14.86 21.43 15.35 20.93 15.94 20.57L35.94 8.57Z" fill={ICON_COLOR} stroke={ICON_COLOR} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const SkipForwardIconLarge = React.memo(() => (
    <BaseIcon size={48} viewBox="0 0 48 48">
        <path d="M42 8V40" stroke={ICON_COLOR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.06 8.57C11.45 8.21 10.76 8.01 10.05 8C9.34 7.99 8.65 8.17 8.03 8.52C7.41 8.87 6.9 9.37 6.54 9.99C6.19 10.6 6 11.29 6 12V36C6 36.71 6.19 37.4 6.54 38.01C6.9 38.63 7.41 39.13 8.03 39.48C8.65 39.83 9.34 40.01 10.05 40C10.76 39.99 11.45 39.79 12.06 39.43L32.05 27.43C32.65 27.08 33.14 26.58 33.48 25.98C33.82 25.37 34 24.7 34 24C34 23.31 33.82 22.63 33.48 22.03C33.14 21.43 32.65 20.93 32.06 20.57L12.06 8.57Z" fill={ICON_COLOR} stroke={ICON_COLOR} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const VolumeIcon = React.memo(({ volume, isMuted }) => (
    <BaseIcon>
        <path d="M11 4.7C11 4.56 10.96 4.43 10.88 4.31C10.8 4.2 10.69 4.1 10.56 4.05C10.44 4 10.29 3.98 10.16 4.01C10.02 4.04 9.9 4.11 9.8 4.2L6.41 7.59C6.28 7.72 6.13 7.82 5.96 7.89C5.78 7.96 5.6 8 5.42 8H3C2.73 8 2.48 8.11 2.29 8.29C2.11 8.48 2 8.73 2 9V15C2 15.27 2.11 15.52 2.29 15.71C2.48 15.89 2.73 16 3 16H5.42C5.6 16 5.78 16.04 5.96 16.11C6.13 16.18 6.28 16.28 6.41 16.41L9.8 19.8C9.9 19.9 10.02 19.96 10.16 19.99C10.29 20.02 10.44 20 10.56 19.95C10.69 19.9 10.8 19.81 10.88 19.69C10.96 19.57 11 19.44 11 19.3V4.7Z" fill={ICON_COLOR} stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {(isMuted || volume === 0) ? (
            <path d="M17 9L23 15M23 9L17 15" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
            <>
                <path d="M16 9C16.65 9.87 17 10.92 17 12C17 13.08 16.65 14.13 16 15" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {volume >= 0.5 && (
                    <path d="M19.36 18.36C20.2 17.53 20.86 16.54 21.32 15.44C21.77 14.35 22 13.18 22 12C22 10.82 21.77 9.65 21.32 8.56C20.86 7.46 20.2 6.47 19.36 5.64" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
            </>
        )}
    </BaseIcon>
));

export const CaptionsOffIcon = React.memo(() => (
    <BaseIcon>
        <path d="M19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5Z" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 15H11M15 15H17M7 11H9M13 11H17" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const CaptionsOnIcon = React.memo(() => (
    <BaseIcon>
        <path d="M19 4C20.66 4 22 5.34 22 7V17C22 18.66 20.66 20 19 20H5C3.34 20 2 18.66 2 17V7C2 5.34 3.34 4 5 4H19ZM7 14C6.45 14 6 14.45 6 15C6 15.55 6.45 16 7 16H11C11.55 16 12 15.55 12 15C12 14.45 11.55 14 11 14H7ZM15 14C14.45 14 14 14.45 14 15C14 15.55 14.45 16 15 16H17C17.55 16 18 15.55 18 15C18 14.45 17.55 14 17 14H15ZM7 10C6.45 10 6 10.45 6 11C6 11.55 6.45 12 7 12H9C9.55 12 10 11.55 10 11C10 10.45 9.55 10 9 10H7ZM13 10C12.45 10 12 10.45 12 11C12 11.55 12.45 12 13 12H17C17.55 12 18 11.55 18 11C18 10.45 17.55 10 17 10H13Z" fill={ICON_COLOR} />
    </BaseIcon>
));

export const SettingsIcon = React.memo(() => (
    <BaseIcon>
        <path d="M14 17H5" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 7H10" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 20C18.66 20 20 18.66 20 17C20 15.34 18.66 14 17 14C15.34 14 14 15.34 14 17C14 18.66 15.34 20 17 20Z" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10Z" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const PipIcon = React.memo(() => (
    <BaseIcon>
        <path d="M21 9V6C21 5.47 20.79 4.96 20.41 4.59C20.04 4.21 19.53 4 19 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V16C2 17.1 2.9 18 4 18H8" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 13H14C12.9 13 12 13.9 12 15V18C12 19.1 12.9 20 14 20H20C21.1 20 22 19.1 22 18V15C22 13.9 21.1 13 20 13Z" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const FullscreenIcon = React.memo(() => (
    <BaseIcon>
        <path d="M8 3H5C4.47 3 3.96 3.21 3.59 3.59C3.21 3.96 3 4.47 3 5V8" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8V5C21 4.47 20.79 3.96 20.41 3.59C20.04 3.21 19.53 3 19 3H16" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16V19C3 19.53 3.21 20.04 3.59 20.41C3.96 20.79 4.47 21 5 21H8" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 21H19C19.53 21 20.04 20.79 20.41 20.41C20.79 20.04 21 19.53 21 19V16" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const CheckIcon = React.memo(() => (
    <BaseIcon size={20}>
        <path d="M20 6L9 17L4 12" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

export const BackArrowIcon = React.memo(() => (
    <BaseIcon size={20}>
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
));

// ============================================================
// PERFORMANCE: Custom hook for throttled video frame updates
// ============================================================

const useThrottledVideoFrame = (callback, deps = []) => {
    const videoRef = useRef(null);
    const rafHandleRef = useRef(null);
    const timeoutRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const schedule = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const now = performance.now();
        const elapsed = now - lastUpdateRef.current;

        if (elapsed >= PROGRESS_UPDATE_INTERVAL) {
            lastUpdateRef.current = now;
            callbackRef.current();
        }

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            rafHandleRef.current = video.requestVideoFrameCallback(() => {
                schedule();
            });
        } else {
            timeoutRef.current = setTimeout(schedule, PROGRESS_UPDATE_INTERVAL);
        }
    }, []);

    const start = useCallback((video) => {
        videoRef.current = video;
        lastUpdateRef.current = 0;
        schedule();
    }, [schedule]);

    const stop = useCallback(() => {
        const video = videoRef.current;
        if (video && 'cancelVideoFrameCallback' in HTMLVideoElement.prototype && rafHandleRef.current) {
            video.cancelVideoFrameCallback(rafHandleRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        rafHandleRef.current = null;
        timeoutRef.current = null;
        videoRef.current = null;
    }, []);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    return { start, stop };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Video = ({
    src,
    reactions = false,
    thumbnail,
    profile,
    verified = false,
    username,
    title,
    width,
    height,
    centered = false,
    variant = "immersive",
    qualities: qualitiesProp,
    autoplay = false,
    captionSrc = defaultCaptions
}) => {
    const qualities = useMemo(() => normalizeQualities(src, qualitiesProp), [src, qualitiesProp]);
    const hasMultipleQualities = qualities.length > 1;

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------
    const [isPlaying, setIsPlaying] = useState(false);
    const [initialState, setInitialState] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewX, setPreviewX] = useState(0);
    const [previewTime, setPreviewTime] = useState(0);

    const [duration, setDuration] = useState(0);
    const [showCaptions, setShowCaptions] = useState(false);
    const [captionsText, setCaptionsText] = useState("");
    const [captionsData, setCaptionsData] = useState([]);

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCursorVisible, setIsCursorVisible] = useState(true);
    const [selectedQualityIndex, setSelectedQualityIndex] = useState(
        hasMultipleQualities ? qualities.length - 1 : 0
    );
    const [isAutoQuality, setIsAutoQuality] = useState(hasMultipleQualities);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeMenu, setActiveMenu] = useState(null);

    // --------------------------------------------------------
    // REFS
    // --------------------------------------------------------
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const previewVideoRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const trackRef = useRef(null);
    const progressBarRef = useRef(null);
    const settingsContainerRef = useRef(null);

    const currentTimeElRef = useRef(null);
    const currentTimeElRef2 = useRef(null);
    const fillElRef = useRef(null);
    const bufferedElRef = useRef(null);
    const dotElRef = useRef(null);
    const sliderElRef = useRef(null);

    const controlsTimeoutRef = useRef(null);
    const cursorTimeoutRef = useRef(null);
    const autoQualityIntervalRef = useRef(null);

    const wasPlayingRef = useRef(false);
    const isSwitchingQualityRef = useRef(false);
    const previewThrottleRef = useRef(0);

    const bufferEventTimestampsRef = useRef([]);
    const lastAutoSwitchTimeRef = useRef(0);

    const maskId = useId();

    const isVisibleRef = useRef(false);

    // --------------------------------------------------------
    // Intersection Observer for lazy play/pause
    // --------------------------------------------------------
    const intersectionObserverRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const wrapper = wrapperRef.current;
        if (!wrapper || !video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisibleRef.current = entry.isIntersecting;
                    if (!entry.isIntersecting && isPlaying && !initialState) {
                        video.pause();
                    }
                });
            },
            { threshold: 0.1 }
        );
        observer.observe(wrapper);
        intersectionObserverRef.current = observer;

        return () => {
            observer.disconnect();
            isVisibleRef.current = false;
        };
    }, [isPlaying, initialState]);

    // --------------------------------------------------------
    // DERIVED VALUES
    // --------------------------------------------------------
    const showThumbnail = initialState && !isPlaying;
    const progressVisible =
        (initialState && isPlaying) || (!initialState && showControls) || isDragging;
    const controlsVisible = !initialState && showControls;
    const spinnerVisible = isLoading && !showThumbnail;

    const formattedDuration = formatTime(duration);
    const volumePercent = Math.round((isMuted ? 0 : volume) * 100);

    const currentSrc = isAutoQuality
        ? qualities[qualities.length - 1].src
        : qualities[selectedQualityIndex]?.src || qualities[0].src;

    const previewNeeded = (showPreview || isDragging) && !initialState;

    useEffect(() => {
        cacheVideoSource(currentSrc);
    }, [currentSrc]);

    // --------------------------------------------------------
    // CONTROLS VISIBILITY
    // --------------------------------------------------------
    const clearControlsTimeout = useCallback(() => {
        clearTimeout(controlsTimeoutRef.current);
    }, []);

    const scheduleHideControls = useCallback(() => {
        clearControlsTimeout();
        controlsTimeoutRef.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setShowControls(false);
            }
        }, CONTROLS_HIDE_DELAY);
    }, [clearControlsTimeout]);

    // --------------------------------------------------------
    // CURSOR VISIBILITY
    // --------------------------------------------------------
    const handleCursorHide = useCallback(() => {
        if (!isFullscreen) return;
        setIsCursorVisible(false);
    }, [isFullscreen]);

    const handleCursorShow = useCallback(() => {
        setIsCursorVisible(true);
        if (cursorTimeoutRef.current) {
            clearTimeout(cursorTimeoutRef.current);
        }
        // Hide cursor after 2 seconds of inactivity in fullscreen
        if (isFullscreen && isPlaying) {
            cursorTimeoutRef.current = setTimeout(handleCursorHide, 2000);
        }
    }, [isFullscreen, isPlaying, handleCursorHide]);

    // --------------------------------------------------------
    // PLAYBACK CONTROLS
    // --------------------------------------------------------
    const togglePlayPause = useCallback(() => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => { });
        } else {
            videoRef.current.pause();
        }
    }, []);

    const handleSkip = useCallback((e, seconds) => {
        if (e) e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(
            0,
            Math.min(video.currentTime + seconds, video.duration || 0)
        );
    }, []);

    const handlePlayPauseClick = useCallback((e) => {
        e.stopPropagation();
        togglePlayPause();
    }, [togglePlayPause]);

    // --------------------------------------------------------
    // FULLSCREEN & PIP
    // --------------------------------------------------------
    const handleToggleFullscreen = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen?.().catch((err) => {
                console.error("Fullscreen error:", err);
            });
        } else {
            document.exitFullscreen?.();
        }
    }, []);

    const handleTogglePip = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !document.pictureInPictureEnabled) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                if (video.paused) await video.play();
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.error("PiP Error:", err);
        }
    }, []);

    // --------------------------------------------------------
    // VOLUME CONTROLS
    // --------------------------------------------------------
    const handleVolumeChange = useCallback((e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
        if (val > 0 && isMuted) {
            setIsMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
        } else if (val === 0 && !isMuted) {
            setIsMuted(true);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        const nextMuted = !video.muted;
        video.muted = nextMuted;
        setIsMuted(nextMuted);
    }, []);

    const adjustVolume = useCallback((delta) => {
        const video = videoRef.current;
        if (!video) return;
        let newVol = Math.max(0, Math.min(1, video.volume + delta));
        video.volume = newVol;
        video.muted = newVol === 0;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    }, []);

    // --------------------------------------------------------
    // KEYBOARD SHORTCUTS
    // --------------------------------------------------------

    // Refs for space key hold behavior
    const spaceHeldRef = useRef(false);
    const spaceStartTimeRef = useRef(0);
    const preSpaceSpeedRef = useRef(1);
    const spaceTimeoutRef = useRef(null);
    const spaceIsHoldRef = useRef(false);

    // Inline play/pause to avoid stale closure issues
    const togglePlayback = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(() => { });
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (initialState) return;
        if (!isVisibleRef.current) return;

        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

        const video = videoRef.current;
        if (!video) return;

        const key = e.key;
        const keyLower = key.toLowerCase();

        // Space key - tap to toggle, hold to 2x speed
        if (key === " ") {
            e.preventDefault();

            // Ignore key repeat events while held
            if (spaceHeldRef.current) return;

            spaceHeldRef.current = true;
            spaceStartTimeRef.current = Date.now();
            preSpaceSpeedRef.current = video.playbackRate;
            spaceIsHoldRef.current = false;

            // After 200ms of holding, activate 2x speed
            spaceTimeoutRef.current = setTimeout(() => {
                if (spaceHeldRef.current) {
                    spaceIsHoldRef.current = true;
                    video.playbackRate = 2.0;
                }
            }, 200);

            return;
        }

        // K key - always works for toggle
        if (keyLower === "k") {
            e.preventDefault();
            togglePlayback();
            return;
        }

        // F key - toggle fullscreen
        if (keyLower === "f") {
            e.preventDefault();
            handleToggleFullscreen();
            return;
        }

        // M key - toggle mute
        if (keyLower === "m") {
            e.preventDefault();
            toggleMute();
            return;
        }

        // Arrow Up / Down - volume control (works regardless of play state)
        if (key === "ArrowUp") {
            e.preventDefault();
            adjustVolume(0.1);
            setShowControls(true);
            if (isPlaying) scheduleHideControls();
            return;
        }

        if (key === "ArrowDown") {
            e.preventDefault();
            adjustVolume(-0.1);
            setShowControls(true);
            if (isPlaying) scheduleHideControls();
            return;
        }

        // All other shortcuts only work when video is playing
        if (video.paused) return;

        switch (keyLower) {
            case "l":
                e.preventDefault();
                handleSkip(null, 10);
                setShowControls(true);
                scheduleHideControls();
                break;
            case "j":
                e.preventDefault();
                handleSkip(null, -10);
                setShowControls(true);
                scheduleHideControls();
                break;
            case "arrowright":
                e.preventDefault();
                handleSkip(null, 5);
                setShowControls(true);
                scheduleHideControls();
                break;
            case "arrowleft":
                e.preventDefault();
                handleSkip(null, -5);
                setShowControls(true);
                scheduleHideControls();
                break;
            case "c":
                e.preventDefault();
                handleToggleCaptions();
                break;
            case "escape":
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
            default:
                if (/^[0-9]$/.test(key)) {
                    e.preventDefault();
                    video.currentTime = video.duration * (parseInt(key) / 10);
                }
                break;
        }
    }, [initialState, togglePlayback, handleToggleFullscreen, toggleMute, handleSkip, scheduleHideControls, adjustVolume, isPlaying]);

    const handleKeyUp = useCallback((e) => {
        if (e.key !== " ") return;
        if (!isVisibleRef.current) return;

        e.preventDefault();

        if (!spaceHeldRef.current) return;

        // Reset held state
        spaceHeldRef.current = false;

        // Clear the hold detection timeout
        if (spaceTimeoutRef.current) {
            clearTimeout(spaceTimeoutRef.current);
            spaceTimeoutRef.current = null;
        }

        const video = videoRef.current;
        if (!video) return;

        if (spaceIsHoldRef.current) {
            // Was a HOLD - restore original speed, don't toggle
            video.playbackRate = preSpaceSpeedRef.current;
            spaceIsHoldRef.current = false;
        } else {
            // Was a TAP (< 200ms) - toggle play/pause
            togglePlayback();
        }
    }, [togglePlayback]);

    // Register event listeners
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (spaceTimeoutRef.current) {
                clearTimeout(spaceTimeoutRef.current);
            }
        };
    }, [handleKeyDown, handleKeyUp]);

    // --------------------------------------------------------
    // CAPTIONS
    // --------------------------------------------------------
    const handleToggleCaptions = useCallback(() => {
        const video = videoRef.current;
        if (!video || !video.textTracks.length) return;
        const track = video.textTracks[0];
        setShowCaptions(prev => {
            const next = !prev;
            track.mode = next ? "showing" : "hidden";
            return next;
        });
    }, []);


    // ============================================================
    // CAPTIONS: Fetch and parse caption file
    // ============================================================
    useEffect(() => {
        if (!captionSrc) {
            setCaptionsData([]);
            return;
        }

        let cancelled = false;

        const loadCaptions = async () => {
            try {
                const response = await fetch(captionSrc);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
                const content = await response.text();

                if (cancelled) return;

                const fileType = captionSrc.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt';
                const parsed = parseCaptionFile(content, fileType);
                setCaptionsData(parsed);
            } catch (err) {
                console.error('Failed to load captions:', err);
                if (!cancelled) setCaptionsData([]);
            }
        };

        loadCaptions();

        return () => {
            cancelled = true;
        };
    }, [captionSrc]);

    // ============================================================
    // CAPTIONS: Update current caption text based on video time
    // ============================================================
    const updateCurrentCaption = useCallback((currentTime) => {
        if (!showCaptions || captionsData.length === 0) {
            setCaptionsText('');
            return;
        }

        // Binary search for efficiency with large caption files
        let low = 0;
        let high = captionsData.length - 1;
        let result = null;

        while (low <= high) {
            const mid = (low + high) >>> 1;
            const caption = captionsData[mid];

            if (currentTime >= caption.start && currentTime <= caption.end) {
                result = caption;
                break;
            } else if (currentTime < caption.start) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        setCaptionsText(result?.text || '');
    }, [showCaptions, captionsData]);


    // --------------------------------------------------------
    // QUALITY SWITCHING
    // --------------------------------------------------------
    const switchQuality = useCallback(
        (newIndex, auto = false) => {
            const video = videoRef.current;
            const previewVideo = previewVideoRef.current;
            if (!video || isSwitchingQualityRef.current) return;
            if (newIndex === selectedQualityIndex && !auto) return;
            if (newIndex < 0 || newIndex >= qualities.length) return;

            isSwitchingQualityRef.current = true;
            bufferEventTimestampsRef.current = [];

            const savedTime = video.currentTime;
            const wasPaused = video.paused;
            const savedRate = video.playbackRate;
            const savedVolume = video.volume;
            const savedMuted = video.muted;
            const savedLoop = video.loop;

            const newSrc = qualities[newIndex].src;
            const cachedSrc = getCachedVideoUrl(newSrc);
            video.src = cachedSrc || newSrc;

            if (previewVideo && previewVideo.src && previewVideo.src !== newSrc) {
                previewVideo.src = cachedSrc || newSrc;
            }

            const onLoadedMetadata = () => {
                video.removeEventListener("loadedmetadata", onLoadedMetadata);

                video.currentTime = savedTime;
                video.playbackRate = savedRate;
                video.volume = savedVolume;
                video.muted = savedMuted;
                video.loop = savedLoop;

                if (!wasPaused) {
                    video.play().catch(() => { });
                }

                setSelectedQualityIndex(newIndex);
                isSwitchingQualityRef.current = false;
            };

            const fallbackTimeout = setTimeout(() => {
                video.removeEventListener("loadedmetadata", onLoadedMetadata);
                isSwitchingQualityRef.current = false;
            }, 10000);

            const onMetaWithCleanup = () => {
                clearTimeout(fallbackTimeout);
                onLoadedMetadata();
            };

            video.addEventListener("loadedmetadata", onMetaWithCleanup);
            video.load();
        },
        [qualities, selectedQualityIndex]
    );

    const handleQualitySelect = useCallback(
        (index) => {
            setIsAutoQuality(false);
            lastAutoSwitchTimeRef.current = Date.now();
            switchQuality(index);
            setActiveMenu(null);
        },
        [switchQuality]
    );

    const handleAutoQualityToggle = useCallback(() => {
        setIsAutoQuality(true);
        lastAutoSwitchTimeRef.current = Date.now();
        switchQuality(qualities.length - 1, true);
        setActiveMenu(null);
    }, [qualities.length, switchQuality]);

    // --------------------------------------------------------
    // AUTO-QUALITY ENGINE
    // --------------------------------------------------------
    const runAutoQualityCheck = useCallback(() => {
        if (!isAutoQuality || !hasMultipleQualities || isSwitchingQualityRef.current) return;

        const suggestedIndex = evaluateAutoQuality(
            bufferEventTimestampsRef.current,
            lastAutoSwitchTimeRef.current,
            selectedQualityIndex,
            qualities
        );

        if (suggestedIndex !== null && suggestedIndex !== selectedQualityIndex) {
            lastAutoSwitchTimeRef.current = Date.now();
            switchQuality(suggestedIndex, true);
        }
    }, [isAutoQuality, hasMultipleQualities, selectedQualityIndex, qualities, switchQuality]);

    // --------------------------------------------------------
    // PLAYBACK SPEED
    // --------------------------------------------------------
    const handleSpeedSelect = useCallback((speed) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
        setActiveMenu(null);
    }, []);

    // --------------------------------------------------------
    // SETTINGS MENU
    // --------------------------------------------------------
    const openSettings = useCallback((e) => {
        e.stopPropagation();
        // Toggle between null and "settings"
        setActiveMenu(prev => prev === "settings" ? null : "settings");
    }, []);

    const openSubMenu = useCallback((panel) => {
        setActiveMenu(panel);
    }, []);

    const closeMenu = useCallback(() => {
        setActiveMenu(null);
    }, []);

    const goBackToSettings = useCallback(() => {
        setActiveMenu("settings");
    }, []);

    // --------------------------------------------------------
    // WRAPPER INTERACTION
    // --------------------------------------------------------
    const handleWrapperClick = useCallback(() => {
        if (isDragging) return;
        if (initialState) {
            setInitialState(false);
            setShowControls(true);
            if (videoRef.current && videoRef.current.paused) {
                videoRef.current.play().catch(() => { });
            }
            scheduleHideControls();
        } else {
            togglePlayPause();
        }
        // Show cursor on click
        handleCursorShow();
    }, [isDragging, initialState, togglePlayPause, scheduleHideControls, handleCursorShow]);

    const handleWrapperMouseEnter = useCallback(() => {
        if (initialState) {
            videoRef.current?.play().catch(() => { });
        } else {
            setShowControls(true);
            if (isPlaying) scheduleHideControls();
        }
        // Show cursor when mouse enters
        handleCursorShow();
    }, [initialState, isPlaying, scheduleHideControls, handleCursorShow]);

    const handleWrapperMouseMove = useCallback(() => {
        if (!initialState) {
            setShowControls(true);
            if (isPlaying) scheduleHideControls();
        }
        // Show cursor when mouse moves
        handleCursorShow();
    }, [initialState, isPlaying, scheduleHideControls, handleCursorShow]);

    const handleWrapperMouseLeave = useCallback(() => {
        if (isDragging) return;
        if (initialState) {
            clearControlsTimeout();
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            if (fillElRef.current) fillElRef.current.style.width = "0%";
            if (dotElRef.current) dotElRef.current.style.left = "0%";
            if (currentTimeElRef.current) currentTimeElRef.current.textContent = "0:00";
            if (currentTimeElRef2.current) currentTimeElRef2.current.textContent = "0:00";
        } else if (isPlaying) {
            scheduleHideControls();
        }
        // Show cursor when mouse leaves (prevents stuck hidden state)
        handleCursorShow();
    }, [isDragging, initialState, isPlaying, scheduleHideControls, clearControlsTimeout, handleCursorShow]);

    // --------------------------------------------------------
    // VIDEO EVENT HANDLERS
    // --------------------------------------------------------
    const handleOnPlay = useCallback(() => {
        setIsPlaying(true);
        setIsLoading(false);
        if (!initialState) scheduleHideControls();
    }, [initialState, scheduleHideControls]);

    const handleOnPause = useCallback(() => {
        setIsPlaying(false);
        if (!initialState) {
            clearControlsTimeout();
            setShowControls(true);
        }
        // Show cursor when paused
        handleCursorShow();
    }, [initialState, clearControlsTimeout, handleCursorShow]);

    const handleVideoEnd = useCallback(() => {
        clearControlsTimeout();
        setIsPlaying(false);
        setInitialState(true);
        setShowControls(false);
        setDuration(0);
        if (fillElRef.current) fillElRef.current.style.width = "0%";
        if (bufferedElRef.current) bufferedElRef.current.style.width = "0%";
        if (dotElRef.current) dotElRef.current.style.left = "0%";
        if (currentTimeElRef.current) currentTimeElRef.current.textContent = "0:00";
        if (currentTimeElRef2.current) currentTimeElRef2.current.textContent = "0:00";
        if (videoRef.current) videoRef.current.currentTime = 0;
        // Show cursor when video ends
        handleCursorShow();
    }, [clearControlsTimeout, handleCursorShow]);

    const handleLoadStart = useCallback(() => setIsLoading(true), []);
    const handleWaiting = useCallback(() => {
        setIsLoading(true);
        bufferEventTimestampsRef.current.push(Date.now());
        if (bufferEventTimestampsRef.current.length > 50) {
            bufferEventTimestampsRef.current = bufferEventTimestampsRef.current.slice(-50);
        }
    }, []);
    const handleCanPlay = useCallback(() => setIsLoading(false), []);
    const handleCanPlayThrough = useCallback(() => setIsLoading(false), []);
    const handlePlaying = useCallback(() => setIsLoading(false), []);
    const handleStalled = useCallback(() => {
        bufferEventTimestampsRef.current.push(Date.now());
    }, []);
    const handleSuspend = useCallback(() => { }, []);
    const handleProgress = useCallback(() => { }, []);
    const handleLoadedMetadata = useCallback(() => { }, []);

    // --------------------------------------------------------
    // PROGRESS BAR
    // --------------------------------------------------------
    const getRatioFromEvent = useCallback((e) => {
        if (!progressBarRef.current) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        return Math.min(Math.max(x / rect.width, 0), 1);
    }, []);

    const updatePreview = useCallback(
        (e) => {
            const video = videoRef.current;
            const track = trackRef.current;
            const previewVideo = previewVideoRef.current;
            if (!video || !Number.isFinite(video.duration) || !track) return;

            const ratio = getRatioFromEvent(e);
            const time = ratio * video.duration;
            const rect = track.getBoundingClientRect();
            const clampedX = Math.min(
                Math.max(e.clientX - rect.left, PREVIEW_WIDTH / 2),
                rect.width - PREVIEW_WIDTH / 2
            );

            setPreviewX(clampedX);
            setPreviewTime(time);
            setShowPreview(true);

            const now = Date.now();
            if (
                previewVideo &&
                previewVideo.readyState > 0 &&
                now - previewThrottleRef.current > PREVIEW_THROTTLE_MS &&
                Math.abs(previewVideo.currentTime - time) > 0.2
            ) {
                previewThrottleRef.current = now;
                previewVideo.currentTime = time;
            }
        },
        [getRatioFromEvent]
    );

    const handlePreviewSeeked = useCallback(() => {
        const previewVideo = previewVideoRef.current;
        const canvas = previewCanvasRef.current;
        if (!previewVideo || !canvas) return;
        try {
            const ctx = canvas.getContext("2d");
            ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
        } catch (err) {
            // Cross-origin source without CORS — skip frame draw silently
        }
    }, []);

    const paintProgress = useCallback((ratio, time) => {
        const pct = ratio * 100;
        if (fillElRef.current) fillElRef.current.style.width = `${pct}%`;
        if (dotElRef.current) dotElRef.current.style.left = `${pct}%`;
        if (currentTimeElRef.current) currentTimeElRef.current.textContent = formatTime(time);
        if (currentTimeElRef2.current) currentTimeElRef2.current.textContent = formatTime(time);
        if (sliderElRef.current) {
            sliderElRef.current.setAttribute("aria-valuenow", String(Math.round(pct)));
            sliderElRef.current.setAttribute(
                "aria-valuetext",
                `${formatTime(time)} of ${formattedDuration}`
            );
        }
    }, [formattedDuration]);

    const handleTrackPointerDown = useCallback(
        (e) => {
            e.stopPropagation();
            const video = videoRef.current;
            if (!video || !Number.isFinite(video.duration)) return;

            if (initialState) setInitialState(false);
            setShowControls(true);
            clearControlsTimeout();

            wasPlayingRef.current = !video.paused;
            video.pause();

            const ratio = getRatioFromEvent(e);
            video.currentTime = ratio * video.duration;
            paintProgress(ratio, ratio * video.duration);
            setIsDragging(true);
            trackRef.current.setPointerCapture(e.pointerId);
        },
        [initialState, getRatioFromEvent, clearControlsTimeout, paintProgress]
    );

    const handleTrackPointerMove = useCallback(
        (e) => {
            updatePreview(e);
            if (!isDragging) return;

            const video = videoRef.current;
            if (!video || !Number.isFinite(video.duration)) return;

            const ratio = getRatioFromEvent(e);
            video.currentTime = ratio * video.duration;
            paintProgress(ratio, ratio * video.duration);
        },
        [isDragging, updatePreview, getRatioFromEvent, paintProgress]
    );

    const handleTrackPointerUp = useCallback(
        (e) => {
            if (!isDragging) return;
            setIsDragging(false);
            if (trackRef.current) {
                trackRef.current.releasePointerCapture(e.pointerId);
            }
            if (wasPlayingRef.current && videoRef.current) {
                videoRef.current.play().catch(() => { });
            }
        },
        [isDragging]
    );

    const handleTrackPointerLeave = useCallback(() => {
        if (!isDragging) setShowPreview(false);
    }, [isDragging]);

    // --------------------------------------------------------
    // Throttled frame loop
    // --------------------------------------------------------
    const { start: startFrameLoop, stop: stopFrameLoop } = useThrottledVideoFrame(() => {
        const video = videoRef.current;
        if (video && Number.isFinite(video.duration) && video.duration > 0) {
            const newCurrentTime = video.currentTime;
            const newDuration = video.duration;
            const newProgress = newCurrentTime / newDuration;
            const newBuffered = getBufferedProgress(video);

            if (!isDragging) {
                if (fillElRef.current) fillElRef.current.style.width = `${newProgress * 100}%`;
                if (dotElRef.current) dotElRef.current.style.left = `${newProgress * 100}%`;
                if (currentTimeElRef.current) {
                    currentTimeElRef.current.textContent = formatTime(newCurrentTime);
                }
                if (currentTimeElRef2.current) {
                    currentTimeElRef2.current.textContent = formatTime(newCurrentTime);
                }
                if (sliderElRef.current) {
                    sliderElRef.current.setAttribute(
                        "aria-valuenow",
                        String(Math.round(newProgress * 100))
                    );
                }
            }
            if (bufferedElRef.current) {
                bufferedElRef.current.style.width = `${newBuffered}%`;
            }

            setDuration((prev) => (Math.abs(prev - newDuration) > 0.001 ? newDuration : prev));
        }
    }, [isDragging]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying && !initialState) {
            startFrameLoop(video);
        } else {
            stopFrameLoop();
        }

        return () => stopFrameLoop();
    }, [isPlaying, initialState, startFrameLoop, stopFrameLoop]);


    // ============================================================
    // CAPTIONS UPDATE BASED ON VIDEO TIME
    // ============================================================

    // Add this useEffect after the captions loading effect
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !showCaptions || captionsData.length === 0) {
            if (!showCaptions) setCaptionsText('');
            return;
        }

        let rafId = null;

        const updateCaptions = () => {
            const currentTime = video.currentTime;
            const activeCaption = captionsData.find(
                caption => currentTime >= caption.start && currentTime < caption.end
            );

            setCaptionsText(activeCaption ? activeCaption.text : '');
        };

        // Use requestAnimationFrame for smooth updates
        const updateLoop = () => {
            updateCaptions();
            rafId = requestAnimationFrame(updateLoop);
        };

        updateLoop();

        // Also update on timeupdate events (more reliable)
        video.addEventListener('timeupdate', updateCaptions);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            video.removeEventListener('timeupdate', updateCaptions);
        };
    }, [showCaptions, captionsData]); // Re-run when showCaptions or captionsData changes


    // --------------------------------------------------------
    // FULLSCREEN CHANGE LISTENER
    // --------------------------------------------------------
    useEffect(() => {
        const onFullscreenChange = () => {
            const isFullscreenNow = !!document.fullscreenElement;
            setIsFullscreen(isFullscreenNow);

            // Reset cursor visibility when exiting fullscreen
            if (!isFullscreenNow) {
                setIsCursorVisible(true);
                if (cursorTimeoutRef.current) {
                    clearTimeout(cursorTimeoutRef.current);
                }
            } else {
                // When entering fullscreen, show cursor initially
                handleCursorShow();
            }
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
        };
    }, [handleCursorShow]);

    // --------------------------------------------------------
    // SYNC INITIAL CAPTIONS STATE TO NATIVE TRACK
    // --------------------------------------------------------
    useEffect(() => {
        const video = videoRef.current;
        if (video && video.textTracks.length) {
            video.textTracks[0].mode = showCaptions ? "showing" : "hidden";
        }
    }, []); // run once on mount

    // --------------------------------------------------------
    // SETTINGS MENU CLICK-OUTSIDE
    // --------------------------------------------------------
    useEffect(() => {
        if (!activeMenu) return;

        const handleClickOutside = (e) => {
            // Check if click is on the settings button itself
            const settingsButton = e.target.closest('.video-button[title="Settings"]');
            if (settingsButton) return; // Let the button handle it

            // Check if click is inside settings menu
            if (
                settingsContainerRef.current &&
                !settingsContainerRef.current.contains(e.target)
            ) {
                setActiveMenu(null);
            }
        };

        // Use mousedown instead of pointerdown for better click detection
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeMenu]);

    // --------------------------------------------------------
    // AUTO-QUALITY PERIODIC CHECK
    // --------------------------------------------------------
    useEffect(() => {
        if (!isAutoQuality || !hasMultipleQualities) {
            if (autoQualityIntervalRef.current) {
                clearInterval(autoQualityIntervalRef.current);
                autoQualityIntervalRef.current = null;
            }
            return;
        }

        autoQualityIntervalRef.current = setInterval(
            runAutoQualityCheck,
            AUTO_QUALITY_CONFIG.checkInterval
        );

        return () => {
            if (autoQualityIntervalRef.current) {
                clearInterval(autoQualityIntervalRef.current);
                autoQualityIntervalRef.current = null;
            }
        };
    }, [isAutoQuality, hasMultipleQualities, runAutoQualityCheck]);

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            clearTimeout(controlsTimeoutRef.current);
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.volume = volume;
            video.muted = isMuted;
        }
    }, [volume, isMuted]);

    // ============================================================
    // CAPTIONS UPDATE BASED ON VIDEO TIME
    // ============================================================

    // Add this useEffect after the captions loading effect
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !showCaptions || captionsData.length === 0) {
            if (!showCaptions) setCaptionsText('');
            return;
        }

        let rafId = null;

        const updateCaptions = () => {
            const currentTime = video.currentTime;
            const activeCaption = captionsData.find(
                caption => currentTime >= caption.start && currentTime < caption.end
            );

            setCaptionsText(activeCaption ? activeCaption.text : '');
        };

        // Use requestAnimationFrame for smooth updates
        const updateLoop = () => {
            updateCaptions();
            rafId = requestAnimationFrame(updateLoop);
        };

        updateLoop();

        // Also update on timeupdate events (more reliable)
        video.addEventListener('timeupdate', updateCaptions);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            video.removeEventListener('timeupdate', updateCaptions);
        };
    }, [showCaptions, captionsData]); // Re-run when showCaptions or captionsData changes

    // --------------------------------------------------------
    // Memoized Settings Menu
    // --------------------------------------------------------
    const SettingsMenu = useMemo(() => {
        if (!activeMenu) return null;

        return (
            <div
                className="settings-menu"
                ref={settingsContainerRef}
                role="menu"
                aria-label="Settings menu"
                onClick={(e) => e.stopPropagation()}
                onPointerMove={(e) => e.stopPropagation()}
            >
                {activeMenu === "settings" && (
                    <div className="settings-menu__panel" role="menu">
                        {hasMultipleQualities && (
                            <button
                                className="settings-menu__item"
                                role="menuitem"
                                onClick={() => openSubMenu("quality")}
                            >
                                <span>Quality</span>
                                <span className="settings-menu__item-value">
                                    {isAutoQuality ? "Auto" : qualities[selectedQualityIndex]?.label}
                                </span>
                            </button>
                        )}
                        <button
                            className="settings-menu__item"
                            role="menuitem"
                            onClick={() => openSubMenu("speed")}
                        >
                            <span>Playback speed</span>
                            <span className="settings-menu__item-value">
                                {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
                            </span>
                        </button>
                        <button
                            className="settings-menu__item"
                            role="menuitem"
                            onClick={() => openSubMenu("captions")}
                        >
                            <span>Captions</span>
                            <span className="settings-menu__item-value">
                                {showCaptions ? "On" : "Off"}
                            </span>
                        </button>
                    </div>
                )}

                {activeMenu === "quality" && (
                    <div className="settings-menu__panel" role="menu">
                        <button
                            className="settings-menu__item settings-menu__item--header"
                            onClick={goBackToSettings}
                            aria-label="Back to settings"
                        >
                            <BackArrowIcon />
                            <span>Quality</span>
                        </button>
                        {hasMultipleQualities && (
                            <button
                                className={`settings-menu__item${isAutoQuality ? " settings-menu__item--active" : ""}`}
                                role="menuitemradio"
                                aria-checked={isAutoQuality}
                                onClick={handleAutoQualityToggle}
                            >
                                <span>Auto</span>
                                {isAutoQuality && <CheckIcon />}
                            </button>
                        )}
                        {[...qualities].reverse().map((q) => {
                            const idx = qualities.indexOf(q);
                            const isActive = !isAutoQuality && idx === selectedQualityIndex;
                            return (
                                <button
                                    key={q.height}
                                    className={`settings-menu__item${isActive ? " settings-menu__item--active" : ""}`}
                                    role="menuitemradio"
                                    aria-checked={isActive}
                                    onClick={() => handleQualitySelect(idx)}
                                >
                                    <span>{q.label}</span>
                                    {isActive && <CheckIcon />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeMenu === "speed" && (
                    <div className="settings-menu__panel" role="menu">
                        <button
                            className="settings-menu__item settings-menu__item--header"
                            onClick={goBackToSettings}
                            aria-label="Back to settings"
                        >
                            <BackArrowIcon />
                            <span>Playback speed</span>
                        </button>
                        {PLAYBACK_SPEEDS.map((speed) => {
                            const isActive = speed === playbackSpeed;
                            const label = speed === 1 ? "Normal" : `${speed}x`;
                            return (
                                <button
                                    key={speed}
                                    className={`settings-menu__item${isActive ? " settings-menu__item--active" : ""}`}
                                    role="menuitemradio"
                                    aria-checked={isActive}
                                    onClick={() => handleSpeedSelect(speed)}
                                >
                                    <span>{label}</span>
                                    {isActive && <CheckIcon />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeMenu === "captions" && (
                    <div className="settings-menu__panel" role="menu">
                        <button
                            className="settings-menu__item settings-menu__item--header"
                            onClick={goBackToSettings}
                            aria-label="Back to settings"
                        >
                            <BackArrowIcon />
                            <span>Captions</span>
                        </button>
                        <button
                            className={`settings-menu__item${!showCaptions ? " settings-menu__item--active" : ""}`}
                            role="menuitemradio"
                            aria-checked={!showCaptions}
                            onClick={() => {
                                if (showCaptions) handleToggleCaptions();
                                closeMenu();
                            }}
                        >
                            <span>Off</span>
                            {!showCaptions && <CheckIcon />}
                        </button>
                        <button
                            className={`settings-menu__item ${showCaptions ? " settings-menu__item--active" : ""}`}
                            role="menuitemradio"
                            aria-checked={showCaptions}
                            onClick={() => {
                                if (!showCaptions) handleToggleCaptions();
                                closeMenu();
                            }}
                        >
                            <span>English</span>
                            {showCaptions && <CheckIcon />}
                        </button>
                    </div>
                )}
            </div>
        );
    }, [activeMenu, hasMultipleQualities, isAutoQuality, selectedQualityIndex, qualities, playbackSpeed, showCaptions, handleAutoQualityToggle, handleQualitySelect, handleSpeedSelect, handleToggleCaptions, closeMenu, goBackToSettings, openSubMenu]);

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------
    return (
        <div className="video">
            <label
                className={`video-label ${showThumbnail ? "is-visible" : ""}`}
            >
                <h4>{title || "Add Video Title"}</h4>
            </label>

            <div
                className={`video-wrapper ${!isCursorVisible && isFullscreen ? 'cursor-hidden' : ''}`}
                ref={wrapperRef}
                tabIndex={0}
                role="application"
                aria-label={title || "Video player"}
                onMouseEnter={handleWrapperMouseEnter}
                onMouseMove={handleWrapperMouseMove}
                onMouseLeave={handleWrapperMouseLeave}
                onClick={handleWrapperClick}
            >
                {/* --- Main video element --- */}
                <video
                    ref={videoRef}
                    playsInline
                    preload="auto"
                    className="content"
                    poster={thumbnail || DEFAULT_THUMBNAIL}
                    onEnded={handleVideoEnd}
                    onPlay={handleOnPlay}
                    onPause={handleOnPause}
                    onLoadStart={handleLoadStart}
                    onWaiting={handleWaiting}
                    onCanPlay={handleCanPlay}
                    onCanPlayThrough={handleCanPlayThrough}
                    onPlaying={handlePlaying}
                    onStalled={handleStalled}
                    onSuspend={handleSuspend}
                    onProgress={handleProgress}
                    onLoadedMetadata={handleLoadedMetadata}
                >
                    {!hasMultipleQualities && (
                        <>
                            <source src={src || DEFAULT_SRC} type="video/mp4" />
                        </>
                    )}
                    <track
                        label="English captions"
                        kind="captions"
                        srclang="en"
                        src={captionSrc}
                        default
                    />
                    Your browser does not support HTML5 video.
                </video>

                {/* --- Hidden preview video for scrub thumbnails --- */}
                <video
                    ref={previewVideoRef}
                    className="preview-video"
                    src={previewNeeded ? (getCachedVideoUrl(currentSrc) || currentSrc) : undefined}
                    muted
                    preload="none"
                    onSeeked={handlePreviewSeeked}
                    tabIndex={-1}
                    aria-hidden="true"
                />

                {/* --- Thumbnail overlay --- */}
                <img
                    className={`video-thumbnail ${showThumbnail ? "is-visible" : ""}`}
                    src={thumbnail || DEFAULT_THUMBNAIL}
                    alt=""
                    aria-hidden="true"
                />

                {/* --- Initial play button overlay --- */}
                <div
                    className={`play-button-overlay ${showThumbnail ? "is-visible" : ""}`}
                    aria-hidden="true"
                >
                    <button
                        type="button"
                        className="play-button"
                        aria-label="Play video"
                        tabIndex={-1}
                    >
                        <svg width="64" height="64" viewBox="-20 -20 104 104">
                            <mask id={maskId}>
                                <circle cx="32" cy="32" r="52" fill="white" />
                                <path
                                    d="M13.3333 13.333C13.333 12.3945 13.5803 11.4727 14.0503 10.6604C14.5202 9.84814 15.1962 9.17427 16.0099 8.70682C16.8236 8.23937 17.7463 7.99489 18.6847 7.99808C19.6231 8.00126 20.5441 8.252 21.3546 8.72496L53.3466 27.3863C54.154 27.8548 54.8242 28.5269 55.2904 29.3356C55.7566 30.1443 56.0024 31.0612 56.0032 31.9947C56.004 32.9281 55.7598 33.8454 55.295 34.6549C54.8302 35.4644 54.1611 36.1377 53.3546 36.6076L21.3546 55.2743C20.5441 55.7473 19.6231 55.998 18.6847 56.0012C17.7463 56.0044 16.8236 55.7599 16.0099 55.2924C15.1962 54.825 14.5202 54.1511 14.0503 53.3389C13.5803 52.5266 13.333 51.6047 13.3333 50.6663V13.333Z"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </mask>
                            <circle
                                cx="32"
                                cy="32"
                                r="52"
                                fill="rgba(255,255,255,0.85)"
                                mask={`url(#${maskId})`}
                            />
                        </svg>
                    </button>
                </div>

                {/* --- Loading spinner --- */}
                <div
                    className={`spinner-overlay ${spinnerVisible ? "is-visible" : ""}`}
                    aria-hidden="true"
                >
                    <Spinner size="xlarge" />
                </div>

                {/* --- Captions display --- */}
                {showCaptions && !centered && variant === "immersive" && (
                    <div className="captions" aria-live="polite" aria-atomic="true">
                        <p>{captionsText}</p>
                    </div>
                )}

                {/* --- Top controls --- */}
                <div
                    className={`top-controls ${progressVisible ? "is-visible" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => clearControlsTimeout()}
                    onMouseLeave={() => {
                        if (isPlaying && !initialState) scheduleHideControls();
                    }}
                    onMouseMove={(e) => e.stopPropagation()}
                >
                    {showControls && (<>
                        <div className="left-side">
                            <div className="avatar">
                                <img src={profile || "https://yt3.ggpht.com/ytc/AIdro_nfXRvoxu5cFt2H4WhJfFLbL5SVdzmvEnFymnPzH3_1qPM=s48-c-k-c0x00ffffff-no-rj"} alt="" />
                            </div>
                            <div className="video-details">
                                <p className='title'>{title}</p>
                                <div className="user-details">
                                    <p className='username'>{username || "Joshua Weissman"}</p>
                                    {verified && <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                        <path d="M5.50586 0C5.92521 0.000147951 6.33822 0.106212 6.70605 0.307617C6.97506 0.454991 7.21389 0.650383 7.41113 0.882812C7.71758 0.85605 8.0279 0.886484 8.3252 0.972656C8.72994 1.09006 9.09848 1.30846 9.39648 1.60645C9.69445 1.90449 9.91291 2.27296 10.0303 2.67773C10.1164 2.9748 10.1458 3.2846 10.1191 3.59082C10.3521 3.78834 10.5487 4.02731 10.6963 4.29688C10.8977 4.66489 11.0029 5.07851 11.0029 5.49805C11.0029 5.91741 10.8976 6.33038 10.6963 6.69824C10.5488 6.96761 10.3519 7.20589 10.1191 7.40332C10.1458 7.70926 10.1162 8.01861 10.0303 8.31543C9.91323 8.71958 9.69558 9.08785 9.39844 9.38574C9.10122 9.68358 8.73299 9.90156 8.3291 10.0195C8.03276 10.106 7.72367 10.1362 7.41797 10.1104C7.22041 10.3445 6.98114 10.542 6.71094 10.6904C6.34239 10.8928 5.92824 10.9989 5.50781 10.999C5.08737 10.999 4.67327 10.8927 4.30469 10.6904C4.03441 10.542 3.79526 10.3446 3.59766 10.1104C3.29242 10.1367 2.98362 10.1082 2.6875 10.0225C2.28333 9.90541 1.91508 9.6878 1.61719 9.39062C1.31927 9.09333 1.10135 8.7253 0.983398 8.32129C0.896888 8.02484 0.865714 7.71597 0.891602 7.41016C0.656844 7.21273 0.458461 6.97349 0.30957 6.70312C0.106417 6.334 7.40919e-05 5.91939 0 5.49805C0 5.07653 0.10632 4.66127 0.30957 4.29199C0.458573 4.02142 0.656611 3.78149 0.891602 3.58398C0.865873 3.27849 0.896969 2.96996 0.983398 2.67383C1.10135 2.26982 1.31927 1.90179 1.61719 1.60449C1.91508 1.30735 2.28335 1.0897 2.6875 0.972656C2.98358 0.886977 3.29246 0.857476 3.59766 0.883789C3.79518 0.650684 4.03505 0.455298 4.30469 0.307617C4.67269 0.106205 5.08634 0 5.50586 0ZM7.3584 4.14453C7.16314 3.94927 6.84663 3.94927 6.65137 4.14453L5.00488 5.79102L4.3584 5.14453C4.16314 4.94927 3.84663 4.94927 3.65137 5.14453C3.4561 5.33979 3.4561 5.6563 3.65137 5.85156L4.65137 6.85156C4.84663 7.04682 5.16314 7.04682 5.3584 6.85156L7.3584 4.85156C7.55366 4.6563 7.55366 4.33979 7.3584 4.14453Z" fill="currentColor" />
                                    </svg>}
                                    <p><u>{` Subscribe`}</u></p>
                                </div>
                            </div>
                        </div>

                        <div className="right-side" style={{ position: "relative" }}>
                            <button
                                onClick={handleToggleCaptions}
                                className="video-button captions-control"
                                title="Captions"
                                aria-label="Toggle captions"
                                aria-pressed={showCaptions}
                            >
                                {showCaptions ? <CaptionsOnIcon /> : <CaptionsOffIcon />}
                            </button>

                            <button
                                onClick={handleTogglePip}
                                className="video-button"
                                title="Picture-in-picture"
                                aria-label="Picture-in-picture"
                            >
                                <PipIcon />
                            </button>

                            <button
                                onClick={handleToggleFullscreen}
                                className="video-button"
                                title={isFullscreen ? "Exit full screen" : "Full screen"}
                                aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
                            >
                                <FullscreenIcon />
                            </button>
                        </div></>
                    )}
                </div>

                {/* --- Bottom controls --- */}
                <div
                    className={`bottom-controls ${progressVisible ? "is-visible" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => clearControlsTimeout()}
                    onMouseLeave={() => {
                        if (isPlaying && !initialState) scheduleHideControls();
                    }}
                    onMouseMove={(e) => e.stopPropagation()}
                >
                    {!centered && showCaptions && variant === "cinematic" && (
                        <div className="captions cinematic" aria-live="polite" aria-atomic="true">
                            <p>{captionsText}</p>
                        </div>
                    )}
                    {/* --- Progress bar --- */}
                    <div
                        ref={trackRef}
                        className="progress-bar-hit-area"
                        onPointerDown={handleTrackPointerDown}
                        onPointerMove={handleTrackPointerMove}
                        onPointerUp={handleTrackPointerUp}
                        onPointerLeave={handleTrackPointerLeave}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="video-progress"
                            ref={sliderElRef}
                            role="slider"
                            aria-label="Video progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={0}
                            aria-valuetext={`0:00 of ${formattedDuration}`}
                        >
                            {variant === "immersive" && (
                                <div className="current-time">
                                    <p ref={currentTimeElRef}>0:00</p>
                                </div>
                            )}
                            <div className="progress-bar-track" ref={progressBarRef}>
                                <div
                                    className="progress-bar-buffered"
                                    ref={bufferedElRef}
                                    aria-hidden="true"
                                />
                                <div
                                    className="progress-bar-fill"
                                    ref={fillElRef}
                                />
                                <div
                                    className="progress-bar-dot"
                                    ref={dotElRef}
                                />
                            </div>
                            {variant === "immersive" && (
                                <div className="video-time">
                                    <p>{formattedDuration}</p>
                                </div>
                            )}
                        </div>

                        {showPreview && (
                            <div
                                className="progress-preview"
                                style={{ left: `${previewX}px` }}
                                aria-hidden="true"
                            >
                                <canvas
                                    ref={previewCanvasRef}
                                    width={PREVIEW_WIDTH}
                                    height={PREVIEW_HEIGHT}
                                    className="progress-preview-canvas"
                                />
                                <span className="progress-preview-time">
                                    {formatTime(previewTime)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* --- Controls row --- */}
                    {showControls && (
                        <div className="controls-row">
                            <div className="left-controls">
                                {!centered && (
                                    <>
                                        <button
                                            onClick={(e) => handleSkip(e, -10)}
                                            className="video-button"
                                            title="Rewind 10 seconds"
                                            aria-label="Rewind 10 seconds"
                                        >
                                            <SkipBackIcon />
                                        </button>
                                        <button
                                            onClick={handlePlayPauseClick}
                                            className="video-button"
                                            title={isPlaying ? "Pause" : "Play"}
                                            aria-label={isPlaying ? "Pause" : "Play"}
                                        >
                                            <PlayPauseIcon isPlaying={isPlaying} />
                                        </button>
                                        <button
                                            onClick={(e) => handleSkip(e, 10)}
                                            className="video-button"
                                            title="Forward 10 seconds"
                                            aria-label="Forward 10 seconds"
                                        >
                                            <SkipForwardIcon />
                                        </button>
                                    </>
                                )}

                                <div
                                    className={`volume-control${showVolumeSlider ? " is-expanded" : ""}`}
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                    onMouseLeave={() => setShowVolumeSlider(false)}
                                >
                                    <button
                                        onClick={toggleMute}
                                        className="video-button volume-control__button"
                                        title={isMuted ? "Unmute" : "Mute"}
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        <VolumeIcon volume={volume} isMuted={isMuted} />
                                    </button>
                                    <input
                                        type="range"
                                        className={`volume-slider ${showVolumeSlider ? "is-visible" : ""}`}
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        style={{
                                            background: `linear-gradient(to right, var(--gray-25) ${volumePercent}%, rgba(242, 242, 242, 0.3) ${volumePercent}%)`,
                                        }}
                                        aria-label="Volume"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={volumePercent}
                                    />
                                </div>

                                {variant === "cinematic" && (
                                    <div className="video-duration">
                                        <p className="current-timestamp" ref={currentTimeElRef2}>0:00</p>
                                        <p className="duration-timestamp">
                                            {" /"}
                                            {formattedDuration}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="center-controls">
                                {centered && (
                                    <>
                                        <button
                                            onClick={(e) => handleSkip(e, -10)}
                                            className="video-button"
                                            title="Rewind 10 seconds"
                                            aria-label="Rewind 10 seconds"
                                        >
                                            <SkipBackIcon />
                                        </button>
                                        <button
                                            onClick={handlePlayPauseClick}
                                            className="video-button"
                                            title={isPlaying ? "Pause" : "Play"}
                                            aria-label={isPlaying ? "Pause" : "Play"}
                                        >
                                            <PlayPauseIcon isPlaying={isPlaying} />
                                        </button>
                                        <button
                                            onClick={(e) => handleSkip(e, 10)}
                                            className="video-button"
                                            title="Forward 10 seconds"
                                            aria-label="Forward 10 seconds"
                                        >
                                            <SkipForwardIcon />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="right-controls" style={{ position: "relative" }}>
                                <button
                                    onClick={handleToggleCaptions}
                                    className="video-button captions-control"
                                    title="Captions"
                                    aria-label="Toggle captions"
                                    aria-pressed={showCaptions}
                                >
                                    {showCaptions ? <CaptionsOnIcon /> : <CaptionsOffIcon />}
                                </button>

                                <button
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={openSettings}
                                    className="video-button"
                                    title="Settings"
                                    aria-label="Settings"
                                    aria-expanded={activeMenu === "settings"}
                                    aria-haspopup="menu"
                                >
                                    <SettingsIcon />
                                </button>

                                {SettingsMenu}

                                <button
                                    onClick={handleTogglePip}
                                    className="video-button"
                                    title="Picture-in-picture"
                                    aria-label="Picture-in-picture"
                                >
                                    <PipIcon />
                                </button>

                                <button
                                    onClick={handleToggleFullscreen}
                                    className="video-button"
                                    title={isFullscreen ? "Exit full screen" : "Full screen"}
                                    aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
                                >
                                    <FullscreenIcon />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Large overlay controls --- */}
                <div
                    className={`custom-controls ${controlsVisible ? "is-visible" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => clearControlsTimeout()}
                    onMouseLeave={() => {
                        if (isPlaying && !initialState) scheduleHideControls();
                    }}
                    onMouseMove={(e) => e.stopPropagation()}
                    aria-hidden="true"
                >
                    <button
                        onClick={(e) => handleSkip(e, -10)}
                        className="video-button"
                        title="Rewind 10 seconds"
                        aria-label="Rewind 10 seconds"
                    >
                        <SkipBackIconLarge />
                    </button>

                    <button
                        onClick={handlePlayPauseClick}
                        className="video-button video-button-playpause"
                        title={isPlaying ? "Pause" : "Play"}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        <PlayPauseIcon isPlaying={isPlaying} />
                    </button>

                    <button
                        onClick={(e) => handleSkip(e, 10)}
                        className="video-button"
                        title="Forward 10 seconds"
                        aria-label="Forward 10 seconds"
                    >
                        <SkipForwardIconLarge />
                    </button>
                </div>
            </div>
        </div >
    );
};