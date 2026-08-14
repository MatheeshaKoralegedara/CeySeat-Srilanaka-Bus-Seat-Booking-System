import { useEffect, useState } from 'react';
import { getActiveFestival } from '../data/festivals';

function isImagePath(icon) {
    return typeof icon === 'string' && icon.includes('.');
}

export default function FestiveOverlay() {
    const [festival] = useState(getActiveFestival);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!festival) return;

        // Fewer, smaller particles — this now falls inside the header strip,
        // not the full viewport, so the old full-page counts would overcrowd it.
        const count = 20;
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            icon: festival.icons[Math.floor(Math.random() * festival.icons.length)],
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 3,
            size: 12 + Math.random() * 8,
        }));
        setParticles(generated);
    }, [festival]);

    if (!festival) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) =>
                isImagePath(p.icon) ? (
                    <img
                        key={p.id}
                        src={p.icon}
                        alt=""
                        className="absolute animate-festive-fall opacity-70"
                        style={{
                            left: `${p.left}%`,
                            top: '-20px',
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ) : (
                    <span
                        key={p.id}
                        className="absolute animate-festive-fall opacity-70"
                        style={{
                            left: `${p.left}%`,
                            top: '-20px',
                            fontSize: `${p.size}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    >
                        {p.icon}
                    </span>
                )
            )}
        </div>
    );
}