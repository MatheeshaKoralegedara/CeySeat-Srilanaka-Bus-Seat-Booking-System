export default function BookingSteps({ current }) {
    const steps = ['Select Seats', 'Payment', 'Confirmation'];

    return (
        <div className="flex items-center justify-center gap-2 mb-8 max-w-md mx-auto">
            {steps.map((label, i) => {
                const stepNum = i + 1;
                const done = stepNum < current;
                const active = stepNum === current;
                return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    done
                                        ? 'bg-brand-600 text-white'
                                        : active
                                        ? 'bg-accent-500 text-brand-900'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {done ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNum
                                )}
                            </div>
                            <span className={`text-[11px] font-medium hidden sm:block ${active ? 'text-brand-700 dark:text-brand-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                {label}
                            </span>
                        </div>
                        {stepNum < steps.length && (
                            <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-4 rounded ${done ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
