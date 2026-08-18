import { getActiveFestival } from '../data/festivals';

export default function FestivalMessage() {
    const festival = getActiveFestival();
    if (!festival || !festival.message) return null;

    return (
        <div className="bg-amber-1000 text-center text-sm font-medium text-white py-1.5 px-4">
            <span className="inline-block animate-message-pulse">{festival.message}</span>
        </div>
    );
}
