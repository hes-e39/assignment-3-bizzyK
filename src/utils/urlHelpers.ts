// utils/urlHelpers.ts

import type { Timer } from '../context/TimerContext';
// biome-ignore lint/style/useImportType: <explanation>
import { TimerType } from '../views/AddTimer.tsx';

type EncodedTimer = {
    id: string;
    t: string; // TimerType
    d: number; // Duration
    r: number; // Rounds
    w: number; // Work Time
    rs: number; // Rest Time
    n: string; // Name
};

export const encodeTimersToURL = (timers: Timer[]): string => {
    try {
        const minimalTimers: EncodedTimer[] = timers.map(timer => ({
            id: timer.id,
            t: timer.type, // Type
            d: timer.duration, // Duration
            r: timer.rounds || 0, // Rounds
            w: timer.workTime || 0, // Work Time
            rs: timer.restTime || 0, // Rest Time
            n: timer.name, // Include name
        }));
        const json = JSON.stringify(minimalTimers);
        const base64 = btoa(json);
        return `timers=${encodeURIComponent(base64)}`;
    } catch (error) {
        console.error('Error encoding timers:', error);
        return '';
    }
};

export const decodeTimersFromURL = (encodedTimers: string): Timer[] => {
    try {
        const decodedBase64 = decodeURIComponent(encodedTimers);
        const minimalTimers: EncodedTimer[] = JSON.parse(atob(decodedBase64));

        return minimalTimers.map(timer => ({
            id: timer.id || crypto.randomUUID(), // Ensure unique ID
            type: timer.t as TimerType, // Type conversion
            duration: timer.d || 0,
            rounds: timer.r || 1,
            workTime: timer.w || 0,
            restTime: timer.rs || 0,
            name: timer.n || `Timer ${crypto.randomUUID()}`, // Fallback for name
            state: 'not running', // Default state
            addedAt: Date.now(), // Add current timestamp
        }));
    } catch (error) {
        console.error('Error decoding timers:', error);
        return [];
    }
};
