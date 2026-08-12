import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteTransition() {
    const location = useLocation();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => setShow(false), 650);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!show) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50 overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2 text-2xl animate-bus-drive">
                🚌
            </div>
            <div className="h-full bg-accent-400 animate-road-fill" />
        </div>
    );
}