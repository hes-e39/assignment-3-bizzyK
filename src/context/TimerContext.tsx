//TimerContext.tsx

import  { createContext, useReducer, useContext } from 'react';
import type React from "react";
import type { TimerType } from '../views/AddTimer';
import { useEffect } from 'react';
import { calculateTotalWorkoutTime, resetTimer } from '../utils/timerUtils';


export enum TimerStatus {
    READY = 'READY',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    COMPLETE = 'COMPLETE',
}

export type Timer = {
    id: string;
    type: TimerType;
    duration: number;
    name: string;
    state: 'not running' | 'running' | 'completed' | 'paused';
    addedAt: number;
    rounds?: number;
    roundTime?: number;
    workTime?: number;
    restTime?: number;
    currentRound?: number;
};

type TimerState = {
    timers: Timer[];
    timerStatus: TimerStatus;
    activeTimerIndex: number | null;
    queueMode: 'sequential';
    globalTimer: number;
    lastSavedAt?: number; // Timestamp for last save
};

type TimerAction =
    | { type: 'ADD_TIMER'; payload: Timer }
    | { type: 'REMOVE_TIMER'; payload: number }
    | { type: 'UPDATE_TIMER'; payload: { index: number; updatedTimer: Timer } }
    | { type: 'MOVE_TIMER'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'START_TIMER'; payload: number }
    | { type: 'TOGGLE_TIMER'; payload: TimerStatus }
    | { type: 'COMPLETE_CURRENT_TIMER'; payload: number }
    | { type: 'RESET_TIMER_STATE' }
    | { type: 'SET_TIME'; payload: number }
    | { type: 'COMPLETE_ALL' }
    | { type: 'LOAD_STATE'; payload: TimerState };

const initialState: TimerState = {
    timers: [],
    activeTimerIndex: null,
    queueMode: 'sequential',
    timerStatus: TimerStatus.READY,
    globalTimer: 0
};

// Reducer
const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
        case 'ADD_TIMER':
            return { ...state, timers: [...state.timers, action.payload] };

        case 'REMOVE_TIMER': {
            const updatedTimers = state.timers.filter((_timer, index) => index !== action.payload);
            return {
                ...state,
                timers: updatedTimers,
                activeTimerIndex: updatedTimers.length === 0 ? null : state.activeTimerIndex,
            };
        }

        case 'MOVE_TIMER': {
            const { fromIndex, toIndex } = action.payload;
            const updatedTimers = [...state.timers];
            const [movedTimer] = updatedTimers.splice(fromIndex, 1);
            updatedTimers.splice(toIndex, 0, movedTimer);
            return { ...state, timers: updatedTimers };
        }

        case 'UPDATE_TIMER': {
            const { index, updatedTimer } = action.payload;
            const updatedTimers = [...state.timers];
            updatedTimers[index] = updatedTimer;
            return { ...state, timers: updatedTimers };
        }

        case 'LOAD_STATE':
            return {
                ...state,
                timers: action.payload.timers || [],
                timerStatus: action.payload.timerStatus || TimerStatus.READY,
                activeTimerIndex: action.payload.activeTimerIndex ?? null,
                queueMode: action.payload.queueMode || 'sequential',
                globalTimer: action.payload.globalTimer || 0,
            };

        case 'START_TIMER':
            return { ...state, activeTimerIndex: action.payload, timerStatus: TimerStatus.RUNNING, globalTimer: 0 };

        case 'TOGGLE_TIMER':
            return { ...state, timerStatus: action.payload };

        case 'COMPLETE_CURRENT_TIMER': {
            const nextIndex = state.activeTimerIndex !== null ? state.activeTimerIndex + 1 : null;
            return {
                ...state,
                timers: state.timers.map((timer, index) =>
                    index === state.activeTimerIndex
                        ? { ...timer, state: 'completed', currentRound: timer.rounds }
                        : timer
                ),
                activeTimerIndex: nextIndex,
                globalTimer: 0,
            };
        }

        case 'RESET_TIMER_STATE':
            return {
                ...state,
                timers: state.timers.map(resetTimer),
                activeTimerIndex: null,
                globalTimer: 0,
                timerStatus: TimerStatus.READY,
            };

        case 'SET_TIME':
            return { ...state, globalTimer: action.payload };

        case 'COMPLETE_ALL': {
            const completedWorkout = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                totalDuration: calculateTotalWorkoutTime(state.timers),
                timers: state.timers.map((timer) => {
                    // Calculate total duration dynamically for 'xy' and 'tabata' timers
                    let totalDuration = timer.duration;

                    if (timer.type === 'xy' && timer.workTime !== undefined) {
                        totalDuration = (timer.rounds || 1) * timer.workTime;
                    } else if (timer.type === 'tabata' && timer.workTime !== undefined && timer.restTime !== undefined) {
                        totalDuration = (timer.rounds || 1) * (timer.workTime + timer.restTime);
                    }

                    return {
                        id: timer.id,
                        name: timer.name,
                        type: timer.type,
                        duration: totalDuration,
                        rounds: timer.rounds,
                        workTime: timer.workTime,
                        restTime: timer.restTime,
                    };
                }),
            };

            // Save to localStorage
            const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
            localStorage.setItem('workoutHistory', JSON.stringify([...history, completedWorkout]));

            return { ...state, globalTimer: 0, activeTimerIndex: null, timerStatus: TimerStatus.COMPLETE };
        }

        default:
            throw new Error(`Unhandled action type: ${(action as TimerAction).type}`);
    }
};

// Context
const TimerContext = createContext<{ state: TimerState; dispatch: React.Dispatch<TimerAction> } | null>(null);

// Provider
export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(timerReducer, initialState);

    // Save state to local storage periodically
    useEffect(() => {
        const saveStateToLocalStorage = () => {
            const { timers, timerStatus, activeTimerIndex, globalTimer } = state;
            const stateToSave = { timers, timerStatus, activeTimerIndex, globalTimer, lastSavedAt: Date.now() };
            localStorage.setItem('workoutState', JSON.stringify(stateToSave));
        };
        const intervalId = setInterval(saveStateToLocalStorage, 2000);
        return () => clearInterval(intervalId);
    }, [state]);

    // Load state from local storage on app load
    useEffect(() => {
        const savedState = localStorage.getItem('workoutState');
        if (savedState) {
            const parsedState = JSON.parse(savedState) as TimerState;
            dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
    }, []);

    return <TimerContext.Provider value={{ state, dispatch }}>{children}</TimerContext.Provider>;
};

// Hook
export const useTimerContext = (): { state: TimerState; dispatch: React.Dispatch<TimerAction> } => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
};
