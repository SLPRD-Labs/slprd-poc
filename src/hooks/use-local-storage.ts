import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

type UseLocalStorageOutput<T> = [T, Dispatch<SetStateAction<T>>];

export const useLocalStorage = <T>(key: string, defaultValue: T): UseLocalStorageOutput<T> => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);

            if (item !== null) {
                return JSON.parse(item) as T;
            }

            localStorage.setItem(key, JSON.stringify(defaultValue));
        } catch (e) {
            console.error(`Error while initializing local storage key "${key}":`, e);
        }

        return defaultValue;
    });

    const setValue: Dispatch<SetStateAction<T>> = newValueOrFactory => {
        try {
            setStoredValue(prevState => {
                const newState =
                    newValueOrFactory instanceof Function
                        ? newValueOrFactory(prevState)
                        : newValueOrFactory;

                if (newState === prevState) return prevState;

                localStorage.setItem(key, JSON.stringify(newState));
                return newState;
            });
        } catch (e) {
            console.error(`Error while setting local storage key "${key}":`, e);
        }
    };

    return [storedValue, setValue];
};
