// HistoryView.tsx

import { useEffect, useState } from 'react';
import {useTimerContext} from '../context/TimerContext';
import type {TimerType} from "./AddTimer.tsx";
import {faRedo} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/button/Button.tsx";

interface TimerSummary {
    id: string;
    name: string;
    type: string;
    duration: number;
    rounds?: number;
    workTime?: number;
    restTime?: number;
}

interface WorkoutSummary {
    id: string;
    date: string;
    totalDuration: number;
    timers: TimerSummary[];
}

const HistoryView: React.FC = () => {
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutSummary[]>([]);
    const { dispatch } = useTimerContext(); // Access the context to update timers

    useEffect(() => {
        const savedHistory = localStorage.getItem('workoutHistory');
        if (savedHistory) {
            setWorkoutHistory(JSON.parse(savedHistory));
        }
    }, []);

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    const repeatWorkout = (timers: TimerSummary[]) => {
        const repeatedTimers = timers.map((timer) => ({
            id: `${timer.id}-${Date.now()}`, // Generate a new unique ID
            type: timer.type as TimerType, // Explicitly cast to TimerType
            duration: timer.duration,
            name: timer.name || 'Repeated Timer',
            state: 'not running' as const,
            addedAt: Date.now(),
            rounds: timer.rounds,
            workTime: timer.workTime,
            restTime: timer.restTime,
        }));

        // Dispatch to reset the timer state and add the repeated timers
        dispatch({ type: 'RESET_TIMER_STATE' }); // Clear any active timers
        repeatedTimers.forEach((timer) => dispatch({ type: 'ADD_TIMER', payload: timer }));
    };

    const renderTimerDetails = (timer: TimerSummary) => {
        return (
            <div className="timer-card">
                <h5>{timer.name || 'Unnamed Timer'} ({timer.type})</h5>
                <p><strong>Duration:</strong> {formatTime(timer.duration)}</p>

                {/* Display rounds only for 'xy' or 'tabata' */}
                {['xy', 'tabata'].includes(timer.type) && timer.rounds && (
                    <p><strong>Rounds:</strong> {timer.rounds}</p>
                )}

                {/* Work Time and Rest Time for 'tabata' or 'xy' */}
                {['tabata', 'xy'].includes(timer.type) && timer.workTime !== undefined && (
                    <p><strong>Work Time:</strong> {formatTime(timer.workTime)}</p>
                )}
                {['tabata'].includes(timer.type) && timer.restTime !== undefined && (
                    <p><strong>Rest Time:</strong> {formatTime(timer.restTime)}</p>
                )}
            </div>
        );
    };

    return (
        <div className="timers-container">
            {workoutHistory.length === 0 ? (
                <div className="timer-message">💪 No workouts completed yet. Add a timer to get started. 💪</div>
            ) : (
                workoutHistory.map((workout) => (
                    <div key={workout.id} className="workout-summary">
                        <h3>{new Date(workout.date).toLocaleString()}</h3>
                        <p><strong>Total Duration:</strong> {formatTime(workout.totalDuration)}</p>
                        <div className="timers-summary">
                            <h4>Timers:</h4>
                            <div className="timers-grid">
                                {workout.timers.map((timer) => (
                                    <div key={timer.id} className="timer-item">
                                        {renderTimerDetails(timer)}
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="primary"
                                icon={faRedo}
                                label="Repeat Workout"
                                onClick={() => repeatWorkout(workout.timers)}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HistoryView;