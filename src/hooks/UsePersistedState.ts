import { useEffect, useState } from 'react';

const usePersistedState = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        try {
            return storedValue !== null ? JSON.parse(storedValue) : initialValue;
        } catch {
            // If parsing fails, fall back to the initial value
            return storedValue ?? initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};

export default usePersistedState;
