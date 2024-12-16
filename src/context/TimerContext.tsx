//TimerContext.tsx

import  { createContext, useReducer, useContext } from 'react';
import type React from "react";
import type { TimerType } from '../views/AddTimer';
import { useEffect } from 'react';

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

// Utility function to reset an individual timer
const resetTimer = (timer: Timer): Timer => {
    // Determine reset time based on timer type
    const resetTime = (() => {
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
    })();

    return {
        ...timer,
        state: 'not running', // Reset to the initial state
        currentRound: timer.type === 'xy' || timer.type === 'tabata' ? 1 : undefined, // Reset currentRound to 1
        duration: resetTime, // Reset the duration
    };
};


const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
        // Add a timer
        case 'ADD_TIMER': {
            console.log('Adding Timer:', action.payload);
            return {
                ...state,
                timers: [...state.timers, action.payload],
            };
        }

        // Remove a timer
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
            return {
                ...state,
                timers: updatedTimers,
            };
        }

        case 'UPDATE_TIMER': {
            const { index, updatedTimer } = action.payload;
            const updatedTimers = [...state.timers];
            updatedTimers[index] = updatedTimer; // Replace the timer at the given index
            return { ...state, timers: updatedTimers };
        }

        // Load state only if not already loaded
        case 'LOAD_STATE': {
            return {
                ...state,
                timers: action.payload.timers || [],
                timerStatus: action.payload.timerStatus || TimerStatus.READY,
                activeTimerIndex: action.payload.activeTimerIndex ?? null,
                queueMode: action.payload.queueMode || 'sequential',
                globalTimer: action.payload.globalTimer || 0,
            };
        }

            // Called to start globalTimer
        case 'START_TIMER': {
                return {
                    ...state,
                    activeTimerIndex: action.payload,
                    timerStatus: TimerStatus.RUNNING,
                    globalTimer: 0
                };
            }

            // Used to toggle pause/resume the timer
        case 'TOGGLE_TIMER':
            return { ...state, timerStatus: action.payload};

            // Called whenever an individual timer completes
        case 'COMPLETE_CURRENT_TIMER': {
                const nextIndex = state.activeTimerIndex !== null ? state.activeTimerIndex + 1 : null;

                return {
                    ...state,
                    timers: state.timers.map((timer, index) =>
                        index === state.activeTimerIndex
                            ? {
                                ...timer,
                                state: 'completed',
                                currentRound: timer.type === 'xy' || timer.type === 'tabata' ? timer.rounds : undefined, // Set currentRound to max
                            }
                            : timer
                    ),
                    activeTimerIndex: nextIndex, // Move to the next timer or null if workout ends
                    globalTimer: 0, // Reset global timer
                };
            }

            // Resets all timers
        case 'RESET_TIMER_STATE': {
            return {
                ...state,
                timers: state.timers.map(resetTimer),
                activeTimerIndex: null,
                globalTimer: 0,
                timerStatus: TimerStatus.READY,
                lastSavedAt: undefined, // Explicitly reset
            };
        }

            // called every second while the app is running to increment globalTimer
        case 'SET_TIME': {
                return {...state, globalTimer: action.payload}
            }

            // called once all timers are complete
        case 'COMPLETE_ALL' : {
                return {
                    ...state,
                    globalTimer: 0,
                    activeTimerIndex: 0,
                    timerStatus: TimerStatus.COMPLETE
                }
            }

        default:
            throw new Error(`Unhandled action type: ${(action as TimerAction).type}`);
        }
    };

    const TimerContext = createContext<{ state: TimerState; dispatch: React.Dispatch<TimerAction> } | null>(null);

    export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [state, dispatch] = useReducer(timerReducer, initialState);

        // Save state to local storage periodically
        useEffect(() => {
            const saveStateToLocalStorage = () => {
                const { timers, timerStatus, activeTimerIndex, globalTimer } = state;
                const stateToSave = {
                    timers,
                    timerStatus,
                    activeTimerIndex,
                    globalTimer,
                    lastSavedAt: Date.now(), // Set lastSavedAt during save
                };
                localStorage.setItem('workoutState', JSON.stringify(stateToSave));
            };
            const intervalId = setInterval(saveStateToLocalStorage, 2000); // Save every 2 seconds
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

    export const useTimerContext = (): { state: TimerState; dispatch: React.Dispatch<TimerAction> } => {
        const context = useContext(TimerContext);
        if (!context) {
            throw new Error('useTimerContext must be used within a TimerProvider');
        }
        return context;
    };
