export default function DetailsModal({ open, title, rows, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 scale-in max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== '').map((row) => (
                        <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{row.label}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{row.value}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2.5 rounded-xl transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
