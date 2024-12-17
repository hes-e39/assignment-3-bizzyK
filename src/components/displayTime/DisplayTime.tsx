//DisplayTime.tsx

import React from 'react';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

interface DisplayTimeProps {
    currentTime: number; // Updated to be more descriptive
    totalTime: number;
    type: 'stopwatch' | 'countdown' | 'xy' | 'tabata';
}

const DisplayTime: React.FC<DisplayTimeProps> = ({ currentTime, totalTime, type }) => (
    <div className="time-display">
        {formatTime(currentTime)}
        
        {
            type !== 'countdown' && <> / {formatTime(totalTime)}</>
        }
    </div>
);

export default DisplayTime;
