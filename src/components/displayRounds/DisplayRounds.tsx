import React from 'react';

interface DisplayRoundsProps {
    currentRound: number;
    totalRounds: number;
}

const DisplayRounds: React.FC<DisplayRoundsProps> = ({ currentRound, totalRounds }) => (
    <div className="round-display">
        <span>Round {currentRound} of {totalRounds}</span>
    </div>
);

export default DisplayRounds;