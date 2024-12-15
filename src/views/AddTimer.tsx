// AddTimer.tsx

import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/button/Button';
import { useTimerContext } from '../context/TimerContext';

export type TimerType = 'stopwatch' | 'countdown' | 'xy' | 'tabata';

const AddTimer = () => {
    const [timerType, setTimerType] = useState<TimerType>('stopwatch');
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(10);
    const [roundTimeMinutes, setRoundTimeMinutes] = useState(1);
    const [roundTimeSeconds, setRoundTimeSeconds] = useState(0);
    const [workTimeMinutes, setWorkTimeMinutes] = useState(0);
    const [workTimeSeconds, setWorkTimeSeconds] = useState(20);
    const [restTimeMinutes, setRestTimeMinutes] = useState(0);
    const [restTimeSeconds, setRestTimeSeconds] = useState(10);
    const [rounds, setRounds] = useState(1);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { state, dispatch } = useTimerContext();
    const navigate = useNavigate();

    const handleAddTimer = () => {
        const duration = minutes * 60 + seconds;
        const roundTime = roundTimeMinutes * 60 + roundTimeSeconds;
        const workTime = workTimeMinutes * 60 + workTimeSeconds;
        const restTime = restTimeMinutes * 60 + restTimeSeconds;

        if (timerType === 'stopwatch' || timerType === 'countdown') {
            if (duration <= 0) {
                setError('Duration must be greater than 0.');
                return;
            }
        } else if (timerType === 'xy') {
            if (roundTime <= 0 || rounds <= 0) {
                setError('Round time and number of rounds must be greater than 0.');
                return;
            }
        } else if (timerType === 'tabata') {
            if (workTime <= 0 || restTime <= 0 || rounds <= 0) {
                setError('Work time, rest time, and number of rounds must be greater than 0.');
                return;
            }
        }
        setError('');

        const nextNumber = state.timers.length + 1;
        const defaultName = `Timer ${nextNumber}`;

        const newTimer = {
            id: uuidv4(),
            type: timerType,
            duration,
            roundTime,
            workTime,
            restTime,
            rounds,
            name: name.trim() || defaultName,
            state: 'not running' as const,
            addedAt: Date.now(),
            currentRound: 1,
        };

        dispatch({ type: 'ADD_TIMER', payload: newTimer });
        dispatch({ type: 'RESET_TIMER_STATE' });
        navigate('/');
    };

    const handleTimerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = e.target.value as TimerType;
        setTimerType(selectedType);

        if (selectedType === 'xy') {
            setRounds(3);
        } else if (selectedType === 'tabata') {
            setRounds(8);
        } else {
            setRounds(1);
        }
    };

    const renderTimeInput = (label: string, minutes: number, seconds: number, setMinutes: (value: number) => void, setSeconds: (value: number) => void, inputPrefix: string) => (
        <div className="form-group">
            <label htmlFor={`${label.toLowerCase().replace(' ', '-')}-minutes`}>{label}</label>
            <div className="time-input-pair">
                <div className="time-input">
                    <label htmlFor={`${inputPrefix}-minutes`}>Minutes:</label>
                    <input
                        id={`${inputPrefix}-minutes`}
                        type="number"
                        className="input-inline"
                        placeholder="0"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={e => setMinutes(Math.max(0, Number.parseInt(e.target.value || '0')))}
                    />
                </div>
                <div className="time-input">
                    <label htmlFor={`${inputPrefix}-seconds`}>Seconds:</label>
                    <input
                        id={`${inputPrefix}-seconds`}
                        type="number"
                        className="input-inline"
                        placeholder="30"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={e => setSeconds(Math.max(0, Number.parseInt(e.target.value || '0')))}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="timers-container">
            <div className="add-timer-page">
                <div className="timer-wrapper">
                    <h2>Add Timer</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddTimer();
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor="timerType">Timer Type:</label>
                            <select id="timerType" value={timerType} onChange={handleTimerTypeChange} className="input">
                                <option value="stopwatch">Stopwatch</option>
                                <option value="countdown">Countdown</option>
                                <option value="xy">XY</option>
                                <option value="tabata">Tabata</option>
                            </select>
                        </div>

                        {(timerType === 'stopwatch' || timerType === 'countdown') && renderTimeInput('Duration', minutes, seconds, setMinutes, setSeconds, 'duration')}

                        {timerType === 'xy' && (
                            <>
                                {renderTimeInput('Round Time', roundTimeMinutes, roundTimeSeconds, setRoundTimeMinutes, setRoundTimeSeconds, 'roundTime')}
                                <div className="form-group">
                                    <label htmlFor="rounds">Number of Rounds:</label>
                                    <input id="rounds" type="number" className="input" min="1" value={rounds} onChange={e => setRounds(Number.parseInt(e.target.value || '1'))} />
                                </div>
                            </>
                        )}

                        {timerType === 'tabata' && (
                            <>
                                {renderTimeInput('Work Time', workTimeMinutes, workTimeSeconds, setWorkTimeMinutes, setWorkTimeSeconds, 'workTime')}
                                {renderTimeInput('Rest Time', restTimeMinutes, restTimeSeconds, setRestTimeMinutes, setRestTimeSeconds, 'restTime')}
                                <div className="form-group">
                                    <label htmlFor="rounds">Number of Rounds:</label>
                                    <input id="rounds" type="number" className="input" min="1" value={rounds} onChange={e => setRounds(Number.parseInt(e.target.value || '1'))} />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">Name (optional):</label>
                            <input id="name" type="text" className="input" placeholder="e.g., Warm-Up" value={name} onChange={e => setName(e.target.value)} />
                        </div>

                        <div className="form-buttons">
                            <Button htmlType="submit" label="Add Timer" icon={faPlus} />
                            <Button type="secondary" label="Cancel" icon={faTimes} onClick={() => navigate('/')} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTimer;
