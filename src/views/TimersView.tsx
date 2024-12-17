// TimersView.tsx
import { faEdit, faForward, faPause, faPlay, faRedo, faShare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import DraggableTimer
import Button from '../components/button/Button';
import DraggableTimer from '../components/timers/DraggableTimer';
import { TimerStatus, useTimerContext } from '../context/TimerContext';
import { calculateTotalWorkoutTime } from '../utils/timerUtils';

import { decodeTimersFromURL, encodeTimersToURL } from '../utils/urlHelpers';

const TimersView = () => {
    const { state, dispatch } = useTimerContext();
    const { timers = [], activeTimerIndex, timerStatus, globalTimer } = state;
    const navigate = useNavigate();

    const [remainingTime, setRemainingTime] = useState(0);
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [shortenedURL, setShortenedURL] = useState<string | null>(null);
    const [timersLoaded, setTimersLoaded] = useState(false);

    // Load timers from URL query string
    useEffect(() => {
        if (!timersLoaded) {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedTimers = urlParams.get('timers');

            if (encodedTimers) {
                const decodedTimers = decodeTimersFromURL(encodedTimers);
                if (decodedTimers.length > 0) {
                    dispatch({
                        type: 'LOAD_STATE',
                        payload: {
                            timers: decodedTimers,
                            timerStatus: TimerStatus.READY,
                            activeTimerIndex: null,
                            globalTimer: 0,
                            queueMode: 'sequential',
                        },
                    });
                }
            }
            setTimersLoaded(true); // Mark timers as loaded
        }
    }, [dispatch, timersLoaded]);

    // Update remaining time when timers are ready
    useEffect(() => {
        if (timerStatus === TimerStatus.READY) {
            setRemainingTime(calculateTotalWorkoutTime(timers));
        }
    }, [timerStatus, timers]);

    const totalWorkoutTime = calculateTotalWorkoutTime(timers);

    // Share Workout Logic
    const handleShareWorkout = async () => {
        const urlParams = encodeTimersToURL(state.timers);
        const workoutURL = `${window.location.origin}${window.location.pathname}?${urlParams}`;
        const apiURL = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(workoutURL)}`;

        try {
            const response = await fetch(apiURL);
            if (!response.ok) {
                console.error('Failed to fetch shortened URL');
                setShareMessage('Failed to generate a shortened URL.');
                setShortenedURL(null);
                return;
            }

            const shortURL = await response.text();

            // Write the URL to the clipboard
            await navigator.clipboard.writeText(shortURL);

            // Update the message and shortened URL states
            setShortenedURL(shortURL);
            setShareMessage('Workout URL copied to clipboard!');

            // Auto-hide the message after 5 seconds
            setTimeout(() => {
                setShareMessage(null);
                setShortenedURL(null);
            }, 5000);
        } catch (error) {
            console.error('Error sharing workout URL:', error);
            setShareMessage('Failed to generate a shortened URL.');
            setShortenedURL(null); // Ensure previous values are cleared
        }
    };

    // Timer Logic for global countdown
    const runTotalCountdown = useCallback(() => {
        if (timerStatus === TimerStatus.RUNNING && remainingTime > 0) {
            setRemainingTime(prev => prev - 1);
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
            dispatch({ type: 'SET_TIME', payload: globalTimer + 1 });
        }
    }, [timerStatus, globalTimer, dispatch]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            runTimer();
        }, 1000);
        return () => clearInterval(intervalId);
    }, [runTimer]);

    // Add this inside TimersView.tsx
    const handleTimerComplete = () => {
        if (activeTimerIndex !== null) {
            const currentTimer = timers[activeTimerIndex];

            // Calculate the time to deduct based on the timer type
            const timeToDeduct =
                currentTimer.type === 'xy' && currentTimer.rounds && currentTimer.roundTime
                    ? currentTimer.rounds * currentTimer.roundTime
                    : currentTimer.type === 'tabata' && currentTimer.rounds && currentTimer.workTime && currentTimer.restTime
                      ? currentTimer.rounds * (currentTimer.workTime + currentTimer.restTime)
                      : currentTimer.duration;

            // Deduct the time from remainingTime
            setRemainingTime(prev => Math.max(0, prev - timeToDeduct));

            // Dispatch COMPLETE_CURRENT_TIMER to move to the next timer
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
                    <Button label="Begin Workout" onClick={handleBeginWorkout} disabled={timerStatus !== TimerStatus.READY || timers.length === 0} icon={faPlay} />
                    <Button
                        label={timerStatus === TimerStatus.PAUSED ? 'Resume Workout' : 'Pause Workout'}
                        onClick={handlePauseResumeWorkout}
                        disabled={timerStatus === TimerStatus.COMPLETE || timerStatus === TimerStatus.READY}
                        icon={timerStatus === TimerStatus.PAUSED ? faPlay : faPause}
                    />
                    <Button label="Reset Workout" onClick={handleResetWorkout} disabled={timers.length === 0 || timerStatus === TimerStatus.READY} icon={faRedo} />
                    <Button label="Fast Forward" onClick={handleTimerComplete} disabled={timerStatus === TimerStatus.READY || timerStatus === TimerStatus.COMPLETE} icon={faForward} />
                    <Button label="Share Workout" onClick={handleShareWorkout} icon={faShare} />
                </div>
                <div className="timer-message">{shareMessage}</div>
                <div className="timer-message">
                    {shortenedURL && (
                        <a href={shortenedURL} target="_blank" rel="noopener noreferrer">
                            {shortenedURL}
                        </a>
                    )}
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
                            <Button type="primary" label="Edit" onClick={() => navigate(`/edit-timer/${timerObj.id}`)} icon={faEdit} />
                            <Button
                                type="danger"
                                label="Remove"
                                onClick={() => {
                                    dispatch({ type: 'REMOVE_TIMER', payload: index });
                                }}
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
