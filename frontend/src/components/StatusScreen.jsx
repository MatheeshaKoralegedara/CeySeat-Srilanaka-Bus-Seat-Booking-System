const ICON_COLORS = {
    success: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400',
    error: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
};

export default function StatusScreen({ variant = 'error', icon, title, message, action }) {
    return (
        <div className="max-w-md mx-auto text-center py-16">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${ICON_COLORS[variant]}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    {icon}
                </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            {action}
        </div>
    );
}
