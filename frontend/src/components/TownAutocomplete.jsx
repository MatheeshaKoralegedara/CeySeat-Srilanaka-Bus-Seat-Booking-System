import { useState, useRef, useEffect } from 'react';
import { sriLankaTowns } from '../data/sriLankaTowns';

export default function TownAutocomplete({ value, onChange, placeholder, label }) {
    const [query, setQuery] = useState(value || '');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const suggestions = query.trim()
        ? sriLankaTowns
            .filter((t) => t.toLowerCase().startsWith(query.trim().toLowerCase()))
            .slice(0, 8)
        : sriLankaTowns.slice(0, 8);

    function select(town) {
        setQuery(town);
        onChange(town);
        setOpen(false);
    }

    return (
        <div className="relative" ref={wrapperRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    {label}
                </label>
            )}
            <input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoComplete="off"
            />

            {open && suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {suggestions.map((town) => (
                        <li key={town}>
                            <button
                                type="button"
                                onClick={() => select(town)}
                                className="w-full text-left px-4 py-2 hover:bg-brand-50 text-sm text-gray-700"
                            >
                                {town}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}