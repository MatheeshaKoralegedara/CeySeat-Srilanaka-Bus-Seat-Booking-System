const VARIANTS = {
    brand: 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300',
    brandStrong: 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
};

export default function Badge({ variant = 'brand', className = '', children }) {
    return (
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${VARIANTS[variant]} ${className}`}>
            {children}
        </span>
    );
}
