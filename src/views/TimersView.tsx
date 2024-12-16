// TimersView.tsx

import { useState, useEffect, useCallback } from 'react';
import {faPlay, faPause, faRedo, faForward, faTrash, faEdit} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/button/Button';
import { TimerStatus, useTimerContext } from '../context/TimerContext';
import { encodeTimersToURL } from '../utils/urlHelpers'; // Ensure this is imported
import DraggableTimer from '../components/timers/DraggableTimer';
import {useNavigate} from "react-router-dom"; // Import DraggableTimer

const TimersView = () => {
    const {state, dispatch} = useTimerContext();
    const {timers = [], activeTimerIndex, timerStatus, globalTimer} = state;
    const navigate = useNavigate();
    // Local state for total countdown
    const [remainingTime, setRemainingTime] = useState(0);

    // Calculate Total Workout Time
    const totalWorkoutTime = timers.reduce((total, timer) => {
        if (timer.type === 'xy') {
            return total + (timer.rounds || 1) * (timer.roundTime || 0);
        }
        if (timer.type === 'tabata') {
            return total + (timer.rounds || 1) * ((timer.workTime || 0) + (timer.restTime || 0));
        }
        return total + timer.duration;
    }, 0);

    // Update Remaining Time when workout starts
    useEffect(() => {
        if (timerStatus === TimerStatus.READY) {
            setRemainingTime(totalWorkoutTime); // Initialize the remaining time
        }
    }, [timerStatus, totalWorkoutTime]);

    // Timer Logic for global countdown
    const runTotalCountdown = useCallback(() => {
        if (timerStatus === TimerStatus.RUNNING && remainingTime > 0) {
            setRemainingTime((prev) => prev - 1);
        } else if (remainingTime === 0 && timerStatus === TimerStatus.RUNNING) {
            dispatch({ type: 'COMPLETE_ALL' }); // Mark workout complete when countdown reaches zero
        }
    }, [timerStatus, remainingTime, dispatch]);

    useEffect(() => {
        if (timerStatus === TimerStatus.RUNNING) {
            const intervalId = setInterval(() => {
                runTotalCountdown();
            }, 1000);
            return () => clearInterval(intervalId);
        }
    }, [runTotalCountdown, timerStatus]);

    // Control Handlers
    const handleBeginWorkout = () => timers.length > 0 && dispatch({ type: 'START_TIMER', payload: 0 });
    const handlePauseResumeWorkout = () => {
        dispatch({
            type: 'TOGGLE_TIMER',
            payload: timerStatus === TimerStatus.PAUSED ? TimerStatus.RUNNING : TimerStatus.PAUSED,
        });
    };
    const handleResetWorkout = () => dispatch({ type: 'RESET_TIMER_STATE' });

    // Format Time
    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    // Timer Logic
    const runTimer = useCallback(() => {
        if (timerStatus === TimerStatus.RUNNING) {
            dispatch({type: 'SET_TIME', payload: globalTimer + 1});
        }
    }, [timerStatus, globalTimer, dispatch]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            runTimer();
        }, 1000);
        return () => clearInterval(intervalId);
    }, [runTimer]);

    const handleTimerComplete = () => {
        if (activeTimerIndex !== null) {
            dispatch({
                type: 'COMPLETE_CURRENT_TIMER',
                payload: activeTimerIndex,
            });

            // If it's the last timer, mark workout complete
            if (activeTimerIndex === timers.length - 1) {
                dispatch({type: 'COMPLETE_ALL'});
            }
        }
    };

    const handleResetGlobalTimer = () => {
        if (timerStatus === TimerStatus.RUNNING) {
            dispatch({type: 'SET_TIME', payload: 0});
        }
    };

    // Handle Timer Reordering
    const moveTimer = (fromIndex: number, toIndex: number) => {
        const updatedTimers = [...timers];
        const [movedTimer] = updatedTimers.splice(fromIndex, 1);
        updatedTimers.splice(toIndex, 0, movedTimer);

        dispatch({ type: 'MOVE_TIMER', payload: { fromIndex, toIndex } });

        // Use encodeTimersToURL to update the URL
        const urlParams = encodeTimersToURL(updatedTimers);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    };

    return (
        <div>
            <div className="workout-header">
                <div className="workout-timers-info">
                    <div className="workout-time">
                        <strong>Total Workout Time:</strong> {formatTime(totalWorkoutTime)}
                    </div>
                    <div className="remaining-time">
                        <strong>Remaining Time:</strong> {formatTime(remainingTime)}
                    </div>
                </div>
                <div className="workout-controls">
                    <Button
                        label="Begin Workout"
                        onClick={handleBeginWorkout}
                        disabled={timerStatus !== TimerStatus.READY || timers.length === 0}
                        icon={faPlay}
                    />
                    <Button
                        label={timerStatus === TimerStatus.PAUSED ? 'Resume Workout' : 'Pause Workout'}
                        onClick={handlePauseResumeWorkout}
                        disabled={timerStatus === TimerStatus.COMPLETE || timerStatus === TimerStatus.READY}
                        icon={timerStatus === TimerStatus.PAUSED ? faPlay : faPause}
                    />
                    <Button
                        label="Reset Workout"
                        onClick={handleResetWorkout}
                        disabled={timers.length === 0 || timerStatus === TimerStatus.READY}
                        icon={faRedo}
                    />
                    <Button
                        label="Fast Forward"
                        onClick={handleTimerComplete}
                        disabled={timerStatus === TimerStatus.READY || timerStatus === TimerStatus.COMPLETE}
                        icon={faForward}
                    />
                </div>
                {timerStatus === TimerStatus.COMPLETE ? (
                    <div className="timer-message">🎉 Congratulations! Your workout is complete! 🎉</div>
                ) : timers.length === 0 ? (
                    <div className="timer-message">💪 No timers configured. Add a timer to get started. 💪</div>
                ) : null}
            </div>


            <div className="timers-container">
                {timers.map((timerObj, index) => (
                    <div key={timerObj.id} className="timer-wrapper">
                        <DraggableTimer
                            key={timerObj.id}
                            timer={timerObj}
                            index={index}
                            moveTimer={moveTimer}
                            isActive={index === activeTimerIndex}
                            timerStatus={timerStatus}
                            globalTimer={globalTimer}
                            timerComplete={handleTimerComplete}
                            resetTimer={handleResetGlobalTimer}
                        />
                        <div className="button-group">
                            <Button
                                type="primary"
                                label="Edit"
                                onClick={() => navigate(`/edit-timer/${timerObj.id}`)}
                                icon={faEdit}
                            />
                            <Button
                                type="danger"
                                label="Remove"
                                onClick={() => dispatch({type: 'REMOVE_TIMER', payload: index})}
                                icon={faTrash}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimersView;
