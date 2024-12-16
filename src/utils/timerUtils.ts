// timerUtils.ts

import { Timer } from '../context/TimerContext';

export const calculateResetTime = (timer: Timer): number => {
    switch (timer.type) {
        case 'xy':
            return timer.roundTime || 0; // Reset to the round time
        case 'tabata':
            return timer.workTime || 0; // Reset to the work interval
        case 'countdown':
        case 'stopwatch':
            return timer.duration || 0; // Reset to the original duration
        default:
            return 0;
    }
};

export const calculateTotalWorkoutTime = (timers: Timer[]): number =>
    timers.reduce((total, timer) => {
        if (timer.type === 'xy') {
            return total + (timer.rounds || 1) * (timer.roundTime || 0);
        }
        if (timer.type === 'tabata') {
            return total + (timer.rounds || 1) * ((timer.workTime || 0) + (timer.restTime || 0));
        }
        return total + timer.duration;
    }, 0);

export const resetTimer = (timer: Timer): Timer => ({
    ...timer,
    state: 'not running',
    currentRound: timer.type === 'xy' || timer.type === 'tabata' ? 1 : undefined,
    duration: calculateResetTime(timer),
});