import { useMemo } from 'react';
import { getActiveFestival } from '../data/festivals';

const COLORS = ['#f0b429', '#f87171', '#60a5fa', '#4ade80', '#f472b6', '#fbbf24'];
const PARTICLES_PER_BURST = 10;

function makeBurst(id) {
    const left = 8 + Math.random() * 84;
    const burstHeight = 40 + Math.random() * 35;
    const delay = Math.random() * 3;
    const duration = 1.4 + Math.random() * 0.8;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const particles = Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
        const angle = (Math.PI * 2 * i) / PARTICLES_PER_BURST + Math.random() * 0.3;
        const radius = 18 + Math.random() * 10;
        return {
            id: i,
            dx: Math.cos(angle) * radius,
            dy: Math.sin(angle) * radius,
        };
    });

    return { id, left, burstHeight, delay, duration, color, particles };
}

export default function Fireworks() {
    const festival = getActiveFestival();
    const bursts = useMemo(() => Array.from({ length: 6 }, (_, i) => makeBurst(i)), []);

    if (!festival || !festival.hasFireworks) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {bursts.map((b) => (
                <div
                    key={b.id}
                    className="absolute animate-firework-launch"
                    style={{
                        left: `${b.left}%`,
                        '--burst-height': `${b.burstHeight}%`,
                        '--duration': `${b.duration}s`,
                        animationDelay: `${b.delay}s`,
                    }}
                >
                    {b.particles.map((p) => (
                        <span
                            key={p.id}
                            className="absolute w-1 h-1 rounded-full animate-firework-burst"
                            style={{
                                backgroundColor: b.color,
                                boxShadow: `0 0 4px ${b.color}`,
                                '--dx': `${p.dx}px`,
                                '--dy': `${p.dy}px`,
                                '--duration': `${b.duration}s`,
                                animationDelay: `${b.delay}s`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
