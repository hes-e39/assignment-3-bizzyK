//ThemeToggle.tsx
import { useEffect } from 'react';
import usePersistedState from '../../hooks/UsePersistedState.ts';

const ThemeToggle = () => {
    const [theme, setTheme] = usePersistedState<string>('theme', 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="theme-toggle-container" title="Switch mode">
            <span>{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
            <label className="switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                <span className="slider round" />
            </label>
        </div>
    );
};

export default ThemeToggle;
