const SEAT_STYLES = {
    available: 'bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/40 hover:-translate-y-0.5 cursor-pointer shadow-sm',
    selected: 'bg-brand-600 border-2 border-brand-600 text-white cursor-pointer shadow-md shadow-brand-600/30 scale-105',
    taken: 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed',
};

export default function SeatButton({ seat, state, gender, onToggle }) {
    return (
        <button
            disabled={state === 'taken'}
            onClick={() => onToggle(seat.seatNo)}
            aria-label={`Seat ${seat.seatNo}, ${state}`}
            className={`w-11 h-11 rounded-lg font-semibold text-xs transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${SEAT_STYLES[state]}`}
        >
            {seat.seatNo}
            {state === 'taken' && gender && (
                <span
                    aria-hidden="true"
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        gender === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
                    }`}
                />
            )}
        </button>
    );
}
