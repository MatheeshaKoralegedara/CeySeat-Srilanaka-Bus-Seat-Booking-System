import { getActiveFestival } from '../data/festivals';

export default function PeraheraMarquee() {
    const festival = getActiveFestival();
    if (!festival || festival.name !== 'perahera') return null;

    // Repeat the icon sequence enough times to fill wide screens seamlessly
    const sequence = Array(10).fill(festival.icons).flat();

    return (
        <div className="bg-amber-1000 overflow-hidden py-2">
            <div className="flex animate-perahera-scroll">
                {sequence.map((icon, i) => (
                    <img
                        key={i}
                        src={icon}
                        alt=""
                        className="h-8 w-8 mx-1 flex-shrink-0"
                    />
                ))}
                {/* Duplicate for seamless loop */}
                {sequence.map((icon, i) => (
                    <img
                        key={`dup-${i}`}
                        src={icon}
                        alt=""
                        className="h-8 w-8 mx-1 flex-shrink-0"
                    />
                ))}
            </div>
        </div>
    );
}