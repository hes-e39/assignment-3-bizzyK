// DocumentationView.tsx

import { faSun } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/button/Button';
import DisplayRounds from '../components/displayRounds/DisplayRounds';
import DisplayTime from '../components/displayTime/DisplayTime';
import DocumentComponent from '../components/documentation/DocumentComponent';
import ThemeToggle from '../components/themeToggle/ThemeToggle';
import Timer from '../components/timers/Timer';
import { TimerStatus } from '../context/TimerContext';

const DocumentationView = () => {
    return (
        <div className="timers-container">
            {/* Timer Documentation */}
            <DocumentComponent
                title="Timer"
                component={
                    <Timer
                        id="mock-id"
                        name="Mock Timer"
                        type="stopwatch"
                        duration={10}
                        state="not running"
                        addedAt={Date.now()}
                        isActive={false}
                        timerStatus={TimerStatus.RUNNING}
                        globalTimer={0}
                        timerComplete={() => alert('Timer Complete!')}
                        resetTimer={() => alert('Timer Reset!')}
                    />
                }
                propDocs={[
                    { prop: 'id', description: 'Unique identifier for the timer.', type: 'string', defaultValue: 'undefined' },
                    { prop: 'name', description: 'Name of the timer.', type: 'string', defaultValue: 'Timer' },
                    {
                        prop: 'type',
                        description: 'Defines the type of timer: stopwatch, countdown, xy, or tabata.',
                        type: "'stopwatch' | 'countdown' | 'xy' | 'tabata'",
                        defaultValue: "'stopwatch'",
                    },
                    { prop: 'duration', description: 'The total duration of the timer in seconds.', type: 'number', defaultValue: '10' },
                    { prop: 'state', description: 'Current state of the timer.', type: "'not running' | 'running' | 'paused' | 'completed'", defaultValue: "'not running'" },
                    { prop: 'addedAt', description: 'Timestamp when the timer was created.', type: 'number', defaultValue: 'undefined' },
                    { prop: 'isActive', description: 'Whether the timer is currently active.', type: 'boolean', defaultValue: 'false' },
                    { prop: 'timerStatus', description: 'The global status of all timers.', type: 'TimerStatus', defaultValue: 'undefined' },
                    { prop: 'globalTimer', description: 'The global timer value in seconds.', type: 'number', defaultValue: '0' },
                    { prop: 'timerComplete', description: 'Callback function when the timer completes.', type: 'function', defaultValue: 'undefined' },
                    { prop: 'resetTimer', description: 'Callback function to reset the timer.', type: 'function', defaultValue: 'undefined' },
                ]}
            />

            {/* Button Documentation */}
            <DocumentComponent
                title="Button"
                component={<Button label="Sample Button" icon={faSun} onClick={() => alert('Button clicked!')} />}
                propDocs={[
                    { prop: 'label', description: 'Text displayed on the button.', type: 'string', defaultValue: "''" },
                    { prop: 'onClick', description: 'Function called when the button is clicked.', type: 'function', defaultValue: 'undefined' },
                    { prop: 'disabled', description: 'Disables the button when true.', type: 'boolean', defaultValue: 'false' },
                    { prop: 'type', description: 'Defines the button style.', type: "'primary' | 'secondary' | 'danger'", defaultValue: "'primary'" },
                    { prop: 'htmlType', description: 'HTML button type.', type: "'button' | 'submit' | 'reset'", defaultValue: "'button'" },
                    { prop: 'icon', description: 'Icon to display on the button (FontAwesome).', type: 'IconDefinition', defaultValue: 'undefined' },
                    { prop: 'loading', description: 'Displays a spinner when true.', type: 'boolean', defaultValue: 'false' },
                ]}
            />

            {/* DisplayTime Documentation */}
            <DocumentComponent
                title="DisplayTime"
                component={<DisplayTime currentTime={0} totalTime={10} type="stopwatch" />}
                propDocs={[
                    { prop: 'currentTime', description: 'Current time in seconds.', type: 'number', defaultValue: '0' },
                    { prop: 'totalTime', description: 'Total time in seconds.', type: 'number', defaultValue: 'undefined' },
                    { prop: 'type', description: 'Type of timer (stopwatch, countdown, etc.).', type: 'string', defaultValue: 'undefined' },
                ]}
            />

            {/* DisplayRounds Documentation */}
            <DocumentComponent
                title="DisplayRounds"
                component={<DisplayRounds currentRound={1} totalRounds={10} />}
                propDocs={[
                    { prop: 'currentRound', description: 'The current round number.', type: 'number', defaultValue: '1' },
                    { prop: 'totalRounds', description: 'The total number of rounds.', type: 'number', defaultValue: '1' },
                ]}
            />

            {/* Documentation for more generic components can go here */}
            <DocumentComponent
                title="Theme Toggle"
                component={<ThemeToggle />}
                propDocs={[
                    { prop: 'theme', description: 'Managed internally as light or dark mode.', type: "'light' | 'dark'", defaultValue: "'light'" },
                    { prop: 'onToggle', description: 'Toggles the theme between light and dark.', type: 'function', defaultValue: 'undefined' },
                ]}
            />
        </div>
    );
};

export default DocumentationView;
