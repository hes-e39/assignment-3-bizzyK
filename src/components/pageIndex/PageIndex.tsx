// PageIndex.tsx

import type React from 'react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from '../themeToggle/ThemeToggle';

const PageIndex: React.FC = () => {
    const location = useLocation();

    // Normalize the pathname to match defined routes
    const normalizedPath = location.pathname.split('?')[0]; // Remove query params
    const titles: Record<string, string> = {
        '/': 'Timers',
        '/docs': 'Documentation',
        '/add': 'Add Timer',
        '/history': 'History',
    };

    const pageTitle = titles[normalizedPath] || 'Assignment 2 - Elizabeth Koch';

    // Update document title dynamically
    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    // Debugging for unexpected paths
    if (!titles[normalizedPath]) {
        console.warn(`Unexpected pathname: ${normalizedPath}`);
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="theme-toggle-container">
                    <ThemeToggle />
                </div>
                <h1>{pageTitle}</h1>
            </header>
            <nav className="app-navigation">
                <ul>
                    <li>
                        <NavLink to="/" className={({isActive}) => (isActive ? 'active' : '')}>
                            Timers
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/docs" className={({isActive}) => (isActive ? 'active' : '')}>
                            Documentation
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/add" className={({isActive}) => (isActive ? 'active' : '')}>
                            Add Timer
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/history" className={({isActive}) => (isActive ? 'active' : '')}>
                            History
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <main className="app-main">
                <Outlet/>
            </main>
        </div>
    );
};

export default PageIndex;
