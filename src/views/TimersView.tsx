// TimersView.tsx

import { useEffect, useCallback } from 'react';
import { faPlay, faPause, faRedo, faForward, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/button/Button';
import TimerComponent from '../components/timers/Timer';
import { TimerStatus, useTimerContext } from '../context/TimerContext';


const TimersView = () => {
    const { state, dispatch } = useTimerContext();
    const { timers = [], activeTimerIndex, timerStatus, globalTimer } = state;

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

    // Format Time
    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    // Timer Logic
    const runTimer = useCallback(() => {
        if (timerStatus === TimerStatus.RUNNING) {
            dispatch({ type: 'SET_TIME', payload: globalTimer + 1 });
        }
    }, [timerStatus, globalTimer, dispatch]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            runTimer();
        }, 1000);
        return () => clearInterval(intervalId);
    }, [runTimer]);

    // Control Handlers
    const handleBeginWorkout = () => timers.length > 0 && dispatch({ type: 'START_TIMER', payload: 0 });

    const handlePauseResumeWorkout = () => {
        dispatch({
            type: 'TOGGLE_TIMER',
            payload: timerStatus === TimerStatus.PAUSED ? TimerStatus.RUNNING : TimerStatus.PAUSED,
        });
    };

    const handleResetWorkout = () => dispatch({ type: 'RESET_TIMER_STATE' });

    const handleTimerComplete = () => {
        if (activeTimerIndex !== null) {
            dispatch({
                type: 'COMPLETE_CURRENT_TIMER',
                payload: activeTimerIndex,
            });

            // If it's the last timer, mark workout complete
            if (activeTimerIndex === timers.length - 1) {
                dispatch({ type: 'COMPLETE_ALL' });
            }
        }
    };

    const handleResetGlobalTimer = () => {
        if (timerStatus === TimerStatus.RUNNING) {
            dispatch({ type: 'SET_TIME', payload: 0 });
        }
    };

    return (
        <div>
            <div className="workout-header">
                <p>Total Workout Time: {formatTime(totalWorkoutTime)}</p>
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
                        <TimerComponent
                            {...timerObj}
                            isActive={index === activeTimerIndex}
                            timerStatus={timerStatus}
                            globalTimer={globalTimer}
                            state={timerObj.state}
                            timerComplete={handleTimerComplete}
                            resetTimer={handleResetGlobalTimer}
                        />
                        <Button
                            type="danger"
                            label="Remove"
                            onClick={() => dispatch({type: 'REMOVE_TIMER', payload: index})}
                            icon={faTrash}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimersView;