// Timer.tsx

import { useEffect, useState } from 'react';
import type React from 'react';
import DisplayRounds from '../displayRounds/DisplayRounds';
import DisplayTime from '../displayTime/DisplayTime';
import { TimerStatus } from '../../context/TimerContext';
import { useNavigate } from 'react-router-dom';

interface TimerProps {
    id: string;
    name: string;
    type: 'stopwatch' | 'countdown' | 'xy' | 'tabata';
    workTime?: number;
    restTime?: number;
    roundTime?: number;
    rounds?: number;
    duration: number;
    state: 'not running' | 'running' | 'completed' | 'paused';
    addedAt: number;
    isActive: boolean;
    timerStatus: TimerStatus;
    globalTimer: number;
    timerComplete: () => void;
    resetTimer: () => void;
}

const Timer: React.FC<TimerProps> = ({
                                         id,
                                         name,
                                         type,
                                         workTime = 20,
                                         restTime = 10,
                                         roundTime = 60,
                                         rounds = 1,
                                         duration,
                                         state,
                                         isActive,
                                         timerStatus,
                                         globalTimer,
                                         timerComplete,
                                         resetTimer,
                                     }) => {
    const navigate = useNavigate();
    const [currentRound, setCurrentRound] = useState(1);
    const [isWorkInterval, setIsWorkInterval] = useState(true);
    const [totalTime, setTotalTime] = useState(
        type === 'stopwatch' ? duration :
            type === 'xy' ? roundTime :
                type === 'tabata' ? workTime : 0
    );
    const [timeDisplay, setTimeDisplay] = useState(
        type === 'countdown' ? duration : 0
    );

    useEffect(() => {
        if (state === 'completed') {
            setCurrentRound(rounds); // Set currentRound to the maximum when completed
        }
    }, [state, rounds]);

    // Reset timer state on READY
    useEffect(() => {
        if (timerStatus === TimerStatus.READY) {
            setCurrentRound(1);
            setIsWorkInterval(true);
            setTimeDisplay(type === 'countdown' ? duration : 0);
            setTotalTime(
                type === 'stopwatch' ? duration :
                    type === 'xy' ? roundTime :
                        type === 'tabata' ? workTime : 0
            );
        }
    }, [timerStatus, duration, type, roundTime, workTime]);

    useEffect(() => {
        if (isActive && timerStatus === TimerStatus.RUNNING) {
            setTimeDisplay(
                type === 'countdown'
                    ? Math.max(duration - globalTimer, 0) // Ensure countdown doesn't go negative
                    : globalTimer // Stopwatch displays the elapsed time
            );

            // Countdown logic
            if (type === 'countdown' && globalTimer >= duration) {
                timerComplete();
            }

            // Stopwatch logic
            if (type === 'stopwatch' && globalTimer >= duration) {
                timerComplete();
            }

            // XY Timer logic
            if (type === 'xy') {
                if (roundTime - globalTimer <= 0 && currentRound <= rounds) {
                    setCurrentRound((prev) => prev + 1);
                    resetTimer();
                }
                if (currentRound > rounds) {
                    timerComplete();
                }
            }

            // Tabata Timer logic
            if (type === 'tabata') {
                if (isWorkInterval && globalTimer >= workTime) {
                    setIsWorkInterval(false);
                    resetTimer();
                } else if (!isWorkInterval && globalTimer >= restTime) {
                    setIsWorkInterval(true);
                    setCurrentRound((prev) => prev + 1);
                    resetTimer();
                }
                if (currentRound > rounds) {
                    timerComplete();
                }
            }
        }
    }, [
        isActive,
        timerStatus,
        globalTimer,
        duration,
        type,
        currentRound,
        rounds,
        roundTime,
        workTime,
        restTime,
        isWorkInterval,
        timerComplete,
        resetTimer,
    ]);



    const title = {
        stopwatch: 'Stopwatch',
        countdown: 'Countdown Timer',
        xy: 'XY Timer',
        tabata: 'Tabata Timer',
    }[type];

    if (!title) {
        return <div>Invalid timer type.</div>;
    }

    return (
        <div className="timer-container">
            <h2>{name}</h2>
            <h3>{title}</h3>
            {(type === 'tabata' || type === 'xy') && (
                <DisplayRounds currentRound={currentRound} totalRounds={rounds}/>
            )}
            {type === 'tabata' && (
                <div className={`interval-display ${isWorkInterval ? 'work' : 'rest'}`}>
                    {isWorkInterval ? 'Work' : 'Rest'} Interval
                </div>
            )}
            {state === 'completed' ? (
                <p>Complete!</p>
            ) : timerStatus === TimerStatus.PAUSED && isActive ? (
                <p>Paused</p>
            ) : (
                <DisplayTime currentTime={timeDisplay} type={type} totalTime={totalTime}/>
            )}
            <button onClick={() => navigate(`/edit-timer/${id}`)}>Edit</button>
        </div>
    );
};

export default Timer;