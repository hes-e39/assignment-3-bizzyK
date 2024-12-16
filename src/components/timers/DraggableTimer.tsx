// DraggableTimer.tsx

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TimerComponent from "../timers/Timer";
import {Timer, TimerStatus} from '../../context/TimerContext';


interface DraggableTimerProps {
    timer: Timer;
    index: number;
    moveTimer: (from: number, to: number) => void;
    isActive: boolean;
    timerStatus: TimerStatus;
    globalTimer: number;
    timerComplete: () => void;
    resetTimer: () => void;
}

const DraggableTimer: React.FC<DraggableTimerProps> = ({
                                                           timer,
                                                           index,
                                                           moveTimer,
                                                           isActive,
                                                           timerStatus,
                                                           globalTimer,
                                                           timerComplete,
                                                           resetTimer,
                                                       }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'TIMER',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'TIMER',
        hover: (draggedItem: { index: number }) => {
            if (draggedItem.index !== index) {
                moveTimer(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <TimerComponent
                {...timer}
                isActive={isActive}
                timerStatus={timerStatus}
                globalTimer={globalTimer}
                timerComplete={timerComplete}
                resetTimer={resetTimer}
            />
        </div>
    );
};

export default DraggableTimer;