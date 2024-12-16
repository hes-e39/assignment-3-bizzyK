// utils/urlHelpers.ts

import type { Timer } from '../context/TimerContext';

export const encodeTimersToURL = (timers: Timer[]): string => {
    try {
        const encoded = JSON.stringify(timers);
        return `timers=${encodeURIComponent(encoded)}`;
    } catch (error) {
        console.error('Error encoding timers:', error);
        return '';
    }
};

export const decodeTimersFromURL = (encodedTimers: string): Timer[] => {
    try {
        const decoded = decodeURIComponent(encodedTimers);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding timers:', error);
        return [];
    }
};