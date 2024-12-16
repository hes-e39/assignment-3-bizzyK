// HistoryView.tsx

import { useEffect, useState } from 'react';

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

    const renderTimerDetails = (timer: TimerSummary) => {
        return (
            <>
                <p><strong>{timer.name}</strong> ({timer.type})</p>
                <p><strong>Duration:</strong> {formatTime(timer.duration)}</p>

                {/* Display rounds only for 'xy' or 'tabata' */}
                {['xy', 'tabata'].includes(timer.type) && timer.rounds && (
                    <p><strong>Rounds:</strong> {timer.rounds}</p>
                )}

                {/* Work Time and Rest Time for 'tabata' or 'xy' */}
                {['tabata', 'xy'].includes(timer.type) && timer.workTime !== undefined && (
                    <p><strong>Work Time:</strong> {formatTime(timer.workTime)}</p>
                )}
                {['tabata', 'xy'].includes(timer.type) && timer.restTime !== undefined && (
                    <p><strong>Rest Time:</strong> {formatTime(timer.restTime)}</p>
                )}
            </>
        );
    };

    return (
        <div className="timers-container">
            {workoutHistory.length === 0 ? (
                <p>No workouts completed yet.</p>
            ) : (
                workoutHistory.map((workout) => (
                    <div key={workout.id} className="workout-summary">
                        <h3>{new Date(workout.date).toLocaleString()}</h3>
                        <p><strong>Total Duration:</strong> {formatTime(workout.totalDuration)}</p>
                        <div className="timers-summary">
                            <h4>Timers:</h4>
                            <ul>
                                {workout.timers.map((timer) => (
                                    <li key={timer.id} className="timer-item">
                                        {renderTimerDetails(timer)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HistoryView;