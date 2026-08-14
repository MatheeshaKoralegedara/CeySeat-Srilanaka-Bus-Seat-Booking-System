import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { key: 'morning', icon: '🌅' };
    } else if (hour >= 12 && hour < 17) {
        return { key: 'afternoon', icon: '☀️' };
    } else if (hour >= 17 && hour < 21) {
        return { key: 'evening', icon: '🌇' };
    } else {
        return { key: 'night', icon: '🌙' };
    }
}

export default function TimeGreeting() {
    const { t } = useTranslation();
    const [greeting, setGreeting] = useState(getGreeting);

    useEffect(() => {
        // Recheck every minute in case the page stays open across a time boundary
        const interval = setInterval(() => setGreeting(getGreeting()), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden md:flex items-center gap-1.5 text-brand-100 text-sm">
            <span>{greeting.icon}</span>
            <span>{t(`greeting.${greeting.key}`)}</span>
        </div>
    );
}
