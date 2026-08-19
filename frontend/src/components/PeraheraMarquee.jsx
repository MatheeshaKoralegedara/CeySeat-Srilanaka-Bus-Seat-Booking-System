import { useNavigate } from 'react-router-dom';
import { getActiveFestival } from '../data/festivals';

export default function PeraheraMarquee() {
    const festival = getActiveFestival();
    const navigate = useNavigate();

    if (!festival || festival.name !== 'perahera') return null;

    // Repeat the icon sequence enough times to fill wide screens seamlessly
    const sequence = Array(8).fill(festival.icons).flat();

    return (
        <button
            onClick={() => navigate('/schedules?from=Colombo&to=Kandy')}
            className="w-full bg-brand-900 hover:bg-brand-800 transition-colors group relative overflow-hidden"
        >
            <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-accent-400 text-xs font-bold whitespace-nowrap tracking-wide hidden sm:inline">
                    ESALA PERAHERA SEASON
                </span>
                <span className="text-brand-100 text-xs whitespace-nowrap hidden md:inline">
                    Book your Kandy trip now →
                </span>

                <div className="flex-1 overflow-hidden">
                    <div className="flex animate-perahera-scroll">
                        {sequence.map((icon, i) => (
                            <img key={i} src={icon} alt="" className="h-7 w-7 mx-3 flex-shrink-0 drop-shadow-sm" />
                        ))}
                        {/* Duplicate for seamless loop */}
                        {sequence.map((icon, i) => (
                            <img key={`dup-${i}`} src={icon} alt="" className="h-7 w-7 mx-3 flex-shrink-0 drop-shadow-sm" />
                        ))}
                    </div>
                </div>

                <span className="text-accent-400 text-xs font-semibold whitespace-nowrap group-hover:underline">
                    Book Now →
                </span>
            </div>
        </button>
    );
}
