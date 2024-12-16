// AddTimer.tsx

import { faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/button/Button';
import { TimerStatus, useTimerContext } from '../context/TimerContext';
import { decodeTimersFromURL, encodeTimersToURL } from '../utils/urlHelpers';

export type TimerType = 'stopwatch' | 'countdown' | 'xy' | 'tabata';

const AddTimer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state, dispatch } = useTimerContext();

    // Editing Logic
    const editingTimer = id ? state.timers.find(timer => timer.id === id) : null;

    // Timer Form State
    const [timerType, setTimerType] = useState<TimerType>(editingTimer?.type || 'stopwatch');
    const [minutes, setMinutes] = useState(editingTimer ? Math.floor(editingTimer.duration / 60) : 0);
    const [seconds, setSeconds] = useState(editingTimer ? editingTimer.duration % 60 : 10);
    const [roundTimeMinutes, setRoundTimeMinutes] = useState(editingTimer ? Math.floor((editingTimer.roundTime || 0) / 60) : 1);
    const [roundTimeSeconds, setRoundTimeSeconds] = useState(editingTimer ? (editingTimer.roundTime || 0) % 60 : 0);
    const [workTimeMinutes, setWorkTimeMinutes] = useState(editingTimer ? Math.floor((editingTimer.workTime || 0) / 60) : 0);
    const [workTimeSeconds, setWorkTimeSeconds] = useState(editingTimer ? (editingTimer.workTime || 0) % 60 : 20);
    const [restTimeMinutes, setRestTimeMinutes] = useState(editingTimer ? Math.floor((editingTimer.restTime || 0) / 60) : 0);
    const [restTimeSeconds, setRestTimeSeconds] = useState(editingTimer ? (editingTimer.restTime || 0) % 60 : 10);
    const [rounds, setRounds] = useState(editingTimer?.rounds || 1);
    const [name, setName] = useState(editingTimer?.name || '');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAddOrUpdateTimer = () => {
        const editingIndex = id ? state.timers.findIndex(timer => timer.id === id) : -1;

        const duration = minutes * 60 + seconds;
        const roundTime = roundTimeMinutes * 60 + roundTimeSeconds;
        const workTime = workTimeMinutes * 60 + workTimeSeconds;
        const restTime = restTimeMinutes * 60 + restTimeSeconds;

        if (timerType === 'stopwatch' || timerType === 'countdown') {
            if (duration <= 0) {
                setError('Duration must be greater than 0.');
                return;
            }
        } else if (timerType === 'xy' && (roundTime <= 0 || rounds <= 0)) {
            setError('Round time and number of rounds must be greater than 0.');
            return;
        } else if (timerType === 'tabata' && (workTime <= 0 || restTime <= 0 || rounds <= 0)) {
            setError('Work time, rest time, and number of rounds must be greater than 0.');
            return;
        }

        const trimmedName = name.trim();
        const defaultName = `Timer ${state.timers.length + 1}`;
        const timerName = trimmedName || defaultName;

        // Validate for duplicate names
        const isDuplicateName = state.timers.some((timer, index) => timer.name === timerName && index !== editingIndex);

        if (isDuplicateName) {
            setError('Timer name must be unique within the workout.');
            return;
        }

        setError('');

        const updatedTimer = {
            id: id || uuidv4(),
            type: timerType,
            duration,
            roundTime,
            workTime,
            restTime,
            rounds,
            name: timerName,
            state: 'not running' as const,
            addedAt: id ? state.timers.find(timer => timer.id === id)?.addedAt || Date.now() : Date.now(),
        };

        const updatedTimers = editingIndex >= 0 ? state.timers.map((t, idx) => (idx === editingIndex ? updatedTimer : t)) : [...state.timers, updatedTimer];

        const urlParams = encodeTimersToURL(updatedTimers);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);

        if (editingIndex >= 0) {
            dispatch({ type: 'UPDATE_TIMER', payload: { index: editingIndex, updatedTimer } });
        } else {
            dispatch({ type: 'ADD_TIMER', payload: updatedTimer });
        }

        navigate('/');
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const timersFromUrl = urlParams.get('timers');
        if (timersFromUrl) {
            try {
                const decodedTimers = decodeTimersFromURL(timersFromUrl);
                if (Array.isArray(decodedTimers) && decodedTimers.length > 0) {
                    dispatch({
                        type: 'LOAD_STATE',
                        payload: {
                            timers: decodedTimers,
                            timerStatus: TimerStatus.READY,
                            activeTimerIndex: null, // Default value
                            queueMode: 'sequential', // Default value
                            globalTimer: 0, // Default value
                        },
                    });
                }
            } catch (error) {
                console.error('Error parsing timers from URL:', error);
            }
        }
    }, [dispatch]);

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
                    <h2>{editingTimer ? 'Edit Timer' : 'Add Timer'}</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddOrUpdateTimer();
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
                            <Button
                                htmlType="submit"
                                label={editingTimer ? 'Save Timer' : 'Add Timer'} // Dynamic label
                                icon={editingTimer ? faSave : faPlus} // Dynamic icon
                            />
                            <Button type="secondary" label="Cancel" icon={faTimes} onClick={() => navigate('/')} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTimer;
